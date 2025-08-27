const express = require("express");
const router = express.Router();

const proxyService = require("../services/proxyService");

// Proxy: conteggio globale delle recensioni
router.get("/reviews/stats/global", async (req, res, next) => {
  try {
    const response = await proxyService.callOtherExpress(
      "/api/reviews/stats/global",
    );
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

// Proxy: stats globali movies/oscars da Spring Boot
router.get("/stats/global", async (req, res, next) => {
  try {
    const response = await proxyService.callSpringBoot(
      "/api/movies/stats/global",
    );
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


