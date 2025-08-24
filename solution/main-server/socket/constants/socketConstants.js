/**
 * @file constants/socketConstants.js
 * @description Costanti globali per il sistema Socket.IO e chat
 *
 * Questo file centralizza tutte le costanti utilizzate nel sistema di chat.
 */

// ============================================================================
// USER MANAGEMENT CONSTANTS
// ============================================================================

/**
 * @enum {string}
 * @readonly
 * @description Operazioni disponibili per l'aggiornamento delle statistiche utente
 */
const STATS_OPERATIONS = Object.freeze({
  ADD: "add", // Aggiunta di un nuovo utente
  REMOVE: "remove", // Rimozione di un utente esistente
});

/**
 * @enum {string}
 * @readonly
 * @description Eventi disponibili per l'aggiornamento delle stanze
 */
const ROOM_EVENTS = Object.freeze({
  JOIN: "join", // Utente entra in una stanza
  LEAVE: "leave", // Utente esce da una stanza
});

// ============================================================================
// SOCKET EVENTS CONSTANTS
// ============================================================================

/**
 * @enum {string}
 * @readonly
 * @description Eventi Socket.IO per la gestione delle stanze
 */
const SOCKET_ROOM_EVENTS = Object.freeze({
  CREATE_ROOM: "create_room",
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  ROOM_CREATED: "room_creation_result",
  ROOM_JOINED: "room_joined",
  USER_JOINED: "user_joined",
  USER_LEFT: "user_left",
});

/**
 * @enum {string}
 * @readonly
 * @description Eventi Socket.IO per la gestione dei messaggi
 */
const SOCKET_MESSAGE_EVENTS = Object.freeze({
  ROOM_MESSAGE: "room_message",
  ROOM_MESSAGE_RECEIVED: "room_message_received",
  WELCOME: "welcome",
  ERROR: "error",
});

/**
 * @enum {string}
 * @readonly
 * @description Eventi Socket.IO di sistema
 */
const SOCKET_SYSTEM_EVENTS = Object.freeze({
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
});

// ============================================================================
// MESSAGE PERSISTENCE CONSTANTS
// ============================================================================

/**
 * @enum {string}
 * @readonly
 * @description Modi operativi del MessagesPersistenceController
 */
const PERSISTENCE_MODES = Object.freeze({
  NORMAL: "normal", // Modalità normale - salvataggio diretto
  RECOVERY: "recovery", // Modalità recovery - servizio non disponibile
  SYNCING: "syncing", // Modalità sync - ripristino queue
});

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * @enum {number}
 * @readonly
 * @description Limiti di validazione per i messaggi
 */
const MESSAGE_LIMITS = Object.freeze({
  MAX_MESSAGE_LENGTH: 1000, // Lunghezza massima messaggio
  MAX_ROOM_NAME_LENGTH: 50, // Lunghezza massima nome stanza
  MAX_USERNAME_LENGTH: 30, // Lunghezza massima username
  MIN_MESSAGE_LENGTH: 1, // Lunghezza minima messaggio
  MIN_ROOM_NAME_LENGTH: 3, // Lunghezza minima nome stanza
  MIN_USERNAME_LENGTH: 3, // Lunghezza minima username
});

/**
 * @enum {number}
 * @readonly
 * @description Configurazioni temporali del sistema
 */
const TIMING_CONFIG = Object.freeze({
  RECOVERY_INTERVAL: 30000, // 30 secondi - intervallo retry recovery
  REQUEST_TIMEOUT: 5000, // 5 secondi - timeout richieste HTTP
  MAX_QUEUE_SIZE: 1000, // Dimensione massima queue messaggi
  PING_TIMEOUT: 60000, // 60 secondi - timeout ping Socket.IO
  PING_INTERVAL: 25000, // 25 secondi - intervallo ping Socket.IO
});

/**
 * @enum {number}
 * @readonly
 * @description Messaggi di errore per chat system
 */
const CHAT_ERROR_CODES = Object.freeze({
  VALIDATION_ERROR_MESSAGE_DATA: "VALIDATION_ERROR_MESSAGE_DATA",
  VALIDATION_ERROR_ROOM_DATA: "VALIDATION_ERROR_ROOM_DATA",
});

module.exports = {
  STATS_OPERATIONS,
  ROOM_EVENTS,

  SOCKET_ROOM_EVENTS,
  SOCKET_MESSAGE_EVENTS,
  SOCKET_SYSTEM_EVENTS,

  PERSISTENCE_MODES,

  CHAT_ERROR_CODES,

  MESSAGE_LIMITS,
  TIMING_CONFIG,
};
