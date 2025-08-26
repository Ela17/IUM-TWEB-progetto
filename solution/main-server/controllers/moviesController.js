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
    if (req.query.limit) searchParams.set("perPage", req.query.limit);
    if (req.query.genre) searchParams.set("genre", req.query.genre);
    if (req.query.year_from) searchParams.set("yearFrom", req.query.year_from);
    if (req.query.year_to) searchParams.set("yearTo", req.query.year_to);
    if (req.query.min_rating)
      searchParams.set("minRating", req.query.min_rating);
    if (req.query.max_rating)
      searchParams.set("maxRating", req.query.max_rating);

    const endpoint = `/api/movies/search?${searchParams.toString()}`;
    console.log(
      `🔍 Controller: Calling Spring Boot with endpoint: ${endpoint}`,
    );

    try {
      const springResponse = await proxyService.callSpringBoot(endpoint);
      console.log(
        `✅ Controller: Spring Boot response received:`,
        springResponse.status,
      );
      const payload = springResponse.data;
      // Normalizza i campi per il frontend: aggiunge alias `year` e garantisce rating numerico
      if (Array.isArray(payload?.data)) {
        payload.data = payload.data.map((m) => ({
          ...m,
          year: m.year ?? m.date ?? undefined,
          rating:
            typeof m.rating === "number" && !Number.isNaN(m.rating)
              ? Math.round(m.rating * 10) / 10
              : m.rating,
        }));
      }
      res.json(payload);
    } catch (proxyError) {
      console.error(`❌ Controller: Proxy error:`, proxyError.message);
      console.error(
        `❌ Controller: Proxy error details:`,
        proxyError.response?.data,
      );
      throw proxyError;
    }
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

    console.log(`Retrieving data for movie ID: ${movieId}`);

    let movieDetails = null;
    let reviews = [];
    let stats = {};

    // Recupera i dettagli del film (chiamata principale)
    try {
      const movieResponse = await proxyService.callSpringBoot(
        `/api/movies/${movieId}`,
      );
      const rawDetails = movieResponse?.data?.data ?? null;
      if (rawDetails) {
        movieDetails = transformMovieDetails(rawDetails);
      }
    } catch (movieError) {
      console.error(
        `❌ Failed to retrieve movie details: ${movieError.message}`,
      );
      // Non lanciamo l'errore, continuiamo con recensioni e statistiche
    }

    // Recupera le recensioni (chiamata opzionale)
    try {
      const reviewsResponse = await proxyService.callOtherExpress(
        `/api/reviews/movie/${movieId}`,
      );
      reviews = reviewsResponse.data?.data?.reviews || [];
      console.log(
        `✅ Retrieved ${reviews.length} reviews for movie ${movieId}`,
      );
    } catch (reviewsError) {
      console.warn(
        `⚠️ Reviews not available for movie ${movieId}: ${reviewsError.message}`,
      );
      reviews = [];
    }

    // Recupera le statistiche (chiamata opzionale)
    try {
      const statsResponse = await proxyService.callOtherExpress(
        `/api/reviews/movie/${movieId}/stats`,
      );
      stats = statsResponse.data?.data?.stats || {};
      console.log(`✅ Retrieved review stats for movie ${movieId}`);
    } catch (statsError) {
      console.warn(
        `⚠️ Stats not available for movie ${movieId}: ${statsError.message}`,
      );
      stats = {};
    }

    // Se non abbiamo nemmeno i dettagli del film, restituiamo un errore
    if (!movieDetails) {
      return res.status(404).json({
        error: "Movie not found or service unavailable",
        message: "Unable to retrieve movie details. Please try again later.",
        movieId: movieId,
      });
    }

    const movieData = {
      movieDetails: movieDetails,
      reviews: reviews,
      reviewsStat: stats,
    };

    console.log(`✅ Successfully assembled movie data for ID ${movieId}`);
    res.json(movieData);
  } catch (error) {
    console.error(`❌ Unexpected error in getMovieDetails: ${error.message}`);
    next(error);
  }
};

/**
 * @function transformMovieDetails
 * @description Adatta i campi del DTO Spring al formato richiesto dal frontend.
 * - date -> year
 * - minute -> duration
 * - posterUrl -> poster_url
 * - genres (array) -> genre (stringa principale)
 * - actors/crews (mappe) -> cast (array con name/role)
 * - releases (mappa paese -> lista) -> array { country, date, type, rating }
 * @param {Object} details - Oggetto contenente i dettagli del film
 * @returns {Object} - Oggetto con i dettagli del film trasformati
 */
function transformMovieDetails(details) {
  const cast = [];
  if (details?.actors) {
    Object.entries(details.actors).forEach(([role, names]) => {
      (names || []).forEach((name) => cast.push({ name, role }));
    });
  }
  if (details?.crews) {
    Object.entries(details.crews).forEach(([role, names]) => {
      (names || []).forEach((name) => cast.push({ name, role }));
    });
  }

  const releases = [];
  if (details?.releases) {
    Object.entries(details.releases).forEach(([country, list]) => {
      (list || []).forEach((rel) => {
        releases.push({
          country,
          date: rel?.date,
          type: rel?.type,
          rating: rel?.rating,
        });
      });
    });
  }

  return {
    id: details.id,
    name: details.name,
    tagline: details.tagline,
    description: details.description,
    rating: details.rating ? Math.round(details.rating * 100) / 100 : null,
    year: details.date,
    duration: details.minute,
    poster_url: details.poster_url,
    genre:
      Array.isArray(details.genres) && details.genres.length > 0
        ? details.genres[0]
        : undefined,
    countries: details.countries,
    cast,
    releases,
  };
}

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

    res.json(response.data.data.reviews);
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
