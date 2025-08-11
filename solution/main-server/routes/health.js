const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check del server
 *     description: Endpoint per verificare lo stato di salute del Main Server. Fornisce informazioni essenziali per il monitoring, inclusi stato operativo, timestamp corrente, uptime del processo e ambiente di esecuzione.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Il server è operativo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: server is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 enviroment:
 *                   type: string
 *                   example: development
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    enviroment: process.env.NODE_ENV,
  });
});

module.exports = router;
