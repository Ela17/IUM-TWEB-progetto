const proxyCallerServices = require("../../services/ProxyCallerService");
const uniqueTimestampGenerator = require("../utils/uniqueTimestampGenerator");
const {
  PERSISTENCE_MODES,
  MESSAGE_LIMITS,
  TIMING_CONFIG,
  CHAT_ERROR_CODES,
} = require("../constants/socketConstants");

/**
 * @class MessagesPersistenceController
 * @description Controller per la gestione della persistenza dei messaggi nel sistema di chat.
 * Questa classe assicura l'affidabilità della memorizzazione dei messaggi, anche
 * in caso di disconnessione o indisponibilità del database, implementando un
 * meccanismo di recovery con una coda locale e retry automatici.
 */
class MessagesPersistenceController {
  constructor(proxyService = null) {
    this.proxyService = proxyService || proxyCallerServices;
    this.uniqueTimestampGenerator = uniqueTimestampGenerator;

    // Attributi recovery
    this.mode = PERSISTENCE_MODES.NORMAL; // 'normal' | 'recovery' | 'syncing'
    this.messageQueue = []; // Queue per messaggi in stato di recovery
    this.recoveryTimer = null; // Timer per tentare riconnessione
    this.recoveryInterval = 30000; // Prova recovery ogni 30s
    this.requestTimeout = 5000;
    this.maxQueueSize = 1000;
  }

  /**
   * @method saveMessage
   * @description Salva un messaggio nel sistema di persistenza.
   * Se il sistema è in modalità "normal", tenta il salvataggio diretto su MongoDB.
   * In modalità "recovery", il messaggio viene accodato localmente.
   * Un `uniqueTimestamp` viene generato e aggiunto al `messageData` prima del salvataggio.
   * @param {object} messageData - L'oggetto contenente i dati del messaggio.
   * @param {string} messageData.roomName - Il nome della stanza della chat.
   * @param {string} messageData.userName - Il nome dell'utente che ha inviato il messaggio.
   * @param {string} messageData.message - Il contenuto del messaggio.
   * @throws {Error} Se i dati del messaggio non sono validi (ValidationError).
   * @throws {Error} Se si verifica un errore generico durante il salvataggio.
   */
  async saveMessage(messageData) {
    try {
      const isValidMsg = this._validateMessageData(messageData);

      if (!isValidMsg.isValid) {
        const error = new Error("Invalid message parameters");
        error.name = "ValidationError";
        error.code = "VALIDATION_ERROR_MESSAGE_DATA";
        error.additionalDetails = isValidMsg.errors;

        throw error;
      }

      const formattedMsg = this._formatMessage(messageData);

      if (
        this.mode === PERSISTENCE_MODES.NORMAL ||
        this.mode === PERSISTENCE_MODES.SYNCING
      ) {
        await this._saveDirectToMongoDB(formattedMsg);
      } else {
        console.warn(`⚠️ Recovery Mode activated: message added to queue`);
        this._addToQueue(formattedMsg);
      }
    } catch (error) {
      console.error("❌ Error in message services -> saveMessage", error);
      // Non rilanciamo l'errore perchè il chiamante non deve bloccarsi! Entriamo in recovery!
    }
  }

  /**
   * Formatta i dati del messaggio aggiungendo un timestamp unico generato.
   * @private
   * @param {object} messageData - L'oggetto contenente i dati del messaggio grezzi.
   * @returns {object} Il messaggio formattato con l'ID univoco e i campi richiesti.
   * @throws {Error} Se la generazione dell'ID o l'accesso ai dati del messaggio fallisce.
   */
  _formatMessage(messageData) {
    try {
      console.log(this.uniqueTimestampGenerator);
      const formattedMessage = {
        uniqueTimestamp: this.uniqueTimestampGenerator.generateId(),
        roomName: messageData.roomName,
        userName: messageData.userName,
        message: messageData.message.trim(),
      };
      return formattedMessage;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Valida i dati di un messaggio.
   * @private
   * @param {object} messageData - L'oggetto contenente i dati del messaggio da validare.
   * @returns {{isValid: boolean, errors: string[]}} Un oggetto che indica se il messaggio è valido e una lista di errori.
   */
  _validateMessageData(messageData) {
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

    if (messageData.message && messageData.message.length > 1000) {
      errors.push("message too long (max 1000 characters)");
    }

    const isValid = errors.length === 0;

    return { isValid, errors };
  }

  /**
   * Tenta di salvare un messaggio direttamente su MongoDB tramite il servizio proxy.
   * In caso di fallimento, attiva la modalità di recovery e accoda il messaggio.
   * @private
   * @param {object} messageData - Il messaggio formattato da salvare.
   */
  async _saveDirectToMongoDB(messageData) {
    try {
      const response = await this.proxyService.callOtherExpress(
        "/api/messages",
        "POST",
        messageData,
      );

      console.log(
        `${response.status} 💾 Message ${messageData.uniqueTimestamp} saved`,
      );
    } catch (error) {
      console.error(`❌ Direct save error:: ${error.message}`);

      this._activateRecoveryMode();
      this._addToQueue(messageData);
      console.log(
        `📦 Message ${messageData.uniqueTimestamp} added to queue after failure`,
      );
    }
  }

  /**
   * Attiva la modalità di recovery se non è già attiva.
   * Imposta la modalità su "recovery" e avvia il timer.
   * @private
   */
  _activateRecoveryMode() {
    if (this.mode === PERSISTENCE_MODES.RECOVERY) {
      return;
    }

    console.warn("🚨 ACTIVATING RECOVERY MODE PERSISTENCE");
    console.warn("📦 All new messages will go to local queue");

    this.mode = PERSISTENCE_MODES.RECOVERY;
    this._startRecoveryTimer();
  }

  /**
   * Avvia il timer che periodicamente tenta il recovery della connessione a MongoDB.
   * Previene l'avvio di più timer contemporaneamente.
   * @private
   */
  _startRecoveryTimer() {
    if (this.recoveryTimer) {
      return;
    }

    this.recoveryTimer = setInterval(async () => {
      await this._attemptRecovery();
    }, this.recoveryInterval);
  }

  /**
   * Tenta il processo di recovery e sincronizzazione della coda dei messaggi.
   * Esegue un health check su MongoDB e, se il database è disponibile,
   * avvia l'esecuzione del recovery effettivo tramite `_executeRecovery`.
   * In caso di fallimento dell'health check o altri errori, la modalità rimane 'recovery'
   * e il processo verrà ritentato dopo un intervallo specifico.
   * @private
   */
  async _attemptRecovery() {
    console.log("++++ Attempting MongoDB recovery... +++");
    try {
      // Test con health check
      const response = await this.proxyService.callOtherExpress(
        "/api/health",
        "GET",
      );

      if (response.status === 200) {
        console.log("✅ MongoDB available - starting queue syncing");
        await this._executeRecovery();
      } else {
        console.log("⚠️ MongoDB not available: continuing recovery mode");
      }
    } catch (error) {
      console.log(
        `Recovery failed: ${error.message} - retrying in ${this.recoveryInterval / 1000}s`,
      );
    }
  }

  /**
   * Esegue il processo di svuotamento della coda dei messaggi verso MongoDB.
   * Imposta la modalità su "syncing" e tenta di inviare tutti i messaggi accodati in ordine FIFO.
   * Se un messaggio fallisce durante il sync, la modalità torna a "recovery" e
   * il processo si interrompe per un nuovo tentativo successivo.
   * Al termine del processo, se la coda è completamente svuotata, il sistema
   * ritorna alla modalità `normal` e il timer di recovery viene fermato.
   * @private
   */
  async _executeRecovery() {
    this.mode = PERSISTENCE_MODES.SYNCING;
    const queueSize = this.messageQueue.length;
    console.log(`Starting sync of ${queueSize} messages from queue... +++\n`);
    let successCount = 0;

    // Processo la queue in modo sequenziale per evitare overload
    while (this.messageQueue.length > 0) {
      const queuedMessage = this.messageQueue[0];
      try {
        await this._saveDirectToMongoDB(queuedMessage);
        successCount++;
        this.messageQueue.shift(); // FIFO
      } catch (error) {
        console.error(
          `❌ Queue sync: failed ${queuedMessage.uniqueTimestamp} - ${error.message} \n`,
        );
        this.mode = PERSISTENCE_MODES.RECOVERY;
        console.log("Switching from syncing to recovery");
        return;
      }
    }

    console.log(`✅ Persistence recovery completed: ${successCount} successes`);

    this.mode = PERSISTENCE_MODES.NORMAL; // Torna normal mode
    this._stopRecoveryTimer(); // Ferma timer
    this.messageQueue = []; // Svuota queue

    console.log("🟢 NORMAL MODE RESTORED 🟢");
  }

  /**
   * Ferma il timer di recovery.
   * @private
   */
  _stopRecoveryTimer() {
    if (this.recoveryTimer) {
      clearInterval(this.recoveryTimer);
      this.recoveryTimer = null;
    }
  }

  /**
   * Aggiunge un messaggio alla coda di recovery.
   * Applica una politica FIFO (First-In, First-Out) e previene l'overflow della coda.
   * @private
   * @param {object} messageData - Il messaggio da aggiungere alla coda.
   */
  _addToQueue(messageData) {
    this.messageQueue.push(messageData);

    if (this.messageQueue.length > this.maxQueueSize) {
      const removed = this.messageQueue.shift();
      console.warn(
        `⚠️ Persistence queue overflow - removed message ${removed.uniqueTimestamp}`,
      );
    }
  }
}

module.exports = new MessagesPersistenceController(); // singleton
