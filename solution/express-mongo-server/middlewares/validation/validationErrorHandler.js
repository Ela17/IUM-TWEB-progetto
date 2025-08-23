/**
 * @fileoverview Middleware per gestione errori di validazione
 * @module validationErrorHandler
 * @description Gestisce gli errori raccolti da express-validator e li formatta
 * in una risposta standard per il client
 */

const { validationResult } = require("express-validator");

/**
 * Middleware per gestire errori di validazione
 * Controlla se ci sono errori di validazione e li passa al gestore errori
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
function validationErrorHandler(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationError = new Error("Validation failed");
    validationError.name = "ValidationError";
    validationError.status = 400;
    validationError.code = "VALIDATION_ERROR";
    validationError.details = errors.mapped();

    return next(validationError);
  }

  next();
}

module.exports = validationErrorHandler;
