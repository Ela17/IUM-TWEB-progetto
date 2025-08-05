/**
 * @class ChatController
 * @description Controller per la gestione delle operazioni relative alla chat.
 * Incapsula la logica di business per l'interazione con l'OTHER_EXPRESS_SERVER,
 * seguendo il pattern delle lezioni del professore e la struttura del MoviesController.
 * Gestisce sia le routes HTTP che l'integrazione con Socket.IO per la chat real-time.
 */
class ChatController {
  constructor(proxyService) {
    this.proxyCallerServices = proxyService;
  }

  /**
   * @method getChatPage
   * @description Serve la pagina principale della chat.
   * Segue il pattern della lezione del professore: res.render('index', { title: 'My Chat' })
   * per servire la pagina con Socket.IO configurato.
   * @param {Object} req - L'oggetto Request.
   * @param {Object} res - L'oggetto Response per renderizzare la pagina.
   * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo.
   */
  async getChatPage(req, res, next) {
    try {
      // Seguendo il pattern della lezione: res.render('index', { title: 'My Chat' })
      res.render("chat", {
        title: "Cinema Chat",
        serverUrl:
          process.env.OTHER_EXPRESS_SERVER_URL || "http://localhost:3001",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method getChatHistory
   * @description Recupera la cronologia dei messaggi per una stanza specifica
   * dall'OTHER_EXPRESS_SERVER tramite ProxyCallerService.
   * Usa l'endpoint reale: /api/messages/:roomName
   * @param {Object} req - L'oggetto Request contenente il nome della stanza nei params.
   * @param {Object} res - L'oggetto Response per inviare la risposta al client.
   * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo.
   */
  async getChatHistory(req, res, next) {
    try {
      const { roomName } = req.params;
      const { page = 1 } = req.query;

      console.log(`📜 Recupero cronologia chat per stanza: ${roomName}`);

      // Endpoint reale del secondo server Express-MongoDB
      const endpoint = `/api/messages/${encodeURIComponent(roomName)}?page=${page}`;
      const chatResponse =
        await this.proxyCallerServices.callOtherExpress(endpoint);

      res.json(chatResponse.data);
    } catch (error) {
      console.error(
        `❌ Errore recupero cronologia chat per ${req.params.roomName}:`,
        error.message,
      );
      next(error);
    }
  }

  /**
   * @method createRoom
   * @description Crea una nuova stanza di chat sul secondo server Express.
   * Usa l'endpoint reale: /api/rooms
   * @param {Object} req - L'oggetto Request contenente i dati della stanza nel body.
   * @param {Object} res - L'oggetto Response per inviare la risposta al client.
   * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo.
   */
  async createRoom(req, res, next) {
    try {
      const { roomName, description, maxUsers } = req.body;

      console.log(`🏠 Creazione nuova stanza: ${roomName}`);

      // Formato dati secondo la struttura del secondo server
      const roomData = {
        roomName,
        description: description || `Chat room per ${roomName}`,
        maxUsers: maxUsers || 50,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        isActive: true,
      };

      // Endpoint reale del secondo server Express-MongoDB
      const endpoint = "/api/rooms";
      const createResponse = await this.proxyCallerServices.callOtherExpress(
        endpoint,
        "POST",
        roomData,
      );

      // Seguendo il pattern delle lezioni: dichiarare Content-Type JSON
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(createResponse.data));
    } catch (error) {
      console.error(
        `❌ Errore creazione stanza ${req.body.roomName}:`,
        error.message,
      );
      next(error);
    }
  }

  /**
   * @method getRoomsList
   * @description Recupera la lista delle stanze di chat disponibili dall'OTHER_EXPRESS_SERVER.
   * Usa l'endpoint reale: /api/rooms/all
   * @param {Object} req - L'oggetto Request.
   * @param {Object} res - L'oggetto Response per inviare la risposta al client.
   * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo.
   */
  async getRoomsList(req, res, next) {
    try {
      console.log("📋 Recupero lista stanze chat");

      // Endpoint reale del secondo server Express-MongoDB
      const endpoint = "/api/rooms/all";
      const roomsResponse =
        await this.proxyCallerServices.callOtherExpress(endpoint);

      res.json(roomsResponse.data);
    } catch (error) {
      console.error("❌ Errore recupero lista stanze:", error.message);
      next(error);
    }
  }

  /**
   * @method deleteRoom
   * @description Aggiorna l'attività di una stanza (il secondo server non ha delete, ma update).
   * Usa l'endpoint reale: /api/rooms/:roomName
   * @param {Object} req - L'oggetto Request contenente il nome della stanza nei params.
   * @param {Object} res - L'oggetto Response per inviare la risposta al client.
   * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo.
   */
  async deleteRoom(req, res, next) {
    try {
      const { roomName } = req.params;

      console.log(`🔄 Aggiornamento attività stanza: ${roomName}`);

      // Il secondo server ha solo update activity, non delete
      // Usiamo l'endpoint reale PUT /api/rooms/:roomName
      const endpoint = `/api/rooms/${encodeURIComponent(roomName)}`;
      const updateResponse = await this.proxyCallerServices.callOtherExpress(
        endpoint,
        "PUT",
      );

      res.json(updateResponse.data);
    } catch (error) {
      console.error(
        `❌ Errore aggiornamento stanza ${req.params.roomName}:`,
        error.message,
      );
      next(error);
    }
  }

  /**
   * @method syncMessageToOtherServer
   * @description Metodo helper per sincronizzare i messaggi con l'OTHER_EXPRESS_SERVER.
   * Usa l'endpoint reale: /api/messages
   * Questo metodo può essere chiamato dal MessageEventsHandler per persistere
   * i messaggi anche sul secondo server Express oltre che sul database principale.
   * @param {Object} messageData - I dati del messaggio da sincronizzare.
   * @returns {Promise} Promise che si risolve con la risposta del server.
   */
  async syncMessageToOtherServer(messageData) {
    try {
      console.log(`🔄 Sincronizzazione messaggio con OTHER_EXPRESS_SERVER`);

      // Formato dei dati secondo la struttura del secondo server
      const messagePayload = {
        userName: messageData.userName,
        message: messageData.message,
        roomName: messageData.roomName,
        timestamp: messageData.timestamp || new Date().toISOString(),
        uniqueTimestamp: Date.now() + Math.random(), // Per l'ID univoco
        serverId: "main-server",
      };

      // Endpoint reale del secondo server Express-MongoDB
      const endpoint = "/api/messages";
      const syncResponse = await this.proxyCallerServices.callOtherExpress(
        endpoint,
        "POST",
        messagePayload,
      );

      return syncResponse.data;
    } catch (error) {
      console.error("❌ Errore sincronizzazione messaggio:", error.message);
      // Non propaga l'errore per non interrompere il flusso principale della chat
      return null;
    }
  }
}

module.exports = ChatController;
