// main-server/services/ProxyCallerService.js

const axios = require("axios");
const createError = require("http-errors");
const { servicesConfig } = require("../config");

/**
 * Array di metodi HTTP consentiti.
 * Utilizzato per validare i metodi passati ai metodi di chiamata.
 * @type {Array<string>}
 */
const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE"];

/**
 * @class ProxyCallerService
 * @description Gestisce le chiamate HTTP ai microservizi esterni (Spring Boot e un altro server Express).
 * Agisce come un livello di proxy centralizzato, incapsulando la logica di comunicazione
 * e la gestione degli errori per le richieste tra il Main Server e i servizi dipendenti.
 * Le configurazioni (URL e timeout) vengono caricate dal modulo `config/index.js`.
 */
class ProxyCallerService {
  constructor() {
    this.springBootUrl = servicesConfig.springBoot.url;
    this.springBootTimeout = servicesConfig.springBoot.timeout;
    this.otherExpressUrl = servicesConfig.otherExpress.url;
    this.otherExpressTimeout = servicesConfig.otherExpress.timeout;

    console.log(`ProxyCallerServices initialized!`);
    console.log(`Spring Boot Server URL: ${this.springBootUrl}`);
    console.log(`Other Express Server URL: ${this.otherExpressUrl}`);
  }

  /**
   * @private
   * @method _prepareError
   * @description Prepara un oggetto errore standardizzato con dettagli aggiuntivi.
   * @param {Error} originalError - L'errore originale catturato.
   * @param {string} serviceType - Una stringa che identifica il tipo di servizio.
   * @returns {Error} Un oggetto errore `http-errors` arricchito.
   */
  _prepareError(originalError, serviceType) {
    const status = originalError.response?.status || 500;
    const message = originalError.response?.data?.message || `Internal error`;
    const err = createError(status, message);

    err.additionalDetails = {
      serviceType: serviceType,
      originalError: originalError.message,
      originalResponseData: originalError.response?.data,
    };
    return err;
  }

  /**
   * @method callSpringBoot
   * @description Effettua una chiamata HTTP al microservizio Spring Boot.
   * Questo servizio è responsabile della gestione dei "dati statici" e accede al DB PostgreSQL.
   * @param {string} endpoint - L'endpoint specifico da chiamare sul server Spring Boot (es. '/api/movies/123').
   * @param {string} [method='GET'] - Il metodo HTTP da utilizzare (GET, POST, PUT, DELETE, PATCH).
   * @param {Object|null} [data=null] - Il payload della richiesta per i metodi POST/PUT/PATCH.
   * @returns {Promise<import('axios').AxiosResponse>} Una Promise che si risolve con la risposta Axios.
   * @throws {Error} Lancia un errore se la chiamata fallisce, arricchito con `serviceType`.
   */
  async callSpringBoot(endpoint, method = "GET", data = null) {
    if (!ALLOWED_METHODS.includes(method.toUpperCase())) {
      throw createError(405, `HTTP method not allowed: ${method}`);
    }

    const axiosCallConfig = {
      method: method.toUpperCase(),
      url: `${this.springBootUrl}${endpoint}`,
      timeout: this.springBootTimeout,
      maxRedirects: 0,
    };

    if (data && ["POST", "PUT"].includes(method.toUpperCase())) {
      axiosCallConfig.data = data;
    }

    try {
      console.log(`Call to Spring Boot: ${method.toUpperCase()} ${endpoint}`);
      const response = await axios(axiosCallConfig);
      return response;
    } catch (error) {
      console.error(
        `❌ ProxyCallerService -> Errore Spring Boot ${endpoint}:`,
        error.message,
      );
      throw this._prepareError(error, "SPRING_BOOT_SERVER");
    }
  }

  /**
   * @method callOtherExpress
   * @description Effettua una chiamata HTTP all'altro microservizio Express.
   * Questo servizio è responsabile della gestione dei "dati dinamici" (es. recensioni) e accede al MongoDB.
   * @param {string} endpoint - L'endpoint specifico da chiamare sul server Other Express (es. '/api/reviews/movie/123').
   * @param {string} [method='GET'] - Il metodo HTTP da utilizzare (GET, POST, PUT, DELETE, PATCH).
   * @param {Object|null} [data=null] - Il payload della richiesta per i metodi POST/PUT/PATCH.
   * @returns {Promise<import('axios').AxiosResponse>} Una Promise che si risolve con la risposta Axios.
   * @throws {Error} Lancia un errore se la chiamata fallisce, arricchito con `serviceType`.
   */
  async callOtherExpress(endpoint, method = "GET", data = null) {
    if (!ALLOWED_METHODS.includes(method.toUpperCase())) {
      throw createError(405, `HTTP method not allowed: ${method}`);
    }

    const axiosCallConfig = {
      method: method.toUpperCase(),
      url: `${this.otherExpressUrl}${endpoint}`,
      timeout: this.otherExpressTimeout,
      maxRedirects: 0,
    };

    if (data && ["POST", "PUT"].includes(method.toUpperCase())) {
      axiosCallConfig.data = data;
    }

    try {
      console.log(`Call to Other Express: ${method.toUpperCase()} ${endpoint}`);
      const response = await axios(axiosCallConfig);
      return response;
    } catch (error) {
      console.error(
        `❌ ProxyCallerService -> Errore Other Express ${endpoint}:`,
        error.message,
      );
      throw this._prepareError(error, "OTHER_EXPRESS_SERVER");
    }
  }
}

module.exports = new ProxyCallerServices(); // singletone
