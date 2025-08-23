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
    currentPage: "home"
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
    title: "Movie Catalog - CinemaHub",
    description: "Discover amazing movies from our curated collections",
    currentPage: "movies"
  });
});

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Pagina chat
 *     description: Serve la pagina principale della chat con Socket.IO
 *     tags: [Pages]
 *     responses:
 *       200:
 *         description: Pagina chat servita con successo
 */
router.get("/chat", function (req, res, next) {
  res.render("pages/chat", { 
    title: "Cinema Chat - CinemaHub",
    description: "Real-time chat for movie discussions",
    currentPage: "chat"
  });
});

module.exports = router;