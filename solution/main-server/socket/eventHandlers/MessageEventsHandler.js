const messagePersistenceController = require("../controller/MessagesPersistenceController");
const {
  SOCKET_MESSAGE_EVENTS,
  CHAT_ERROR_CODES,
} = require("../constants/socketConstants");
const { callOtherExpress } = require("../../services/proxyService");

/**
 * @class MessageEventsHandler
 * @description Gestisce gli eventi relativi ai messaggi scambiati tramite Socket.IO.
 * Questa classe è responsabile di configurare i listener per i messaggi in entrata,
 * broadcastarli alle stanze appropriate e persistere i messaggi nel database.
 */
class MessageEventsHandler {
  constructor(io) {
    this.io = io;
  }

  /**
   * Configura i listener di eventi per un socket client specifico.
   * Attualmente, gestisce l'evento `ROOM_MESSAGE` per l'invio e la persistenza dei messaggi.
   * @param {object} clientSocket - L'oggetto socket del client di Socket.IO per cui configurare i listener.
   * @param {object} errorSocketHandler - L'istanza di ErrorSocketHandler per la gestione centralizzata degli errori socket.
   */
  setupEventListeners(clientSocket, errorSocketHandler) {
    console.log(`Configuring listeners for socket ${clientSocket.id}`);

    clientSocket.on(SOCKET_MESSAGE_EVENTS.ROOM_MESSAGE, (data) => {
      try {
        console.log(
          `📥 ${SOCKET_MESSAGE_EVENTS.ROOM_MESSAGE} from ${clientSocket.id}`,
        );

        const { roomName, userName, message } = data;

        console.log(`💬 ${userName} in ${roomName}: ${message}`);

        const messageData = {
          userName: userName,
          message: message,
          roomName: roomName,
        };

        // Native Socket.io broadcasting per la room
        this.io
          .to(roomName)
          .emit(SOCKET_MESSAGE_EVENTS.ROOM_MESSAGE_RECEIVED, messageData);

        messagePersistenceController.saveMessage(messageData);
        this._updateRoomActivity(roomName);
      } catch (error) {
        error.socket = clientSocket;
        error.event = SOCKET_MESSAGE_EVENTS.ROOM_MESSAGE;
        error.code = CHAT_ERROR_CODES.VALIDATION_ERROR_MESSAGE_DATA;

        errorSocketHandler.emitAndLogError(error);
      }
    });
  }

  async _updateRoomActivity(roomName) {
    try {
      const endpoint = `/api/rooms/${encodeURIComponent(roomName)}`;
      await callOtherExpress(endpoint, "PUT");
      console.log(`✅ Room activity updated: ${roomName}`);
    } catch (error) {
      // Non bloccare la chat se updateActivity fallisce
      console.warn(`⚠️ Failed to update room activity: ${error.message}`);
    }
  }
}

module.exports = (io) => new MessageEventsHandler(io); // singleton
