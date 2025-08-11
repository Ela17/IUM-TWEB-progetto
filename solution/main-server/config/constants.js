/**
 * @description Costanti centralizzate per il Main Server Express.
 *
 * Tutte le costanti sono immutabili (Object.freeze) per prevenire modifiche accidentali.
 */

/**
 * @enum {number}
 * @readonly
 * @description Limiti di validazione per parametri di ricerca film
 */
const MOVIE_VALIDATION_LIMITS = Object.freeze({
  // Titolo film
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 100,

  // Paginazione
  PAGE_MIN: 1,
  PAGE_MAX: 1000,
  LIMIT_MIN: 1,
  LIMIT_MAX: 50,

  // ID film
  MOVIE_ID_MIN: 1,
  MOVIE_ID_MAX: 999999999,

  // Anno di uscita
  YEAR_MIN: 1874,
  YEAR_MAX: 2031,

  // Rating
  RATING_MIN: 0.0,
  RATING_MAX: 5.0,

  // Genere
  GENRE_MIN_LENGTH: 2,
  GENRE_MAX_LENGTH: 50,
});

/**
 * @enum {number}
 * @readonly
 * @description Valori di default per paginazione e ricerca
 */
const DEFAULT_VALUES = Object.freeze({
  PAGE: 1,
  LIMIT: 20,
  SORT_ORDER: "desc",
  SORT_BY: "date",
  RATING_MIN: 0.0,
  RATING_MAX: 5.0,
});

module.exports = {
  MOVIE_VALIDATION_LIMITS,
  DEFAULT_VALUES,
};
