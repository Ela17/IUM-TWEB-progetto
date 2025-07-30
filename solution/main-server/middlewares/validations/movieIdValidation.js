const { valMovieId } = require("./common");
const {validationErrorHandler} =  require('./validationErrorHandler')

/**
 * @module MovieIdValidation
 * @description Modulo che contiene il middleware di validazione per il parametro `movieId`.
 * Utilizza `express-validator` per assicurare che l'ID del film sia un valore valido prima
 * che la richiesta venga processata dal controller.
 */

validateMovieId = [
    valMovieId,
    validationErrorHandler
]

module.exports = {
  validateMovieId,
};
