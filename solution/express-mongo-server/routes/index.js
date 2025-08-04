const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Home route
router.get('/', (req, res) => {
  res.json({
    message: 'API Server is running',
    version: '1.0.0'
  });
});

module.exports = router;