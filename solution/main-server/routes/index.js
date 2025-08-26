const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Homepage
 *     description: Serve la pagina principale di CinemaHub
 *     tags: [Pages]
 *     responses:
 *       200:
 *         description: Homepage servita con successo
 */
router.get("/", function (req, res, next) {
  res.render("pages/index", {
    title: "CinemaHub - Your Cinema Data Hub",
    currentPage: "home",
    isHomepage: true,
  });
});

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Catalogo film
 *     description: Serve la pagina del catalogo film con collezioni curate e filtri popolari
 *     tags: [Pages]
 *     responses:
 *       200:
 *         description: Pagina catalogo servita con successo
 */
router.get("/movies", function (req, res, next) {
  res.render("pages/movies", {
    title: "Movies Catalogue - CinemaHub",
    description: "Discover amazing movies from our curated collections",
    currentPage: "movies",
    isMoviesPage: true,
  });
});

/**
 * @swagger
 * /movies/{movieId}:
 *   get:
 *     summary: Pagina dettagli singolo film
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pagina dettagli film servita con successo
 */
router.get("/movies/:movieId", function (req, res, next) {
  res.render("pages/movie-details", {
    title: "Movie Details - CinemaHub",
    currentPage: "movies",
    isMovieDetailsPage: true,
  });
});

module.exports = router;
