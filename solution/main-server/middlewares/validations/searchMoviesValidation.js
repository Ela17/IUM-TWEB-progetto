const { query } = require("express-validator");
const { valTitle, valPage, valLimit } = require("./common");
const { validationErrorHandler } = require("./validationErrorHandler");

/**
 * @module moviesValidation
 * @description Modulo che contiene i middleware di validazione per le operazioni sui film.
 * Utilizza `express-validator` per definire le regole di validazione per i parametri di query,
 * assicurando che i dati in ingresso siano conformi alle aspettative prima di essere passati ai controller.
 */

const valYearFrom = query("year_from")
  .optional()
  .isInt({ min: 1900, max: 2050 })
  .withMessage("Min year must be between 1900 and 2050")
  .toInt();

const valYearTo = query("year_to")
  .optional()
  .isInt({ min: 1900, max: 2050 })
  .withMessage("Max year must be between 1900 and 2050")
  .toInt();

const valMinRating = query("min_rating")
  .optional()
  .isFloat({ min: 0, max: 5 })
  .withMessage("Min rating must be between 0 and 5")
  .toFloat();

const valMaxRating = query("max_rating")
  .optional()
  .isFloat({ min: 0, max: 5 })
  .withMessage("Max rating must be between 0 and 5")
  .toFloat();

const validateMovieSearch = [
  valTitle,
  valPage,
  valLimit,
  valYearFrom,
  valYearTo,
  valMinRating,
  valMaxRating,
  validationErrorHandler,
];

module.exports = {
  validateMovieSearch,
};
