/**
 * @fileoverview per le recensioni di film da Rotten Tomatoes.
 * @description Controller per la gestione delle operazioni relative alle recensioni.
 *
 * Gestisce le richieste HTTP per le recensioni incapsulando:
 * - Validazione dei parametri in arrivo
 * - Chiamata al model
 * - Gestione degli errori
 * - Traduzione in risposte HTTP
 * - Formattazione della risposta finale
 */

const { reviewModel } = require("../models/reviewModel");
const { ENUMS, VALIDATION_LIMITS } = require("../config/constants");

/**
 * Recupera recensioni per un film specifico con paginazione e ordinamento.
 * ENDPOINT: GET /api/reviews/movie/:movieId
 *
 * @param {Object} req - L'oggetto Request contenente movieId nei params e opzioni di paginazione nella query
 * @param {Object} res - L'oggetto Response per inviare la risposta al client
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo
 * @throws {Error} Lancia un errore se il recupero delle recensioni fallisce
 */
exports.getReviewsByMovieId = async function (req, res, next) {
  try {
    const movieId = parseInt(req.params.movieId);

    // validazione parametri paginazione
    const parsedPage = parseInt(req.query.page);
    const page = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    const sortBy = ENUMS.SORT_FIELDS.includes(req.query.sortBy)
      ? req.query.sortBy
      : "review_date";

    const orderBy = req.query.orderBy === "asc" ? 1 : -1;

    // chiamata al model
    const pagination = {
      page: page,
      limit: VALIDATION_LIMITS.DEFAULT_PAGE_SIZE,
      sortBy: sortBy,
      sortOrder: orderBy,
    };

    const reviewsById = await reviewModel.getReviewsByMovieId(
      movieId,
      pagination,
    );

    if (reviewsById.reviews.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No reviews available`,
        movieId: movieId,
        reviews: [],
        count: 0,
      });
    }

    return res.status(200).json({
      success: true,
      reviews: reviewsById.reviews,
      pagination: {
        currentPage: pagination.page,
        totalPages: Math.ceil(reviewsById.totalCount / pagination.limit),
        totalResults: reviewsById.totalCount,
        hasNext: pagination.page * pagination.limit < reviewsById.totalCount,
        hasPrev: pagination.page > 1,
      },
      count: reviewsById.reviews.length,
      message: `${reviewsById.reviews.length} reviews found`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gestisce richieste per statistiche delle recensioni di un film specifico.
 * ENDPOINT: GET /api/reviews/movie/:movieId/stats
 *
 * @param {Object} req - L'oggetto Request contenente movieId nei params
 * @param {Object} res - L'oggetto Response per inviare la risposta al client
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo
 * @throws {Error} Lancia un errore se il recupero delle statistiche fallisce
 */
exports.getMovieReviewStats = async function (req, res, next) {
  try {
    const movieId = parseInt(req.params.movieId);

    // chiamata al model
    const stats = await reviewModel.getMovieReviewStats(movieId);

    if (stats === null) {
      return res.status(200).json({
        success: true,
        movieId: movieId,
        hasReviews: false,
        message: "No reviews available",
        stats: {
          totalReviews: 0,
          averageScore: null,
          maxScore: null,
          minScore: null,
          positiveReviews: 0,
          negativeReviews: 0,
          positivePercentage: null,
          negativePercentage: null,
          publisherCount: 0,
          reviewTypeDistribution: {},
        },
      });
    }

    res.status(200).json({
      success: true,
      movieId: movieId,
      hasReviews: true,
      message: `statistics calculated from ${stats.totalReviews} reviews`,
      stats: stats,
    });
  } catch (error) {
    next(error);
  }
};
