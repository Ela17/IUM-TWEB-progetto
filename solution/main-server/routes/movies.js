const express = require("express");

const {
  validateMovieId,
} = require("../middlewares/validations/movieIdValidation");
const {
  validateMovieSearch,
} = require("../middlewares/validations/searchMoviesValidation");

const moviesController = require("../controllers/moviesController");

const router = express.Router();

/**
 * @swagger
 * /movies/search:
 *   get:
 *     summary: Ricerca Film
 *     description: Permette di cercare film basandosi su vari parametri (titolo, genere, anno, rating, paginazione).
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Titolo del film.
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Genere del film.
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Anno di uscita del film.
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *         description: Valutazione minima del film.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numero di pagina per la paginazione.
 *     responses:
 *       200:
 *         description: Risultati della ricerca ottenuti con successo.
 *       400:
 *         description: Parametri di ricerca non validi.
 */
router.get(
  "/movies/search",
  validateMovieSearch, // middleware di validazione
  moviesController.searchMovies // Delega al controller
);

/**
 * @swagger
 * /movies/suggestions:
 *   get:
 *     summary: Suggerimenti Film
 *     description: Fornisce suggerimenti di film basati su una stringa di query parziale.
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Stringa di ricerca parziale per i suggerimenti.
 *     responses:
 *       200:
 *         description: Suggerimenti ottenuti con successo.
 */
router.get(
  "/movies/suggestions",
  moviesController.getSuggestions
);

/**
 * @swagger
 * /movies/{movieId}:
 *   get:
 *     summary: Dettagli Film
 *     description: Recupera i dettagli completi di un film, inclusi recensioni e statistiche aggregate.
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del film.
 *     responses:
 *       200:
 *         description: Dettagli del film recuperati con successo.
 *       400:
 *         description: ID del film non valido.
 *       404:
 *         description: Film non trovato.
 */
router.get(
  "/movies/:movieId",
  validateMovieId, // Middleware di validazione
  moviesController.getMovieDetails
);

/**
 * @swagger
 * /movies/{movieId}/reviews:
 *   get:
 *     summary: Recensioni Film
 *     description: Recupera le recensioni per un film specifico con paginazione.
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del film.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numero di pagina per la paginazione delle recensioni.
 *     responses:
 *       200:
 *         description: Recensioni del film recuperate con successo.
 *       400:
 *         description: ID del film o parametri non validi.
 *       404:
 *         description: Film non trovato.
 */
router.get(
  "/movies/:movieId/reviews",
  validateMovieId,
  moviesController.getMovieReviews
);

/**
 * @swagger
 * /movies/{movieId}/reviews/stats:
 *   get:
 *     summary: Statistiche Recensioni Film
 *     description: Recupera le statistiche aggregate delle recensioni per un film.
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del film.
 *     responses:
 *       200:
 *         description: Statistiche delle recensioni recuperate con successo.
 *       400:
 *         description: ID del film non valido.
 *       404:
 *         description: Film o recensioni non trovate.
 */
router.get(
  "/movies/:movieId/reviews/stats",
  validateMovieId,
  moviesController.getMovieReviewsStats
);

module.exports = router;
