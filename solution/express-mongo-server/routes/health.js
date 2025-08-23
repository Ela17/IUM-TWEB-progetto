/**
 * @fileoverview Route di sistema per il controllo dello stato del server.
 * @description Routes per health check e monitoraggio del sistema.
 */

const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: ['System']
 *     summary: Controlla lo stato del server
 *     responses:
 *       '200':
 *         description: Server funzionante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *       '500':
 *         description: Errore interno del server
 */
router.get("/health", (req, res, next) => {
  try {
    res.status(200).json({
      status: "ok",
      message: "server is running",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
