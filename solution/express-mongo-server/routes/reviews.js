/**
 * @fileoverview Rotte API per le recensioni di film da Rotten Tomatoes.
 * @description Routes per la gestione delle recensioni.
 */

const express = require("express");
const {
  validateMovieId,
} = require("../middlewares/validation/movieIdValidation");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

/**
 * @swagger
 * /reviews/movie/{movieId}:
 *   get:
 *     tags: ['Reviews']
 *     summary: Recupera tutte le recensioni per un film specifico
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: review_date
 *     responses:
 *       '200':
 *         description: Lista recensioni
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *       '400':
 *         description: Parametri non validi
 */
router.get(
  "/reviews/movie/:movieId",
  validateMovieId,
  reviewController.getReviewsByMovieId,
);

/**
 * @swagger
 * /reviews/movie/{movieId}/stats:
 *   get:
 *     tags: ['Reviews']
 *     summary: Statistiche recensioni film
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Statistiche calcolate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   $ref: '#/components/schemas/ReviewStats'
 *       '400':
 *         description: Parametri non validi
 */
router.get(
  "/reviews/movie/:movieId/stats",
  validateMovieId,
  reviewController.getMovieReviewStats,
);

/**
 * @swagger
 * /reviews/stats/global:
 *   get:
 *     tags: ['Reviews']
 *     summary: Conteggio totale recensioni
 *     responses:
 *       '200':
 *         description: Conteggio totale delle recensioni
 */
router.get("/reviews/stats/global", reviewController.getGlobalReviewCount);

module.exports = router;
