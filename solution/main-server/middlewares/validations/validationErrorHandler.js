// solution/main-server/middlewares/validations/validationErrorHandler.js

/**
 * @module validationErrorHandler
 * @description Middleware per controllare e gestire gli errori di validazione raccolti da `express-validator`.
 * Se vengono rilevati errori di validazione, viene creato un errore HTTP 400 (Bad Request)
 * contenente i dettagli degli errori e passato al prossimo middleware di gestione errori.
 */

// TODO