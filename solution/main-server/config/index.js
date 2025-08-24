/**
 * @file config/index.js
 * @description Configurazione centralizzata per il Main Server Express.
 *
 * Questo modulo gestisce tutte le configurazioni dell'applicazione caricando
 * le variabili d'ambiente e fornendo valori di default robusti per lo sviluppo.
 *
 * IMPORTANTE: dotenv.config() è già stato chiamato in bin/www
 */

/**
 * @function getEnvOrDefault
 * @description Recupera una variabile d'ambiente stringa con fallback al valore di default
 * @param {string} key - Nome della variabile d'ambiente
 * @param {string} defaultValue - Valore di default se la variabile non è definita
 * @returns {string} Valore della variabile d'ambiente o default
 */
const getEnvOrDefault = (key, defaultValue) => process.env[key] || defaultValue;

/**
 * @function getEnvAsIntOrDefault
 * @description Recupera una variabile d'ambiente come numero intero con validazione
 * @param {string} key - Nome della variabile d'ambiente
 * @param {number} defaultValue - Valore di default se la variabile non è valida
 * @returns {number} Valore numerico della variabile d'ambiente o default
 */
const getEnvAsIntOrDefault = (key, defaultValue) =>
  parseInt(process.env[key]) || defaultValue;

/**
 * @typedef {Object} ServerConfig
 * @description Configurazione del server Express principale
 * @property {number} port - Porta su cui il server è in ascolto
 * @property {string} environment - Ambiente di esecuzione (development/production)
 */
const serverConfig = {
  port: getEnvAsIntOrDefault("MAIN_SERVER_PORT", 3000),
  environment: getEnvOrDefault("NODE_ENV", "development"),
};

/**
 * @typedef {Object} SpringBootConfig
 * @description Configurazione per il servizio Spring Boot
 * @property {string} url - URL del servizio Spring Boot
 * @property {number} timeout - Timeout per le richieste in millisecondi
 */

/**
 * @typedef {Object} OtherExpressConfig
 * @description Configurazione per il servizio MongoDB Express
 * @property {string} url - URL del servizio MongoDB Express
 * @property {number} timeout - Timeout per le richieste in millisecondi
 */

/**
 * @typedef {Object} ServicesConfig
 * @description Configurazione dei microservizi esterni
 * @property {SpringBootConfig} springBoot - Configurazione per il servizio Spring Boot
 * @property {OtherExpressConfig} otherExpress - Configurazione per il servizio MongoDB Express
 */
const servicesConfig = {
  springBoot: {
    url: getEnvOrDefault("SPRING_BOOT_SERVER_URL", "http://localhost:8081"),
    timeout: getEnvAsIntOrDefault("SPRING_BOOT_SERVER_TIMEOUT", 8000),
  },

  otherExpress: {
    url: getEnvOrDefault("OTHER_EXPRESS_SERVER_URL", "http://localhost:3001"),
    timeout: getEnvAsIntOrDefault("OTHER_EXPRESS_SERVER_TIMEOUT", 5000), // MongoDB è più veloce
  },
};

/**
 * @typedef {Object} SocketConfig
 * @description Configurazione Socket.IO per la chat in tempo reale
 * @property {Object} cors - Configurazione CORS per Socket.IO
 * @property {string[]} cors.origin - URL consentiti per le connessioni Socket.IO
 * @property {string[]} cors.methods - Metodi HTTP consentiti per Socket.IO
 * @property {boolean} cors.credentials - Se permettere l'invio di credenziali
 */
const socketConfig = {
  cors: {
    origin: [
      getEnvOrDefault("MAIN_SERVER_URL", "http://localhost:3000"),
    ],
    methods: ["GET", "POST"],
    credentials: false,
  },
};

/**
 * @typedef {Object} CorsConfig
 * @description Configurazione CORS per Express middleware
 * @property {string[]} origin - URL consentiti per le richieste cross-origin
 * @property {string[]} methods - Metodi HTTP consentiti
 * @property {boolean} credentials - Se permettere l'invio di cookies/auth headers
 */
const corsConfig = {
  origin: [
    getEnvOrDefault("OTHER_EXPRESS_SERVER_URL", "http://localhost:3001"),
    getEnvOrDefault("SPRING_BOOT_SERVER_URL", "http://localhost:8081"),
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Permette invio cookies/auth headers
};

/**
 * @type {string} MorganConfig
 * @description Configurazione per il middleware Morgan (HTTP request logger)
 */
const morganConfig = "dev";

/**
 * @type {Object} JsonConfig
 * @description per il middleware express.json()
 */
const jsonConfig = {};

/**
 * @typedef {Object} UrlencodedConfig
 * @description Configurazione per il middleware express.urlencoded()
 * @property {boolean} extended - Se utilizzare il parser esteso per oggetti complessi
 */
const urlencodedConfig = { extended: true };

module.exports = {
  serverConfig,
  servicesConfig,
  socketConfig,
  corsConfig,
  morganConfig,
  jsonConfig,
  urlencodedConfig,
};
