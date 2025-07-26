// solution/main-server/routes/moviesRoutes.js

const express = require("express");
const MoviesController = require("../controllers/moviesController"); 
const { validateMovieId } = require('../middleware/validation/movieIdValidation'); 
const ProxyCallerServices = require("../services/proxyCallerServices"); 
const { validateMovieSearch } = require("../middleware/validation/searchMoviesValidation");

const router = express.Router();

const proxyCallerServices = ProxyCallerServices();
const moviesController = new MoviesController(proxyCallerServices);

/**
 * @api {get} /movies/search Ricerca Film
 * @apiGroup Movies
 * @apiDescription Permette di cercare film basandosi su vari parametri (titolo, genere, anno, rating, paginazione).
 * Il middleware `validateMovieSearch` valida i parametri della query prima che la richiesta sia gestita dal controller.
 */
router.get(
  "/movies/search",
  validateMovieSearch, // middleware di validazione
  moviesController.searchMovies.bind(moviesController) // Delega al controller
);

/**
 * @api {get} /movies/suggestions Suggerimenti Film
 * @apiGroup Movies
 * @apiDescription Fornisce suggerimenti di film basati su una stringa di query parziale.
 */
router.get(
  "/movies/suggestions",
  moviesController.getSuggestions.bind(moviesController) 
);

/**
 * @api {get} /movies/:movieId Dettagli Film
 * @apiGroup Movies
 * @apiDescription Recupera i dettagli completi di un film, inclusi recensioni e statistiche aggregate.
 * Il middleware `validateMovieId` valida l'ID del film prima che la richiesta sia gestita dal controller.
 */
router.get(
  "/movies/:movieId",
  validateMovieId, // Middleware di validazione
  moviesController.getMovieDetails.bind(moviesController)
);

module.exports = router;