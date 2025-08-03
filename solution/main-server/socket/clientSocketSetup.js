const getRoomEventsHandler = require("../eventsHandlers/RoomEventsHandler");
const getMessageEventsHandler = require("../eventsHandlers/MessageEventsHandler");
const { handleDisconnection } = require("./eventHandlers/DisconnectionHandler");

/**
 * @function setUpClientSocket
 * @description Configurazione base per una nuova connessione client.
 *
 * Versione iniziale :
 * - Registrazione dell'utente nel sistema
 * - Setup degli eventlistener per ogni nuova socket
 * - Configurazione dell'evento di disconnessione
 * - Invio messaggio di benvenuto
 *
 * @param {Socket} clientSocket - La socket del client appena connesso
 * @param {Server} io - L'istanza Socket.IO globale
 * @param {Object} usersMetadataManager - Il singleton per gestire i metadati utente
 * @throws {Error} Rilancia eventuali errori incontrati durante la configurazione iniziale per la gestione centralizzata.
 */
function setupClientSocket(
  clientSocket,
  io,
  usersMetadataManager,
  errorSocketHandler,
) {
  const roomEventsHandler = getRoomEventsHandler(io);
  const messageEventsHandler = getMessageEventsHandler(io);

  try {
    console.log(`🎯 Setup base per client: ${clientSocket.id}`);

    // STEP 1: Registriamo l'utente nel nostro sistema
    const userProfile = usersMetadataManager.registerUser(clientSocket.id);

    clientSocket.on("disconnect", (reason) => {
      handleDisconnection(clientSocket, usersMetadataManager, reason);
    });

    roomEventsHandler.setupEventListeners(clientSocket, errorSocketHandler);
    messageEventsHandler.setupEventListeners(clientSocket, errorSocketHandler);

    // STEP 3: Inviamo un messaggio di benvenuto semplice
    clientSocket.emit("welcome", {
      success: true,
      message: "Connesso con successo!",
      userName: userProfile.userName,
      socketId: clientSocket.id,
      timestamp: new Date().toISOString(),
    });

    console.log(`✅ Client ${userProfile.userName} configurato`);
  } catch (error) {
    throw error;
  }
}

module.exports = setupClientSocket;
