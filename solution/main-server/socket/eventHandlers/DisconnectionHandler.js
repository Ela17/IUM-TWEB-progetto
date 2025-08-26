const usersMetadataManager = require("../utils/UsersMetadataManager");
const { SOCKET_SYSTEM_EVENTS } = require("../constants/socketConstants");

/**
 * @class DisconnectionHandler
 * @description Gestisce gli eventi di disconnessione degli utenti dal sistema di chat.
 */
class DisconnectionHandler {
  constructor() {}

  /**
   * @method setupEventListeners
   * @description Configura i listener per gli eventi di disconnessione
   * @param {Socket} clientSocket - La socket del client
   * @param {Object} errorSocketHandler - Handler per la gestione degli errori
   */
  setupEventListeners(clientSocket, errorSocketHandler) {
    clientSocket.on(SOCKET_SYSTEM_EVENTS.DISCONNECT, (reason) => {
      this.handleDisconnection(clientSocket, reason);
    });
  }

  /**
   * @method handleDisconnection
   * @description Gestisce la disconnessione di un client
   * @param {Socket} clientSocket - La socket disconnessa
   * @param {string} reason - Motivo della disconnessione
   */
  handleDisconnection(clientSocket, reason) {
    console.log(`🔌 Disconnection ${clientSocket.id}, reason: ${reason}`);

    const userProfile = usersMetadataManager.getUserProfile(clientSocket.id);

    if (userProfile) {
      console.log(`👋 User ${userProfile.userName} disconnecting...`);

      usersMetadataManager.removeUser(clientSocket.id);

      console.log(`✅ User ${userProfile.userName} removed from system`);
    } else {
      console.warn(
        `⚠️ Disconnection for unregistered user: ${clientSocket.id}`,
      );
    }
  }

  /**
   * @method handleConnectionError
   * @description Gestisce errori di connessione (opzionale per future estensioni)
   * @param {Socket} clientSocket - La socket con errore
   * @param {Error} error - L'errore di connessione
   */
  handleConnectionError(clientSocket, error) {
    console.error(`❌ Connection error for ${clientSocket.id}:`, error.message);

    const userProfile = usersMetadataManager.getUserProfile(clientSocket.id);

    if (userProfile) {
      usersMetadataManager.removeUser(clientSocket.id);
      console.log(
        `🧹 Cleaned up user ${userProfile.userName} after connection error`,
      );
    }
  }
}

module.exports = new DisconnectionHandler(); // singleton
