const { validationResult } = require("express-validator");

/**
 * @module validationErrorHandler
 * @description Middleware per controllare e gestire gli errori di validazione raccolti da `express-validator`.
 * Se vengono rilevati errori di validazione, viene creato un errore HTTP 400 (Bad Request)
 * contenente i dettagli degli errori e passato al prossimo middleware di gestione errori.
 */

const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationError = new Error("Parametri di ricerca non validi");
    validationError.name = "Validation Error";
    validationError.code = "VALIDATION_ERROR_SEARCH_MOVIES";
    validationError.status = 400;

    validationError.additionalDetails = errors.mapped();

    return next(validationError);
  }

  next();
};

module.exports = { validationErrorHandler };