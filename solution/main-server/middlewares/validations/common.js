/**
 * @fileoverview Modulo che definisce pattern di validazione comuni riutilizzabili in tutta l'applicazione.
 * Questi validatori sono basati su `express-validator` e possono essere importati e usati
 * in vari middleware di validazione specifici per le rotte.
 */

const { query, param } = require("express-validator");
const { MOVIE_VALIDATION_LIMITS } = require("../../config/constants");

const valTitle = query("title")
  .optional()
  .trim()
  .isLength({
    min: MOVIE_VALIDATION_LIMITS.TITLE_MIN_LENGTH,
    max: MOVIE_VALIDATION_LIMITS.TITLE_MAX_LENGTH,
  })
  .withMessage(
    `Title must be between ${MOVIE_VALIDATION_LIMITS.TITLE_MIN_LENGTH} and ${MOVIE_VALIDATION_LIMITS.TITLE_MAX_LENGTH} characters`,
  );

const valPage = query("page")
  .optional()
  .isInt({
    min: MOVIE_VALIDATION_LIMITS.PAGE_MIN,
    max: MOVIE_VALIDATION_LIMITS.PAGE_MAX,
  })
  .withMessage(
    `Page must be a number between ${MOVIE_VALIDATION_LIMITS.PAGE_MIN} and ${MOVIE_VALIDATION_LIMITS.PAGE_MAX}`,
  )
  .toInt();

const valLimit = query("limit")
  .optional()
  .isInt({
    min: MOVIE_VALIDATION_LIMITS.LIMIT_MIN,
    max: MOVIE_VALIDATION_LIMITS.LIMIT_MAX,
  })
  .withMessage(
    `Limit must be a number between ${MOVIE_VALIDATION_LIMITS.LIMIT_MIN} and ${MOVIE_VALIDATION_LIMITS.LIMIT_MAX}`,
  )
  .toInt();

const valMovieId = param("movieId")
  .isInt({ min: MOVIE_VALIDATION_LIMITS.MOVIE_ID_MIN })
  .withMessage("Movie ID must be a positive number")
  .toInt();

module.exports = {
  valTitle,
  valPage,
  valLimit,
  valMovieId,
};
