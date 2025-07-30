const express = require('express')
const router = express.Router()

/**
 * @api {get} /health Health Check
 * @apiGroup Health
 * @apiName GetServerHealth
 * @apiVersion 1.0.0
 * @apiDescription Endpoint per verificare lo stato di salute del Main Server.
 * Fornisce informazioni essenziali per il monitoring, inclusi stato operativo,
 * timestamp corrente, uptime del processo e ambiente di esecuzione.
 * Utilizzato per determinare se il server è pronto ad accettare richieste.
 * 
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        enviroment: process.env.NODE_ENV
    });
});

module.exports = router;