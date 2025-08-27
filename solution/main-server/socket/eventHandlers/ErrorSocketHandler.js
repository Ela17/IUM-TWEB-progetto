/**
 * @class ErrorSocketHandler
 * @description Gestisce gli errori relativi ai WebSocket, emettendo eventi di errore ai client
 * e registrando dettagliatamente gli errori nel log del server. Questa classe è pensata
 * per essere un singleton per gestire centralmente la reportistica degli errori socket.
 */
class ErrorSocketHandler {
  constructor(io) {
    this.io = io;
  }

  /**
   * @method emitAndLogError
   * @description Registra un errore dettagliato nella console del server ed emette un evento
   * di errore generico al socket client coinvolto (se disponibile) tramite l'evento
   * `SOCKET_SYSTEM_EVENTS.ERROR_OCCURRED`.
   *
   * @param {object} error - L'oggetto errore da gestire.
   * @param {string} error.name - Il nome dell'errore (es. 'ValidationError').
   * @param {string} error.message - Il messaggio descrittivo dell'errore.
   * @param {string} [error.event] - L'evento socket specifico che ha scatenato l'errore.
   * @param {string} [error.code='UNKNOWN_ERROR'] - Un codice univoco per l'errore, se disponibile.
   * @param {object} [error.socket] - L'oggetto socket di Socket.IO associato all'errore.
   * @param {string} [error.socket.id] - L'ID del socket.
   * @param {boolean} [error.socket.connected] - Stato di connessione del socket.
   * @param {Set<string>} [error.socket.rooms] - Le stanze a cui il socket è iscritto.
   * @param {object} [error.additionalDetails={}] - Dettagli aggiuntivi specifici dell'errore.
   * @param {string} [error.stack] - Lo stack trace dell'errore.
   */
  emitAndLogError() {}

  /**
   * @method _sendToUser
   * @description Invia un messaggio di errore generico al socket client specifico.
   * tramite l'evento `SOCKET_SYSTEM_EVENTS.ERROR_OCCURRED`.
   * Questo metodo è privato e utilizzato internamente da `emitAndLogError`.
   * @private
   * @param {object} error - L'oggetto errore contenente l'istanza del socket a cui inviare il messaggio.
   * @param {object} error.socket - L'oggetto socket di Socket.IO del client.
   */
  _sendToUser() {}
}

module.exports = () => new ErrorSocketHandler(null);
