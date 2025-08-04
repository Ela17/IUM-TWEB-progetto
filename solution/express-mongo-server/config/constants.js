/**
 * @fileoverview Costanti centralizzate per l'applicazione
 * @description Contiene tutte le costanti riutilizzabili per evitare inconsistenze
 */

// === VALIDAZIONE E LIMITI ===
const VALIDATION_LIMITS = {
  // Messaggi
  MESSAGE_MAX_LENGTH: 1000,
  MESSAGE_MIN_LENGTH: 1,
  
  // Utenti
  NICKNAME_MIN_LENGTH: 10,
  NICKNAME_MAX_LENGTH: 25,
  
  // Stanze
  ROOM_NAME_MIN_LENGTH: 3,
  ROOM_NAME_MAX_LENGTH: 50,
  ROOM_TOPIC_MIN_LENGTH: 5,
  ROOM_TOPIC_MAX_LENGTH: 200,
  
  // Paginazione
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
  MIN_PAGE: 1,
  MAX_PAGE: 1000,
  
  // Review
  REVIEW_CONTENT_MAX_LENGTH: 1000,
  REVIEW_MIN_SCORE: 0,
  REVIEW_MAX_SCORE: 10
};

// === CONFIGURAZIONI DATABASE ===
const DATABASE_CONFIG = {
  DEFAULT_BATCH_SIZE: 1000,
  CONNECTION_TIMEOUT: 10000,
  SOCKET_TIMEOUT: 45000,
  MAX_POOL_SIZE: 10
};

// === CLEANUP E MANUTENZIONE ===
const CLEANUP_CHAT_CONFIG = {
  INACTIVE_ROOM_THRESHOLD_DAYS: 7,
  CLEANUP_INTERVAL_MS: 7 * 24 * 60 * 60 * 1000, // 7 giorni in ms
};

// === REGEX PATTERNS ===
const VALIDATION_PATTERNS = {
  UNIQUE_TIMESTAMP: /^\d+_\d{3}$/,
  ROOM_NAME: /^[a-zA-Z0-9_-]+$/,
  USERNAME: /^[a-zA-Z_0-9]+$/
};

// === VALORI ENUM ===
const ENUMS = {
  // Review types da Rotten Tomatoes CSV
  REVIEW_TYPES: ["Fresh", "Rotten", "Certified Fresh", "Spilled"],
  
  // Ordinamento
  SORT_FIELDS: ["review_date", "review_score", "film_date", "name"],
  SORT_ORDERS: ["asc", "desc"],

  // Release types dai CSV
  RELEASE_TYPES: ["Theatrical", "Digital", "DVD", "Blu-ray", "TV"],
  
  // Ruoli crew dai CSV
  CREW_ROLES: ["Director", "Producer", "Writer", "Cinematographer", "Editor"],
  
  // Categorie Oscar dai CSV
  OSCAR_CATEGORIES: [
    "Best Picture", "Best Director", "Best Actor", "Best Actress",
    "Best Supporting Actor", "Best Supporting Actress"
  ],
  
  // Stati chat room
  ROOM_STATUS: ["active", "inactive", "archived"]
};

module.exports = {
  VALIDATION_LIMITS,
  DATABASE_CONFIG,
  CLEANUP_CONFIG,
  VALIDATION_PATTERNS,
  ENUMS
};