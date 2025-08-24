/**
 * @fileoverview Controller per la gestione delle operazioni relative alla chat.
 * Modulo che esporta funzioni per l'interazione con l'OTHER_EXPRESS_SERVER,
 * Gestisce sia le routes HTTP che l'integrazione con Socket.IO per la chat real-time.
 */

const proxyService = require("../services/proxyService");

/**
 * @function getChatPage
 * @description Serve la pagina principale della chat.
 * @param {Object} req - L'oggetto Request.
 * @param {Object} res - L'oggetto Response per renderizzare la pagina.
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo.
 */
const getChatPage = async (req, res, next) => {
  try {
    res.render("pages/chat", {
      title: "Cinema Chat",
      isChatPage: true,
      serverUrl:
        process.env.OTHER_EXPRESS_SERVER_URL || "http://localhost:3001",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @function getChatHistory
 * @description Recupera la cronologia dei messaggi per una stanza specifica
 * dall'OTHER_EXPRESS_SERVER tramite proxyService.
 * Usa l'endpoint reale: /api/messages/:roomName
 * @param {Object} req - L'oggetto Request contenente il nome della stanza nei params.
 * @param {Object} res - L'oggetto Response per inviare la risposta al client.
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo.
 */
const getChatHistory = async (req, res, next) => {
  try {
    const { roomName } = req.params;
    const { page = 1 } = req.query;

    console.log(`📜 Fetching chat history for room: ${roomName}`); // Endpoint reale del secondo server Express-MongoDB

    const endpoint = `/api/messages/${encodeURIComponent(roomName)}?page=${page}`;
    const chatResponse = await proxyService.callOtherExpress(endpoint);

    res.json(chatResponse.data.data);
  } catch (error) {
    console.error(
      `❌ Error fetching chat history for ${req.params.roomName}:`,
      error.message,
    );
    next(error);
  }
};

/**
 * @function createRoom
 * @description Crea una nuova stanza di chat sul secondo server Express.
 * Usa l'endpoint reale: /api/rooms
 * @param {Object} req - L'oggetto Request contenente i dati della stanza nel body.
 * @param {Object} res - L'oggetto Response per inviare la risposta al client.
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo.
 */
const createRoom = async (req, res, next) => {
  try {
    const { roomName, description, maxUsers } = req.body;

    console.log(`🏠 Creating new room: ${roomName}`);

    const roomData = {
      roomName,
      description: description || `Chat room per ${roomName}`,
      maxUsers: maxUsers || 50,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      isActive: true,
    };

    const endpoint = "/api/rooms";
    const createResponse = await proxyService.callOtherExpress(
      endpoint,
      "POST",
      roomData,
    );

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify(createResponse.data.data));
  } catch (error) {
    console.error(
      `❌ Error creating room ${req.body.roomName}:`,
      error.message,
    );
    next(error);
  }
};

/**
 * @function getRoomsList
 * @description Recupera la lista delle stanze di chat disponibili dall'OTHER_EXPRESS_SERVER.
 * Usa l'endpoint reale: /api/rooms/all
 * @param {Object} req - L'oggetto Request.
 * @param {Object} res - L'oggetto Response per inviare la risposta al client.
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo.
 */
const getRoomsList = async (req, res, next) => {
  try {
    console.log("📋 Fetching list of chat rooms");

    const endpoint = "/api/rooms/all";
    const roomsResponse = await proxyService.callOtherExpress(endpoint);

    res.json(roomsResponse.data.data);
  } catch (error) {
    console.error("❌ Error fetching room list:", error.message);
    next(error);
  }
};

/**
 * @function syncMessageToOtherServer
 * @description Metodo helper per sincronizzare i messaggi con l'OTHER_EXPRESS_SERVER.
 * Usa l'endpoint reale: /api/messages
 * Questo metodo può essere chiamato dal MessageEventsHandler per persistere
 * i messaggi anche sul secondo server Express oltre che sul database principale.
 * @param {Object} messageData - I dati del messaggio da sincronizzare.
 * @returns {Promise} Promise che si risolve con la risposta del server.
 */
const syncMessageToOtherServer = async (messageData) => {
  try {
    console.log(`🔄 Syncing message with OTHER_EXPRESS_SERVER`);

    const messagePayload = {
      userName: messageData.userName,
      message: messageData.message,
      roomName: messageData.roomName,
      timestamp: messageData.timestamp || new Date().toISOString(),
      uniqueTimestamp: Date.now() + Math.random(), // Per l'ID univoco
      serverId: "main-server",
    };

    const endpoint = "/api/messages";
    const syncResponse = await proxyService.callOtherExpress(
      endpoint,
      "POST",
      messagePayload,
    );

    return syncResponse.data.data;
  } catch (error) {
    console.error("❌ Error syncing message:", error.message); // Non propaga l'errore per non interrompere il flusso principale della chat
    return null;
  }
};

module.exports = {
  getChatPage,
  getChatHistory,
  createRoom,
  getRoomsList,
  syncMessageToOtherServer,
};
