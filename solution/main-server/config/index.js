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
 * @namespace serverConfig
 * @description Configurazione del server Express principale
 */
const serverConfig = {
  port: getEnvAsIntOrDefault("MAIN_SERVER_PORT", 3000),
  environment: getEnvOrDefault("NODE_ENV", "development"),
};

/**
 * @namespace servicesConfig
 * @description Configurazione dei microservizi esterni
 */
const servicesConfig = {
  springBoot: {
    url: getEnvOrDefault("SPRING_BOOT_SERVER_URL", "http://localhost:8081"),
    timeout: getEnvAsIntOrDefault("SPRING_BOOT_SERVER_TIMEOUT", 8000),
  },

  otherExpress: {
    // mongoDB
    url: getEnvOrDefault("OTHER_EXPRESS_SERVER_URL", "http://localhost:3001"),
    timeout: getEnvAsIntOrDefault("OTHER_EXPRESS_SERVER_TIMEOUT", 5000), // MongoDB è più veloce
  },
};

const socketConfig = {
  cors: {
    origin: [
      getEnvOrDefault("SPRING_BOOT_SERVER_URL", "http://localhost:8081"),
    ],
    methods: ["GET", "POST"],
    credentials: false,
  },
};

/**
 * @namespace corsConfig
 * @description Configurazione CORS per Express
 */
const corsConfig = {
  origin: [
    getEnvOrDefault("OTHER_EXPRESS_SERVER_URL", "http://localhost:3001"),
    getEnvOrDefault("SPRING_BOOT_SERVER_URL", "http://localhost:8081"),
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Permette invio cookies/auth headers
};

const morganConfig = "dev";

const jsonConfig = {};
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
