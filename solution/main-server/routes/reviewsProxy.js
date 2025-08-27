const express = require("express");
const router = express.Router();

const proxyService = require("../services/proxyService");

/**
 * @swagger
 * /api/reviews/stats/global:
 *   get:
 *     tags: [Reviews]
 *     summary: Conteggio totale recensioni (proxy)
 *     description: Proxy verso Other Express Server per recuperare il conteggio totale delle recensioni.
 *     responses:
 *       200:
 *         description: Conteggio recuperato correttamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalReviews:
 *                       type: integer
 *                 error:
 *                   type: string
 */
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

/**
 * @swagger
 * /api/stats/global:
 *   get:
 *     tags: [Movies]
 *     summary: Statistiche globali (proxy)
 *     description: Proxy verso Spring Boot per conteggi globali (tot film e tot oscar).
 *     responses:
 *       200:
 *         description: Statistiche recuperate correttamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalMovies:
 *                       type: integer
 *                     totalOscars:
 *                       type: integer
 *                 error:
 *                   type: string
 */
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


