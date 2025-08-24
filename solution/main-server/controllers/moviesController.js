/**
 * @fileoverview Controller per la gestione delle operazioni relative ai film.
 * Agisce come proxy/aggregatore tra il frontend e i microservizi backend:
 * - Spring Boot (PostgreSQL) per i dati statici dei film
 * - Other Express Server (MongoDB) per le recensioni dinamiche
 */

const URLSearchParams = require("url").URLSearchParams;
const proxyService = require("../services/proxyService");

/**
 * @function searchMovies
 * @description Gestisce la richiesta di ricerca di film.
 * Recupera i parametri di ricerca dalla query string della richiesta,
 * li formatta e invia una richiesta al servizio Spring Boot.
 * @param {Object} req - L'oggetto Request, contenente i parametri della query.
 * @param {Object} res - L'oggetto Response per inviare la risposta al client.
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo.
 * @throws {Error} Lancia un errore se la chiamata al servizio esterno fallisce.
 */
const searchMovies = async (req, res, next) => {
  try {
    const searchParams = new URLSearchParams();

    if (req.query.title) searchParams.set("title", req.query.title);
    if (req.query.page) searchParams.set("page", req.query.page);
    if (req.query.limit) searchParams.set("limit", req.query.limit);
    if (req.query.genre) searchParams.set("genre", req.query.genre);
    if (req.query.year_from) searchParams.set("year_from", req.query.year_from);
    if (req.query.year_to) searchParams.set("year_to", req.query.year_to);
    if (req.query.min_rating)
      searchParams.set("min_rating", req.query.min_rating);
    if (req.query.max_rating)
      searchParams.set("max_rating", req.query.max_rating);

    const endpoint = `/api/movies/search?${searchParams.toString()}`;
    const springResponse = await proxyService.callSpringBoot(endpoint);

    res.json(springResponse.data);
  } catch (error) {
    next(error);
  }
};

/**
 * @function getMovieDetails
 * @description Gestisce la richiesta per recuperare i dettagli aggregati di un film.
 * Effettua chiamate parallele a due microservizi microservizi:
 * - Spring Boot per i dettagli del film.
 * - L'altro server Express per le recensioni e le statistiche delle recensioni.
 * Aggrega i risultati in un'unica risposta per il client.
 * @param {Object} req - L'oggetto Request contenente l'ID del film.
 * @param {Object} res - L'oggetto Response per inviare la risposta al client.
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo.
 * @throws {Error} Lancia un errore se la chiamata principale per i dettagli del film fallisce.
 */
const getMovieDetails = async (req, res, next) => {
  try {
    const movieId = parseInt(req.params.movieId);

    console.log(`Retrieving data for movie ID: ${movieId}`); // Chiamate in parallelo per aggregare i dati

    const [movieResult, reviewsResults, reviewsStats] =
      await Promise.allSettled([
        proxyService.callSpringBoot(`/api/movies/${movieId}`),
        proxyService.callOtherExpress(`/api/reviews/movie/${movieId}`),
        proxyService.callOtherExpress(
          `/api/reviews/movie/${movieId}/stats`,
        ),
      ]);

    if (movieResult.status === "rejected") {
      const error = movieResult.reason;
      error.additionalDetails = {
        ...(error.additionalDetails ?? {}),
        message: error.response?.data?.error || null,
        idMovie: error.response?.data?.movie_id || null,
        reviewsResults: reviewsResults.status,
      };
      next(error);
    } else {
      const response = {};

      if (reviewsResults.status === "rejected") {
        response.reviews = null;
        response.reviewsStat = null;
      } else {
        response.reviews = reviewsResults.value.data.data;
        response.reviewsStat = reviewsStats.value.data.data;
      }

      response.movieDetails = movieResult.value.data;

      res.status(200).json(response);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @function getSuggestions
 * @description Gestisce la richiesta per ottenere suggerimenti di film.
 * Invia la query al servizio Spring Boot.
 * @param {Object} req - L'oggetto Request contenente la query di suggerimento.
 * @param {Object} res - L'oggetto Response per inviare la risposta al client.
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo.
 * @throws {Error} Lancia un errore se la chiamata al servizio esterno fallisce.
 */
const getSuggestions = async (req, res, next) => {
  try {
    const searchParams = new URLSearchParams();
    if (req.query.q) searchParams.set("q", req.query.q);

    const endpoint = `/api/movies/suggestions?${searchParams.toString()}`;
    const springResponse = await proxyService.callSpringBoot(endpoint);

    res.json(springResponse.data);
  } catch (error) {
    next(error);
  }
};

/**
 * @function getMovieReviews
 * @description Recupera le recensioni per un film specifico con paginazione.
 * Proxy diretto verso l'endpoint: `/api/reviews/movie/:movieId`
 * @param {Object} req - L'oggetto Request contenente l'ID del film nei params.
 * @param {Object} res - L'oggetto Response per inviare la risposta al client.
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo.
 */
const getMovieReviews = async (req, res, next) => {
  try {
    const movieId = parseInt(req.params.movieId);

    const searchParams = new URLSearchParams();
    if (req.query.page) searchParams.set("page", req.query.page);
    if (req.query.sortBy) searchParams.set("sortBy", req.query.sortBy);
    if (req.query.orderBy) searchParams.set("orderBy", req.query.orderBy);

    const endpoint = `/api/reviews/movie/${movieId}?${searchParams.toString()}`;
    const response = await proxyService.callOtherExpress(endpoint);

    res.json(response.data.data);
  } catch (error) {
    next(error);
  }
};

/**
 * @function getMovieReviewsStats
 * @description Recupera le statistiche delle recensioni per un film.
 * Proxy diretto verso il tuo endpoint: `/api/reviews/movie/:movieId/stats`
 * @param {Object} req - L'oggetto Request contenente l'ID del film nei params.
 * @param {Object} res - L'oggetto Response per inviare la risposta al client.
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo.
 */
const getMovieReviewsStats = async (req, res, next) => {
  try {
    const movieId = parseInt(req.params.movieId);

    const endpoint = `/api/reviews/movie/${movieId}/stats`;
    const response = await proxyService.callOtherExpress(endpoint);

    res.json(response.data.data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchMovies,
  getMovieDetails,
  getSuggestions,
  getMovieReviews,
  getMovieReviewsStats,
};
