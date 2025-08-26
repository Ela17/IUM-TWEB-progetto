/**
 * @fileoverview Controller per la gestione della persistenza dei messaggi nel sistema di chat.
 * Questo modulo contiene funzioni che assicurano l'affidabilità della memorizzazione dei messaggi, anche
 * in caso di disconnessione o indisponibilità del database, implementando un
 * meccanismo di recovery con una coda locale e retry automatici.
 */

const proxyService = require("../../services/proxyService");
const uniqueTimestampGenerator = require("../utils/uniqueTimestampGenerator");
const {
  PERSISTENCE_MODES,
  TIMING_CONFIG,
  MESSAGE_LIMITS,
} = require("../constants/socketConstants");

// Attributi recovery
let mode = PERSISTENCE_MODES.NORMAL; // 'normal' | 'recovery' | 'syncing'
let messageQueue = []; // Queue per messaggi in stato di recovery
let recoveryTimer = null; // Timer per tentare riconnessione
const recoveryInterval = TIMING_CONFIG.RECOVERY_INTERVAL; // Prova recovery ogni 30s
const requestTimeout = TIMING_CONFIG.REQUEST_TIMEOUT;
const maxQueueSize = TIMING_CONFIG.MAX_QUEUE_SIZE;

/**
 * @function saveMessage
 * @description Salva un messaggio nel sistema di persistenza.
 * Se il sistema è in modalità "normal", tenta il salvataggio diretto su MongoDB.
 * In modalità "recovery", il messaggio viene accodato localmente.
 * Un `uniqueTimestamp` viene generato e aggiunto al `messageData` prima del salvataggio.
 * @param {Object} messageData - L'oggetto contenente i dati del messaggio
 * @returns {Promise<void>} Promise che si risolve quando il messaggio è elaborato
 * @throws {ValidationError} Se i dati del messaggio non sono validi
 */
const saveMessage = async (messageData) => {
  try {
    const validationResult = validateMessageData(messageData);

    if (!validationResult.isValid) {
      const error = new Error("Invalid message parameters");
      error.name = "ValidationError";
      error.code = "VALIDATION_ERROR_MESSAGE_DATA";
      error.additionalDetails = validationResult.errors;

      throw error;
    }

    const formattedMsg = formatMessage(messageData);

    if (
      mode === PERSISTENCE_MODES.NORMAL ||
      mode === PERSISTENCE_MODES.SYNCING
    ) {
      await saveDirectToMongoDB(formattedMsg);
    } else {
      console.warn(`⚠️ Recovery Mode activated: message added to queue`);
      addToQueue(formattedMsg);
    }
  } catch (error) {
    console.error("❌ Error in message services -> saveMessage", error);
    // Non rilanciamo l'errore perchè il chiamante non deve bloccarsi! Entriamo in recovery!
  }
};

/**
 * @function formatMessage
 * @description Formatta i dati del messaggio aggiungendo un timestamp unico generato.
 * @param {object} messageData - L'oggetto contenente i dati del messaggio grezzi.
 * @returns {object} Il messaggio formattato con l'ID univoco e i campi richiesti.
 * @throws {Error} Se la generazione dell'ID o l'accesso ai dati del messaggio fallisce.
 */
const formatMessage = (messageData) => {
  try {
    console.log(uniqueTimestampGenerator);
    const formattedMessage = {
      uniqueTimestamp: uniqueTimestampGenerator.generateId(),
      roomName: messageData.roomName,
      userName: messageData.userName,
      message: messageData.message.trim(),
    };
    return formattedMessage;
  } catch (error) {
    throw error;
  }
};

/**
 * @function validateMessageData
 * @description Valida i dati di un messaggio prima del salvataggio
 * @param {Object} messageData - L'oggetto contenente i dati del messaggio da validare
 * @param {string} messageData.roomName - Il nome della stanza della chat
 * @param {string} messageData.userName - Il nome dell'utente che ha inviato il messaggio
 * @param {string} messageData.message - Il contenuto del messaggio
 * @returns {{isValid: boolean, errors: string[]}} Risultato della validazione con lista errori
 */
const validateMessageData = (messageData) => {
  const errors = [];

  if (!messageData.roomName || messageData.roomName.trim().length === 0) {
    errors.push("roomName is required");
  }

  if (!messageData.userName || messageData.userName.trim().length === 0) {
    errors.push("userName is required");
  }

  if (!messageData.message || messageData.message.trim().length === 0) {
    errors.push("message is required");
  }

  if (
    messageData.message &&
    messageData.message.length > MESSAGE_LIMITS.MAX_MESSAGE_LENGTH
  ) {
    errors.push(
      `message too long (max ${MESSAGE_LIMITS.MAX_MESSAGE_LENGTH} characters)`,
    );
  }

  const isValid = errors.length === 0;

  return { isValid, errors };
};

/**
 * @function saveDirectToMongoDB
 * @description Tenta di salvare un messaggio direttamente su MongoDB tramite il servizio proxy.
 * In caso di fallimento, attiva la modalità di recovery e accoda il messaggio.
 * @param {object} formattedMessage - Il messaggio formattato da salvare.
 */
const saveDirectToMongoDB = async (formattedMessage) => {
  try {
    const response = await proxyService.callOtherExpress(
      "/api/messages",
      "POST",
      formattedMessage,
    );

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`MongoDB save failed with status: ${response.status}`);
    }

    console.log(
      `${response.status} 💾 Message ${formattedMessage.uniqueTimestamp} saved`,
    );

    return response.data;
  } catch (error) {
    console.error(`❌ Direct save error:: ${error.message}`);

    activateRecoveryMode();
    addToQueue(formattedMessage);
    console.log(
      `📦 Message ${formattedMessage.uniqueTimestamp} added to queue after failure`,
    );
  }
};

/**
 * @function activateRecoveryMode
 * @description Attiva la modalità di recovery se non è già attiva.
 * Imposta la modalità su "recovery" e avvia il timer.
 */
const activateRecoveryMode = () => {
  if (mode === PERSISTENCE_MODES.RECOVERY) {
    return;
  }

  console.warn("🚨 ACTIVATING RECOVERY MODE PERSISTENCE");
  console.warn("📦 All new messages will go to local queue");

  mode = PERSISTENCE_MODES.RECOVERY;
  startRecoveryTimer();
};

/**
 * @function startRecoveryTimer
 * @description Avvia il timer che periodicamente tenta il recovery della connessione a MongoDB.
 * Previene l'avvio di più timer contemporaneamente.
 */
const startRecoveryTimer = () => {
  if (recoveryTimer) {
    return;
  }

  recoveryTimer = setInterval(async () => {
    await attemptRecovery();
  }, recoveryInterval);
};

/**
 * @function attemptRecovery
 * @description Tenta il processo di recovery e sincronizzazione della coda dei messaggi.
 * Esegue un health check su MongoDB e, se il database è disponibile,
 * avvia l'esecuzione del recovery effettivo tramite `executeRecovery`.
 * In caso di fallimento dell'health check o altri errori, la modalità rimane 'recovery'
 * e il processo verrà ritentato dopo un intervallo specifico.
 */
const attemptRecovery = async () => {
  console.log("++++ Attempting MongoDB recovery... +++");
  try {
    // Test con health check
    const response = await proxyService.callOtherExpress("/api/health", "GET");

    if (response.status === 200) {
      console.log("✅ MongoDB available - starting queue syncing");
      await executeRecovery();
    } else {
      console.log("⚠️ MongoDB not available: continuing recovery mode");
    }
  } catch (error) {
    console.log(
      `Recovery failed: ${error.message} - retrying in ${recoveryInterval / 1000}s`,
    );
  }
};

/**
 * @function executeRecovery
 * @description Esegue il processo di svuotamento della coda dei messaggi verso MongoDB.
 * Imposta la modalità su "syncing" e tenta di inviare tutti i messaggi accodati in ordine FIFO.
 * Se un messaggio fallisce durante il sync, la modalità torna a "recovery" e
 * il processo si interrompe per un nuovo tentativo successivo.
 * Al termine del processo, se la coda è completamente svuotata, il sistema
 * ritorna alla modalità `normal` e il timer di recovery viene fermato.
 */
const executeRecovery = async () => {
  mode = PERSISTENCE_MODES.SYNCING;
  const queueSize = messageQueue.length;
  console.log(`Starting sync of ${queueSize} messages from queue... +++\n`);
  let successCount = 0;

  // Processo la queue in modo sequenziale per evitare overload
  while (messageQueue.length > 0) {
    const queuedMessage = messageQueue[0];
    try {
      await saveDirectToMongoDB(queuedMessage);
      successCount++;
      messageQueue.shift(); // FIFO
    } catch (error) {
      console.error(
        `❌ Queue sync: failed ${queuedMessage.uniqueTimestamp} - ${error.message} \n`,
      );
      mode = PERSISTENCE_MODES.RECOVERY;
      console.log("Switching from syncing to recovery");
      return;
    }
  }

  console.log(`✅ Persistence recovery completed: ${successCount} successes`);

  mode = PERSISTENCE_MODES.NORMAL; // Torna normal mode
  stopRecoveryTimer(); // Ferma timer
  messageQueue = []; // Svuota queue

  console.log("🟢 NORMAL MODE RESTORED 🟢");
};

/**
 * @function stopRecoveryTimer
 * @description Ferma il timer di recovery.
 */
const stopRecoveryTimer = () => {
  if (recoveryTimer) {
    clearInterval(recoveryTimer);
    recoveryTimer = null;
  }
};

/**
 * @function addToQueue
 * @description Aggiunge un messaggio alla coda di recovery.
 * Applica una politica FIFO (First-In, First-Out) e previene l'overflow della coda.
 * @param {object} messageData - Il messaggio da aggiungere alla coda.
 */
const addToQueue = (messageData) => {
  messageQueue.push(messageData);

  if (messageQueue.length > maxQueueSize) {
    const removed = messageQueue.shift();
    console.warn(
      `⚠️ Persistence queue overflow - removed message ${removed.uniqueTimestamp}`,
    );
  }
};

module.exports = {
  saveMessage,
};
