const getRoomEventsHandler = require("./eventHandlers/RoomEventsHandler");
const getMessageEventsHandler = require("./eventHandlers/MessageEventsHandler");
const getUserCountHandler = require("./eventHandlers/UserCountHandler");
const usersMetadataManager = require("./utils/UsersMetadataManager")
const disconnectionHandler = require("./eventHandlers/DisconnectionHandler");

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
 * @throws {Error} Rilancia eventuali errori incontrati durante la configurazione iniziale per la gestione centralizzata.
 */
function setupClientSocket(
  clientSocket,
  io,
  errorSocketHandler,
) {
  const roomEventsHandler = getRoomEventsHandler(io);
  const messageEventsHandler = getMessageEventsHandler(io);
  const userCountHandler = getUserCountHandler(io);

  try {
    console.log(`🎯 Setup base per client: ${clientSocket.id}`);

    const userProfile = usersMetadataManager.registerUser(clientSocket.id);

    clientSocket.on("disconnect", (reason) => {
      disconnectionHandler.handleDisconnection(clientSocket, reason);
      userCountHandler.broadcastUserCount();
    });

    roomEventsHandler.setupEventListeners(clientSocket, errorSocketHandler);
    messageEventsHandler.setupEventListeners(clientSocket, errorSocketHandler);
    userCountHandler.setupEventListeners(clientSocket, errorSocketHandler);

    clientSocket.emit("welcome", {
      success: true,
      message: "Connesso con successo!",
      userName: userProfile.userName,
      socketId: clientSocket.id,
      timestamp: new Date().toISOString(),
    });

    userCountHandler.sendUserCountToClient(clientSocket);
    userCountHandler.broadcastUserCount();

    console.log(`✅ Client ${userProfile.userName} configurato`);
  } catch (error) {
    throw error;
  }
}

module.exports = setupClientSocket;
