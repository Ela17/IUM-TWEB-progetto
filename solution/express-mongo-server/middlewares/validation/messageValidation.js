/**
 * @fileoverview Middleware di validazione per i messaggi
 * @module messageValidation
 * @description Validatori per le operazioni sui messaggi usando express-validator
 */

const { body, param, query } = require("express-validator");
const validationErrorHandler = require("./validationErrorHandler");
const { VALIDATION_LIMITS } = require("../../config/constants");

/**
 * Validazione per il salvataggio di un messaggio
 */
const validateSaveMessage = [
  body("uniqueTimestamp")
    .notEmpty()
    .withMessage("Timestamp is required")
    .isInt({ min: 0 })
    .withMessage("Timestamp must be a positive number"),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: VALIDATION_LIMITS.MESSAGE_MAX_LENGTH })
    .withMessage(
      `Message max ${VALIDATION_LIMITS.MESSAGE_MAX_LENGTH} characters`,
    ),

  body("userName")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({
      min: VALIDATION_LIMITS.USERNAME_MIN_LENGTH,
      max: VALIDATION_LIMITS.USERNAME_MAX_LENGTH,
    })
    .withMessage(
      `Username must be between ${VALIDATION_LIMITS.USERNAME_MIN_LENGTH} and ${VALIDATION_LIMITS.USERNAME_MAX_LENGTH} characters`,
    ),

  body("roomName")
    .trim()
    .notEmpty()
    .withMessage("Room name is required")
    .isLength({
      min: VALIDATION_LIMITS.ROOM_NAME_MIN_LENGTH,
      max: VALIDATION_LIMITS.ROOM_NAME_MAX_LENGTH,
    })
    .withMessage(
      `Room name must be between ${VALIDATION_LIMITS.ROOM_NAME_MIN_LENGTH} and ${VALIDATION_LIMITS.ROOM_NAME_MAX_LENGTH} characters`,
    ),

  validationErrorHandler,
];

/**
 * Validazione per recupero messaggi recenti
 */
const validateGetLatestMessages = [
  param("roomName")
    .trim()
    .notEmpty()
    .withMessage("Room name is required")
    .isLength({
      min: VALIDATION_LIMITS.ROOM_NAME_MIN_LENGTH,
      max: VALIDATION_LIMITS.ROOM_NAME_MAX_LENGTH,
    })
    .withMessage(
      `Room name must be between ${VALIDATION_LIMITS.ROOM_NAME_MIN_LENGTH} and ${VALIDATION_LIMITS.ROOM_NAME_MAX_LENGTH} characters`,
    ),

  query("page")
    .optional()
    .isInt({ min: VALIDATION_LIMITS.MIN_PAGE, max: VALIDATION_LIMITS.MAX_PAGE })
    .withMessage(
      `Page must be between ${VALIDATION_LIMITS.MIN_PAGE} and ${VALIDATION_LIMITS.MAX_PAGE}`,
    )
    .toInt(),

  validationErrorHandler,
];

/**
 * Validazione per recupero messaggi precedenti
 */
const validateGetMessagesBefore = [
  param("roomName")
    .trim()
    .notEmpty()
    .withMessage("Room name is required")
    .isLength({
      min: VALIDATION_LIMITS.ROOM_NAME_MIN_LENGTH,
      max: VALIDATION_LIMITS.ROOM_NAME_MAX_LENGTH,
    })
    .withMessage(
      `Room name must be between ${VALIDATION_LIMITS.ROOM_NAME_MIN_LENGTH} and ${VALIDATION_LIMITS.ROOM_NAME_MAX_LENGTH} characters`,
    ),

  param("timestamp")
    .notEmpty()
    .withMessage("Timestamp is required")
    .isInt({ min: 0 })
    .withMessage("Timestamp must be a positive number")
    .toInt(),

  validationErrorHandler,
];

module.exports = {
  validateSaveMessage,
  validateGetLatestMessages,
  validateGetMessagesBefore,
};
