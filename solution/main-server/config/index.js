// dotenv.config() è stato chiamato già in bin/www.
// Mi basta accedere a process.env che contiene le variabili d'ambiente.

const getEnvOrDefault = (key, defaultValue) => process.env[key] || defaultValue;
const getEnvAsIntOrDefault = (key, defaultValue) =>
  parseInt(process.env[key]) || defaultValue;
/*
const getEnvAsArrayOrDefault = (key, defaultValue) => {
  const envVar = process.env[key];
  if (envVar) {
    return envVar.split(',').map(item => item.trim());
  }
  return defaultValue;
};
*/

// server principale
const serverConfig = {
  port: getEnvAsIntOrDefault("PORT", 3000),
  enviroment: getEnvOrDefault("NODE_ENV", "development"),
};

// microservizi
const servicesConfig = {
  springBoot: {
    url: getEnvOrDefault("SPRING_BOOT_SERVER_URL", "http://localhost:8080"), // Porta tipica di Spring Boot
    timeout: getEnvAsIntOrDefault("SPRING_BOOT_SERVER_TIMEOUT", 8000), // Timeout più alto per il DB relazionale o logica complessa
  },

  otherExpress: {
    // mongoDB
    url: getEnvOrDefault("OTHER_EXPRESS_SERVER_URL", "http://localhost:3001"), // Porta tipica per un altro Express
    timeout: getEnvAsIntOrDefault("OTHER_EXPRESS_SERVER_TIMEOUT", 5000),
  },
};

morganConfig = "dev";

jsonConfig = {};
urlencodedConfig = { extended: true };

module.exports = {
  serverConfig,
  servicesConfig,
  /*socketConfig,
  corsConfig,*/
  morganConfig,
  jsonConfig,
  urlencodedConfig,
};
