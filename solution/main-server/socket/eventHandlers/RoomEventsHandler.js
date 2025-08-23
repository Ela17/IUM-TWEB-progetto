const usersMetadataManager = require("../utils/UsersMetadataManager");
const {
  SOCKET_ROOM_EVENTS,
  ROOM_EVENTS,
  CHAT_ERROR_CODES,
} = require("../constants/socketConstants");

/**
 * @class RoomEventsHandler
 * @description Gestisce tutti gli eventi Socket.IO relativi alla creazione, unione e uscita dalle chat room.
 * Questa classe si occupa di integrare la logica di Socket.IO per le stanze con la gestione
 * dei metadati degli utenti.
 */
class RoomEventsHandler {
  constructor(io) {
    this.io = io;
  }

  /**
   * Configura i listener di eventi per un socket client specifico, gestendo le operazioni sulle stanze.
   * Include listener per la creazione, l'unione e l'uscita dalle stanze.
   * @param {object} clientSocket - L'oggetto socket del client di Socket.IO per cui configurare i listener.
   * @param {object} errorSocketHandler - L'istanza di ErrorSocketHandler per la gestione centralizzata degli errori.
   */
  setupEventListeners(clientSocket, errorSocketHandler) {
    /**
     * Listener per l'evento `SOCKET_ROOM_EVENTS.CREATE_ROOM`.
     * Chiamato quando un client desidera creare una nuova chat room. Il client viene unito alla nuova stanza
     * e riceve una conferma.
     * @event SOCKET_ROOM_EVENTS.CREATE_ROOM
     * @param {object} data - I dati per la creazione della stanza.
     * @param {string} data.roomName - Il nome della stanza da creare.
     * @param {string} data.userName - Il nome dell'utente che crea la stanza.
     * @param {string} data.topic - L'argomento o la descrizione della stanza.
     */
    clientSocket.on(SOCKET_ROOM_EVENTS.CREATE_ROOM, (data) => {
      try {
        console.log(data);
        const { roomName, userName, topic } = data;
        /* TODO: DA METTERE UN CONTROLLO SE LA STANZA è GIA PRESENTE!!! */
        console.log(
          `🎬 ${userName} (${clientSocket.id}) creates room: ${roomName}`,
        );

        clientSocket.join(roomName);
        usersMetadataManager.updateCurrentRoom(
          clientSocket.id,
          roomName,
          ROOM_EVENTS.JOIN,
        );

        // Emette una conferma al client che ha creato la stanza
        clientSocket.emit(SOCKET_ROOM_EVENTS.ROOM_CREATED, {
          success: true,
          roomName: roomName,
          message: `Room "${roomName}" created successfully!`,
          topic: topic,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        error.socket = clientSocket;
        error.event = SOCKET_ROOM_EVENTS.CREATE_ROOM;
        error.code = CHAT_ERROR_CODES.VALIDATION_ERROR_ROOM_DATA;

        errorSocketHandler.emitAndLogError(error);
      }
    });

    /**
     * Listener per l'evento `SOCKET_ROOM_EVENTS.JOIN_ROOM`.
     * Chiamato quando un client desidera unirsi a una stanza esistente. Il client viene aggiunto alla stanza,
     * riceve una conferma e un messaggio viene broadcastato agli altri membri della stanza.
     * @event SOCKET_ROOM_EVENTS.JOIN_ROOM
     * @param {object} data - I dati per l'unione alla stanza.
     * @param {string} data.roomName - Il nome della stanza a cui unirsi.
     * @param {string} data.userName - Il nome dell'utente che si unisce.
     */
    clientSocket.on(SOCKET_ROOM_EVENTS.JOIN_ROOM, (data) => {
      try {
        console.log(
          `📥 ${SOCKET_ROOM_EVENTS.JOIN_ROOM} from ${clientSocket.id}`,
        );

        const { roomName, userName } = data;

        clientSocket.join(roomName);
        usersMetadataManager.updateCurrentRoom(
          clientSocket.id,
          roomName,
          ROOM_EVENTS.JOIN,
        );

        // Emette una conferma al client che si è unito alla stanza
        clientSocket.emit(SOCKET_ROOM_EVENTS.ROOM_JOINED, {
          roomName: roomName,
          message: `You joined room: ${roomName}`,
          timestamp: new Date().toISOString(),
        });

        // Broadcast a tutti i membri della stanza per notificare che un nuovo utente si è unito.
        this.io.to(roomName).emit(SOCKET_ROOM_EVENTS.USER_JOINED, {
          roomName: roomName,
          userName: userName,
          message: `${userName} joined the room`,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        error.socket = clientSocket;
        error.event = SOCKET_ROOM_EVENTS.JOIN_ROOM;
        error.code = CHAT_ERROR_CODES.VALIDATION_ERROR_ROOM_DATA;

        errorSocketHandler.emitAndLogError(error);
      }
    });

    /**
     * Listener per l'evento `SOCKET_ROOM_EVENTS.LEAVE_ROOM`.
     * Chiamato quando un client desidera lasciare una stanza. Il client viene rimosso dalla stanza
     * e un messaggio viene broadcastato agli altri membri.
     * @event SOCKET_ROOM_EVENTS.LEAVE_ROOM
     * @param {object} data - I dati per l'uscita dalla stanza.
     * @param {string} data.roomName - Il nome della stanza da cui uscire.
     * @param {string} data.userName - Il nome dell'utente che lascia la stanza.
     */
    clientSocket.on(SOCKET_ROOM_EVENTS.LEAVE_ROOM, (data) => {
      try {
        const { roomName, userName } = data;
        console.log(
          `🚪 ${userName} (${clientSocket.id}) is leaving room: ${roomName}`,
        );

        clientSocket.leave(roomName);
        usersMetadataManager.updateCurrentRoom(
          clientSocket.id,
          roomName,
          ROOM_EVENTS.LEAVE,
        );

        // Broadcast a tutti i membri rimasti nella stanza (escluso chi sta lasciando)
        // per notificare che un utente ha lasciato la stanza.
        clientSocket.to(roomName).emit(SOCKET_ROOM_EVENTS.USER_LEFT, {
          roomName: roomName,
          userName: userName,
          message: `${userName} left the room`,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        error.socket = clientSocket;
        error.event = SOCKET_ROOM_EVENTS.LEAVE_ROOM;
        error.code = CHAT_ERROR_CODES.VALIDATION_ERROR_ROOM_DATA;

        errorSocketHandler.emitAndLogError(error);
      }
    });
  }
}

module.exports = (io) => new RoomEventsHandler(io);
