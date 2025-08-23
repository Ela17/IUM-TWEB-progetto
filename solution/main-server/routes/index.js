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
    isHomepage: true
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
    isMoviesPage: true
  });
});

/**
 * @swagger
 * /movie-details:
 *   get:
 *     summary: Dettagli singolo film
 *     tags: [Pages]
 *     responses:
 *       200
 */
router.get("/movies", function (req, res, next) {
  res.render("pages/movies", { 
    title: "Movie Details - CinemaHub",
    currentPage: "movies",
    isMovieDetailsPage: true
  });
});

module.exports = router;