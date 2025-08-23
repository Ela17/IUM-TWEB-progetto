/**
 * @fileoverview Middleware di validazione per le stanze
 * @module roomValidation
 * @description Validatori per le operazioni sulle stanze usando express-validator
 */

const { body, param } = require("express-validator");
const validationErrorHandler = require("./validationErrorHandler");
const {
  VALIDATION_LIMITS,
  VALIDATION_PATTERNS,
} = require("../../config/constants");

/**
 * Validazione per il salvataggio di una stanza
 */
const validateSaveRoom = [
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
    )
    .matches(VALIDATION_PATTERNS.ROOM_NAME)
    .withMessage(
      "Room name can only contain letters, numbers, underscores, and hyphens",
    ),

  validationErrorHandler,
];

/**
 * Validazione per aggiornamento attività stanza
 */
const validateUpdateActivity = [
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

  validationErrorHandler,
];

module.exports = {
  validateSaveRoom,
  validateUpdateActivity,
};
