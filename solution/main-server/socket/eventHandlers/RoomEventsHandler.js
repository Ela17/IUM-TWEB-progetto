const usersMetadataManager = require("../utils/UsersMetadataManager");
const {
  SOCKET_ROOM_EVENTS,
  ROOM_EVENTS,
  CHAT_ERROR_CODES,
} = require("../constants/socketConstants");
const proxyService = require("../../services/proxyService");

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
    clientSocket.on(SOCKET_ROOM_EVENTS.CREATE_ROOM, async (data) => {
      try {
        const { roomName, userName, topic } = data;

        // Salva la stanza nel database del server Express-MongoDB
        try {
          const roomData = {
            roomName: roomName,
            description: topic || `Chat room for ${roomName}`,
            maxUsers: 50,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            isActive: true,
          };

          const endpoint = "/api/rooms";
          const response = await proxyService.callOtherExpress(
            endpoint,
            "POST",
            roomData,
          );
        } catch (dbError) {
          console.warn(
            `⚠️ Failed to save room to database: ${dbError.message}`,
          );
          // Continua comunque con la creazione della stanza in memoria
        }

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

        // Emette anche l'evento specifico per la chat
        clientSocket.emit("room_creation_result_chat", {
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
    clientSocket.on(SOCKET_ROOM_EVENTS.JOIN_ROOM, async (data) => {
      try {
        console.log(
          `📥 ${SOCKET_ROOM_EVENTS.JOIN_ROOM} from ${clientSocket.id}`,
        );

        const { roomName, userName } = data;

        // Aggiorna l'attività della stanza nel database
        try {
          const endpoint = `/api/rooms/${encodeURIComponent(roomName)}`;
          await proxyService.callOtherExpress(endpoint, "PUT", {
            lastActivity: new Date().toISOString(),
          });
          console.log(`✅ Updated activity for room: ${roomName}`);
        } catch (dbError) {
          console.warn(`⚠️ Failed to update room activity: ${dbError.message}`);
          // Continua comunque con l'unione alla stanza
        }

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

        // Emette anche l'evento specifico per la chat
        clientSocket.emit("room_joined_chat", {
          success: true,
          roomName: roomName,
          message: `Successfully joined room "${roomName}"!`,
          topic: `Chat room for ${roomName}`,
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

    /**
     * Listener per l'evento `SOCKET_ROOM_EVENTS.GET_ROOMS_LIST`.
     * Chiamato quando un client richiede la lista delle stanze disponibili.
     * Recupera la lista dal server Express-MongoDB e la invia al client.
     * @event SOCKET_ROOM_EVENTS.GET_ROOMS_LIST
     */
    clientSocket.on(SOCKET_ROOM_EVENTS.GET_ROOMS_LIST, async () => {
      try {
        console.log(`📋 Client ${clientSocket.id} requesting rooms list`);

        // Chiama l'API del server Express-MongoDB per ottenere la lista delle stanze
        const endpoint = "/api/rooms/all";
        const roomsResponse = await proxyService.callOtherExpress(endpoint);

        if (roomsResponse && roomsResponse.data && roomsResponse.data.data) {
          const rooms = roomsResponse.data.data.rooms || [];

          // Invia la lista delle stanze al client
          clientSocket.emit(SOCKET_ROOM_EVENTS.ROOM_LIST, rooms);
          console.log(
            `✅ Sent ${rooms.length} rooms to client ${clientSocket.id}`,
          );
        } else {
          console.warn(
            `⚠️ No rooms data received for client ${clientSocket.id}`,
          );
          clientSocket.emit(SOCKET_ROOM_EVENTS.ROOM_LIST, []);
        }
      } catch (error) {
        console.error(
          `❌ Error fetching rooms list for client ${clientSocket.id}:`,
          error.message,
        );

        // Invia lista vuota in caso di errore
        clientSocket.emit(SOCKET_ROOM_EVENTS.ROOM_LIST, []);

        error.socket = clientSocket;
        error.event = SOCKET_ROOM_EVENTS.GET_ROOMS_LIST;
        error.code = CHAT_ERROR_CODES.VALIDATION_ERROR_ROOM_DATA;
        errorSocketHandler.emitAndLogError(error);
      }
    });

    /**
     * Listener per l'evento `connect_chat`.
     * Chiamato quando la pagina chat si connette e vuole essere notificata della connessione.
     * @event connect_chat
     */
    clientSocket.on("connect_chat", () => {
      console.log(`🔌 Chat page connected for client ${clientSocket.id}`);
      // Emette l'evento connect_chat per notificare la pagina chat
      clientSocket.emit("connect_chat");
    });
  }
}

module.exports = (io) => new RoomEventsHandler(io);
