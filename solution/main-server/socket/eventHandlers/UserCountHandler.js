/**
 * @file socket/eventHandlers/UserCountHandler.js
 * @description Gestisce gli eventi relativi al conteggio degli utenti online.
 * Questa classe si occupa di emettere aggiornamenti in tempo reale del numero
 * di utenti connessi a tutti i client.
 */

const usersMetadataManager = require("../utils/UsersMetadataManager");
const { SOCKET_SYSTEM_EVENTS } = require("../constants/socketConstants");

/**
 * @class UserCountHandler
 * @description Handler specializzato per la gestione del conteggio utenti online.
 * Fornisce metodi per il broadcast degli aggiornamenti del conteggio utenti
 * e gestisce le richieste di conteggio da parte dei client.
 */
class UserCountHandler {
  constructor(io) {
    this.io = io;
  }

  /**
   * @method setupEventListeners
   * @description Configura i listener per gli eventi relativi al conteggio utenti
   * @param {Socket} clientSocket - La socket del client
   * @param {Object} errorSocketHandler - Handler per la gestione degli errori
   */
  setupEventListeners(clientSocket, errorSocketHandler) {
    /**
     * Listener per l'evento 'request_user_count'
     * Il client può richiedere il conteggio corrente degli utenti online
     */
    clientSocket.on('request_user_count', () => {
      try {
        const currentCount = usersMetadataManager.getCurrentConnections();
        console.log(`📊 User count requested by ${clientSocket.id}: ${currentCount}`);
        
        clientSocket.emit('user_count_update', currentCount);
      } catch (error) {
        console.error(`❌ Error handling user count request from ${clientSocket.id}:`, error);
        errorSocketHandler.emitAndLogError(error);
      }
    });
  }

  /**
   * @method broadcastUserCount
   * @description Emette il conteggio utenti aggiornato a tutti i client connessi.
   * Utilizzato quando il numero di utenti cambia (connessione/disconnessione).
   */
  broadcastUserCount() {
    try {
      const currentCount = usersMetadataManager.getCurrentConnections();
      
      console.log(`📡 Broadcasting user count update: ${currentCount}`);

      this.io.emit('user_count_update', currentCount);
    } catch (error) {
      console.error('❌ Error broadcasting user count:', error);
    }
  }

  /**
   * @method sendUserCountToClient
   * @description Invia il conteggio utenti corrente a un client specifico.
   * Utile per inviare il dato iniziale quando un utente si connette.
   * 
   * @param {Socket} clientSocket - La socket del client a cui inviare il conteggio
   */
  sendUserCountToClient(clientSocket) {
    try {
      const currentCount = usersMetadataManager.getCurrentConnections();
      
      console.log(`📤 Sending user count to ${clientSocket.id}: ${currentCount}`);
      
      clientSocket.emit('user_count_update', currentCount);
    } catch (error) {
      console.error(`❌ Error sending user count to ${clientSocket.id}:`, error);
    }
  }

  /**
   * @method getUserStats
   * @description Recupera le statistiche complete degli utenti.
   * Include sia le connessioni correnti che quelle totali.
   * 
   * @returns {Object} Oggetto con le statistiche degli utenti
   */
  getUserStats() {
    return {
      currentConnections: usersMetadataManager.getCurrentConnections(),
      totalConnectionsEver: usersMetadataManager.getTotalConnectionsEver(),
      activeRooms: usersMetadataManager.getActiveUsersPerRoom()
    };
  }
}

module.exports = (io) => new UserCountHandler(io);