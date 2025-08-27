/**
 * @fileoverview Servizio proxy per le chiamate HTTP ai microservizi esterni.
 *
 * Modulo che gestisce le chiamate a Spring Boot e Other Express Server.
 * Agisce come livello di proxy centralizzato per la comunicazione tra servizi.
 */

const axios = require("axios");
const createError = require("http-errors");
const { servicesConfig } = require("../config");

/**
 * Array di metodi HTTP consentiti.
 * Utilizzato per validare i metodi passati ai metodi di chiamata.
 * @type {Array<string>}
 */
const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE"];

const springBootUrl = servicesConfig.springBoot.url;
const springBootTimeout = servicesConfig.springBoot.timeout;
const otherExpressUrl = servicesConfig.otherExpress.url;
const otherExpressTimeout = servicesConfig.otherExpress.timeout;

console.log(`🚀 proxyService initialized!`);
console.log(`🌐 Spring Boot Server URL: ${springBootUrl}`);
console.log(`🌐 Other Express Server URL: ${otherExpressUrl}`);

/**
 * @function prepareError
 * @description Prepara un oggetto errore standardizzato con dettagli aggiuntivi a partire dall errore di axios.
 * @param {Error} axiosError - L'errore di axios.
 * @param {string} serviceType - Una stringa che identifica il tipo di servizio.
 * @returns {Error} Un oggetto errore `http-errors` arricchito dagli errori.
 */
const prepareError = (axiosError, serviceType) => {
  axiosError.additionalDetails = {
    serviceType: serviceType,
    ...axiosError.response?.data, // Include i dati di errore della risposta se disponibili
  };
  return axiosError;
};

/**
 * @function callSpringBoot
 * @description Effettua una chiamata HTTP al microservizio Spring Boot.
 * Questo servizio è responsabile della gestione dei "dati statici" e accede al DB PostgreSQL.
 * @param {string} endpoint - L'endpoint specifico da chiamare
 * @param {string} [method='GET'] - Il metodo HTTP da utilizzare
 * @param {Object|null} [data=null] - Il payload della richiesta
 * @returns {Promise<import('axios').AxiosResponse>} Promise che si risolve con la risposta Axios
 * @throws {Error} Se il metodo HTTP non è supportato
 * @throws {Error} Se la connessione al servizio Spring Boot fallisce
 * @throws {Error} Se il servizio Spring Boot restituisce un errore HTTP
 */
const callSpringBoot = async (endpoint, method = "GET", data = null, timeoutOverrideMs = null) => {
  if (!ALLOWED_METHODS.includes(method.toUpperCase())) {
    throw createError(405, `HTTP method not allowed: ${method}`, {
      additionalDetails: { serviceType: "SPRING_BOOT_SERVER" },
    });
  }

  const axiosCallConfig = {
    method: method.toUpperCase(),
    url: `${springBootUrl}${endpoint}`,
    timeout: typeof timeoutOverrideMs === "number" ? timeoutOverrideMs : springBootTimeout,
    maxRedirects: 0,
  };

  if (data && ["POST", "PUT"].includes(method.toUpperCase())) {
    axiosCallConfig.data = data;
  }

  try {
    console.log(`Calling Spring Boot: ${method.toUpperCase()} ${endpoint}`);
    const response = await axios(axiosCallConfig);
    return response;
  } catch (error) {
    console.error(
      `❌ proxyService -> Spring Boot Error at ${endpoint}:`,
      error.message,
    );
    throw prepareError(error, "SPRING_BOOT_SERVER");
  }
};

/**
 * @function callOtherExpress
 * @description Effettua una chiamata HTTP all'altro microservizio Express.
 * Questo servizio è responsabile della gestione dei "dati dinamici" (es. recensioni) e accede al MongoDB.
 * @param {string} endpoint - L'endpoint specifico da chiamare sul server Other Express (es. '/api/reviews/movie/123').
 * @param {string} [method='GET'] - Il metodo HTTP da utilizzare (GET, POST, PUT, DELETE, PATCH).
 * @param {Object|null} [data=null] - Il payload della richiesta per i metodi POST/PUT/PATCH.
 * @returns {Promise<import('axios').AxiosResponse>} Una Promise che si risolve con la risposta Axios.
 * @throws {Error} Lancia un errore se la chiamata fallisce, arricchito con `serviceType`.
 */
const callOtherExpress = async (endpoint, method = "GET", data = null) => {
  if (!ALLOWED_METHODS.includes(method.toUpperCase())) {
    throw createError(405, `HTTP method not allowed: ${method}`, {
      additionalDetails: { serviceType: "OTHER_EXPRESS_SERVER" },
    });
  }

  const axiosCallConfig = {
    method: method.toUpperCase(),
    url: `${otherExpressUrl}${endpoint}`,
    timeout: otherExpressTimeout,
    maxRedirects: 0,
  };

  if (data && ["POST", "PUT"].includes(method.toUpperCase())) {
    axiosCallConfig.data = data;
  }

  try {
    console.log(`Calling Other Express: ${method.toUpperCase()} ${endpoint}`);
    const response = await axios(axiosCallConfig);
    return response;
  } catch (error) {
    console.error(
      `❌ proxyService -> Other Express Error at ${endpoint}:`,
      error.message,
    );
    throw prepareError(error, "OTHER_EXPRESS_SERVER");
  }
};

module.exports = {
  callSpringBoot,
  callOtherExpress,
  async getGlobalReviewsCount() {
    const response = await callOtherExpress(`/api/reviews/stats/global`);
    return response.data?.data?.totalReviews ?? 0;
  },
};
