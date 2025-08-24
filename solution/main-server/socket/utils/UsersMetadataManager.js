/**
 * @file socket/utils/UsersMetadataManager.js
 * @description Gestisce i metadati degli utenti connessi al sistema di chat.
 * Questa classe è un singleton responsabile di mantenere un registro aggiornato
 * di tutti gli utenti attivi, le loro stanze e le statistiche globali.
 */

const {
  STATS_OPERATIONS,
  ROOM_EVENTS,
} = require("../constants/socketConstants");

/**
 * @class UsersMetadataManager
 * @description Gestisce i metadati degli utenti connessi al sistema di chat.
 * 
 * Questa classe è un singleton responsabile di mantenere un registro aggiornato
 * di tutti gli utenti attivi, i loro profili, le stanze a cui sono collegati
 * e le statistiche globali sulle connessioni.
 *
 * @property {Map<string, object>} usersMetadata - Mappa dei profili utente per socketId
 * @property {object} stats - Statistiche sulle connessioni
 * @property {number} stats.totalConnectionsEver - Numero totale di connessioni gestite
 * @property {number} stats.currentConnections - Numero di utenti attualmente connessi
 */
class UsersMetadataManager {
  constructor() {
    this.usersMetadata = new Map();

    this.stats = {
      totalConnectionsEver: 0,
      currentConnections: 0,
    };
  }

  /**
   * @method registerUser
   * @description Registra un nuovo utente quando si connette al sistema
   * @param {string} socketId - L'ID univoco della socket fornito da Socket.IO
   * @returns {Object} Il profilo completo dell'utente appena registrato
   * @throws {Error} Se la generazione del nickname univoco fallisce
   */
  registerUser(socketId) {
    const uniqueNickname = this._generateUniqueNickname();

    const userProfile = {
      socketId: socketId,
      userName: uniqueNickname,
      joinedAt: new Date(), // Quando si è connesso
      roomName: null, // Stanza corrente (null = non in nessuna stanza)
    };

    this.usersMetadata.set(socketId, userProfile);
    this._updateStats(STATS_OPERATIONS.ADD);

    console.log(`👤 New user: ${uniqueNickname} (Socket: ${socketId})`);
    console.log(`📊 Connected Users: ${this.stats.currentConnections}`);

    return userProfile;
  }

  /**
   * @method removeUser
   * @description Rimuove un utente dal sistema quando si disconnette.
   * Elimina il profilo utente dalla mappa dei metadati e aggiorna le statistiche delle connessioni.
   * Se l'utente non è registrato, viene emesso un avviso.
   *
   * @param {string} socketId - L'ID della socket dell'utente che si sta disconnettendo.
   * @returns {void}
   */
  removeUser(socketId) {
    const userProfile = this.usersMetadata.get(socketId);

    if (!userProfile) {
      console.warn(`⚠️ Attempting to remove unregistered user: ${socketId}`);
      return;
    }

    this.usersMetadata.delete(socketId);
    this._updateStats(STATS_OPERATIONS.REMOVE);

    console.log(`🗑️ User removed: ${userProfile.userName}`);
    console.log(`📊 Connected users: ${this.stats.currentConnections}`);

    return;
  }

  /**
   * @method getUserProfile
   * @description Recupera il profilo completo di un utente tramite il suo ID di socket.
   *
   * @param {string} socketId - L'ID della socket dell'utente da cercare.
   * @returns {object|null} Il profilo completo dell'utente se trovato, altrimenti `null`.
   */
  getUserProfile(socketId) {
    return this.usersMetadata.get(socketId) || null;
  }

  /**
   * @method updateCurrentRoom
   * @description Aggiorna la stanza corrente di un utente.
   * Utilizzato quando un utente entra ('join') o esce ('leave') da una stanza.
   *
   * @param {string} socketId - L'ID della socket dell'utente.
   * @param {string} roomName - Il nome della stanza in cui l'utente sta entrando o uscendo.
   * @param {'join'|'leave'} event - Il tipo di evento: 'join' per entrare, 'leave' per uscire.
   * @returns {void}
   */
  updateCurrentRoom(socketId, roomName, event) {
    console.log(`+++++++++ ${socketId} +++++++++++`);

    const userProfile = this.usersMetadata.get(socketId);
    if (!userProfile) {
      console.warn(
        `⚠️ Attempted to update room for non-existent user: ${socketId}`,
      );
      return;
    }

    if (!Object.values(ROOM_EVENTS).includes(event)) {
      console.error(
        `❌ Invalid room event: "${event}". Valid events: ${Object.values(ROOM_EVENTS).join(", ")}`,
      );
      return;
    }
    console.log(
      `🚪 Room update: ${userProfile.userName} ${event} ${roomName || "lobby"}`,
    );

    console.log(`+++++++++ ${userProfile} +++++++++++`);
    switch (event) {
      case ROOM_EVENTS.JOIN:
        userProfile.roomName = roomName;
        break;
      case ROOM_EVENTS.LEAVE:
        userProfile.roomName = null;
        break;
    }
  }

  /**
   * @method getActiveUsersPerRoom
   * @description Recupera il conteggio degli utenti attivi per ogni stanza.
   * Itera su tutti gli utenti connessi e aggrega il numero
   * di utenti per ogni stanza in cui si trovano.
   *
   * @returns {object} Un oggetto in cui le chiavi sono i nomi delle stanze
   * e i valori sono il numero di utenti connessi a quella stanza.
   * Le stanze senza utenti connessi non saranno incluse.
   */
  getActiveUsersPerRoom() {
    const roomCounts = {};
    for (const userSocket of this.usersMetadata.values()) {
      const roomName = userSocket.roomName;
      if (roomName) {
        roomCounts[roomName] = (roomCounts[roomName] || 0) + 1;
      }
    }
    return roomCounts;
  }

  /**
   * @method getCurrentConnections
   * @description Getter per il numero di connessioni attualmente attive.
   * Espone il dato stats.currentConnections per l'uso esterno.
   * 
   * @returns {number} Il numero di utenti attualmente connessi
   */
  getCurrentConnections() {
    return this.stats.currentConnections;
  }

  /**
   * @method getTotalConnectionsEver
   * @description Getter per il numero totale di connessioni mai gestite.
   * Espone il dato stats.totalConnectionsEver per l'uso esterno.
   * 
   * @returns {number} Il numero totale di connessioni gestite dal avvio del server
   */
  getTotalConnectionsEver() {
    return this.stats.totalConnectionsEver;
  }

  /**
   * @method _generateUniqueNickname
   * @description Genera un nickname univoco basato su aggettivi e nomi a tema cinematografico.
   * Assicura che il nickname generato non sia già in uso da un altro utente connesso.
   *
   * Nota: in scenari reali con un numero estremamente elevato di utenti,
   * questa operazione potrebbe diventare inefficiente.
   *
   * @private
   * @returns {string} Il nickname univoco generato.
   */
  _generateUniqueNickname() {
    const adjectives = [
      "Popcorn",
      "Cozy",
      "Binge",
      "Spoiler",
      "Marathon",
      "Midnight",
      "Lazy",
      "Funny",
      "Quirky",
      "Retro",
      "Geeky",
      "Chatty",
      "Sleepy",
      "Jumpy",
      "Tearful",
      "Giggly",
      "Snacky",
      "Dreamy",
      "Witty",
      "Chill",
    ];
    const nouns = [
      "Director",
      "Producer",
      "Critic",
      "Cinephile",
      "Screenwriter",
      "Editor",
      "Composer",
      "Actor",
    ];

    let userName;

    const ArrayName = Array.from(this.usersMetadata.values()).map(
      (obj) => obj.userName,
    );

    // Continuiamo a generare finché non troviamo un nickname libero
    do {
      const randomAdjective =
        adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
      const randomNumber = Math.floor(Math.random() * 1000);

      userName = `${randomAdjective}_${randomNoun}_${randomNumber}`;
    } while (ArrayName.includes(userName));

    return userName;
  }

  /**
   * @method _updateStats
   * @description Aggiorna le statistiche interne del sistema (connessioni totali e attuali).
   *
   * @private
   * @param operation - Il tipo di operazione: 'add' per una nuova connessione, 'remove' per una disconnessione.
   * @returns {void}
   */
  _updateStats(operation) {
    if (!Object.values(STATS_OPERATIONS).includes(operation)) {
      console.error(
        `❌ Invalid stats operation: "${operation}". Valid operations: ${Object.values(STATS_OPERATIONS).join(", ")}`,
      );
      return;
    }

    switch (operation) {
      case STATS_OPERATIONS.ADD:
        this.stats.totalConnectionsEver++;
        this.stats.currentConnections++;
        break;
      case STATS_OPERATIONS.REMOVE:
        this.stats.currentConnections--;
        break;
    }
  }
}

module.exports = new UsersMetadataManager(); // singleton
