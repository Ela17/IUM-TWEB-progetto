const { query } = require("express-validator");
const { valTitle, valPage, valLimit } = require("./common");
const { validationErrorHandler } = require("./validationErrorHandler");
const { MOVIE_VALIDATION_LIMITS } = require("../../config/constants");

/**
 * @module moviesValidation
 * @description Modulo che contiene i middleware di validazione per le operazioni sui film.
 * Utilizza `express-validator` per definire le regole di validazione per i parametri di query,
 * assicurando che i dati in ingresso siano conformi alle aspettative prima di essere passati ai controller.
 */

const valYearFrom = query("year_from")
  .optional()
  .isInt({
    min: MOVIE_VALIDATION_LIMITS.YEAR_MIN,
    max: MOVIE_VALIDATION_LIMITS.YEAR_MAX,
  })
  .withMessage(
    `Min year must be between ${MOVIE_VALIDATION_LIMITS.YEAR_MIN} and ${MOVIE_VALIDATION_LIMITS.YEAR_MAX}`,
  )
  .toInt();

const valYearTo = query("year_to")
  .optional()
  .isInt({
    min: MOVIE_VALIDATION_LIMITS.YEAR_MIN,
    max: MOVIE_VALIDATION_LIMITS.YEAR_MAX,
  })
  .withMessage(
    `Max year must be between ${MOVIE_VALIDATION_LIMITS.YEAR_MIN} and ${MOVIE_VALIDATION_LIMITS.YEAR_MAX}`,
  )
  .toInt();

const valMinRating = query("min_rating")
  .optional()
  .isFloat({
    min: MOVIE_VALIDATION_LIMITS.RATING_MIN,
    max: MOVIE_VALIDATION_LIMITS.RATING_MAX,
  })
  .withMessage(
    `Min rating must be between ${MOVIE_VALIDATION_LIMITS.RATING_MIN} and ${MOVIE_VALIDATION_LIMITS.RATING_MAX}`,
  )
  .toFloat();

const valMaxRating = query("max_rating")
  .optional()
  .isFloat({
    min: MOVIE_VALIDATION_LIMITS.RATING_MIN,
    max: MOVIE_VALIDATION_LIMITS.RATING_MAX,
  })
  .withMessage(
    `Max rating must be between ${MOVIE_VALIDATION_LIMITS.RATING_MIN} and ${MOVIE_VALIDATION_LIMITS.RATING_MAX}`,
  )
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
