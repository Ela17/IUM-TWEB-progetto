const { query, param } = require("express-validator");
const { VALIDATION_LIMITS } = require("../../config/constants");

/**
 * @module common
 * @description Modulo che definisce pattern di validazione comuni riutilizzabili in tutta l'applicazione.
 * Questi validatori sono basati su `express-validator` e possono essere importati e usati
 * in vari middleware di validazione specifici per le rotte.
 */

const valTitle = query("title")
  .optional()
  .trim()
  .isLength({
    min: VALIDATION_LIMITS.ROOM_TOPIC_MIN_LENGTH,
    max: VALIDATION_LIMITS.ROOM_TOPIC_MAX_LENGTH,
  })
  .withMessage(
    `The title must be between ${VALIDATION_LIMITS.ROOM_TOPIC_MIN_LENGTH} and ${VALIDATION_LIMITS.ROOM_TOPIC_MAX_LENGTH} characters`,
  );

const valPage = query("page")
  .optional()
  .isInt({ min: VALIDATION_LIMITS.MIN_PAGE, max: VALIDATION_LIMITS.MAX_PAGE })
  .withMessage(
    `The page must be a number between ${VALIDATION_LIMITS.MIN_PAGE} and ${VALIDATION_LIMITS.MAX_PAGE}`,
  )
  .toInt();

const valLimit = query("limit")
  .optional()
  .isInt({
    min: VALIDATION_LIMITS.MIN_PAGE_SIZE,
    max: VALIDATION_LIMITS.MAX_PAGE_SIZE,
  })
  .withMessage(
    `The page must be a number between ${VALIDATION_LIMITS.MIN_PAGE_SIZE} and ${VALIDATION_LIMITS.MAX_PAGE_SIZE}`,
  )
  .toInt();

const valMovieId = param("movieId")
  .isInt({ min: 1 })
  .withMessage("Movie ID must be a positive number")
  .toInt();

module.exports = {
  valTitle,
  valPage,
  valLimit,
  valMovieId,
};
