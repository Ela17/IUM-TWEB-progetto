// solution/main-server/middlewares/validations/common.js

const { query, param } = require('express-validator');

/**
 * @module common
 * @description Modulo che definisce pattern di validazione comuni riutilizzabili in tutta l'applicazione.
 * Questi validatori sono basati su `express-validator` e possono essere importati e usati
 * in vari middleware di validazione specifici per le rotte.
 */

const valTitle = query('title')
  .optional()
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('Il titolo deve essere tra 2 e 100 caratteri');

const valPage = query('page')
  .optional()
  .isInt({ min: 1, max: 10000 })
  .withMessage('La pagina deve essere un numero tra 1 e 10000')
  .toInt();

const valLimit = query('limit')
  .optional()
  .isInt({ min: 1, max: 100 }).withMessage('Il limite deve essere un numero tra 1 e 100')
  .toInt();

const valMovieId = param('movieId')
  .isInt({ min: 1 }).withMessage('ID film deve essere un numero positivo')
  .toInt();

module.exports = {
  valTitle,
  valPage,
  valLimit,
  valMovieId
};