/**
 * @fileoverview Routes per la gestione delle operazioni di chat
 * @module chat
 * @description Definisce le routes per messaggi e stanze di chat.
 * Mappatura degli URL alle funzioni del controller con validazione middleware.
 */

const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");

const {
  validateSaveMessage,
  validateGetLatestMessages,
  validateGetMessagesBefore,
} = require("../middlewares/validation/messageValidation");

const {
  validateSaveRoom,
  validateUpdateActivity,
} = require("../middlewares/validation/roomValidation");

// ROUTES PER I MESSAGGI

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Salva un nuovo messaggio
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uniqueTimestamp
 *               - roomName
 *               - userName
 *               - message
 *             properties:
 *               uniqueTimestamp:
 *                 type: integer
 *                 description: Timestamp univoco del messaggio
 *               roomName:
 *                 type: string
 *                 description: Nome della stanza
 *               userName:
 *                 type: string
 *                 description: Nome utente
 *               message:
 *                 type: string
 *                 maxLength: 500
 *                 description: Contenuto del messaggio
 *     responses:
 *       201:
 *         description: Messaggio salvato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messageId:
 *                   type: integer
 *       400:
 *         description: Dati non validi
 */
router.post("/messages", validateSaveMessage, chatController.saveMessage);

/**
 * @swagger
 * /api/messages/{roomName}:
 *   get:
 *     summary: Recupera gli ultimi messaggi di una stanza
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: roomName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome della stanza
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numero di pagina
 *     responses:
 *       200:
 *         description: Lista messaggi recuperata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       uniqueTimestamp:
 *                         type: integer
 *                       userName:
 *                         type: string
 *                       message:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     beforeUniqueTimestamp:
 *                       type: integer
 */
router.get(
  "/messages/:roomName",
  validateGetLatestMessages,
  chatController.getLatestMessages,
);

/**
 * @swagger
 * /api/messages/{roomName}/before/{timestamp}:
 *   get:
 *     summary: Recupera messaggi precedenti (infinite scroll)
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: roomName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome della stanza
 *       - in: path
 *         name: timestamp
 *         required: true
 *         schema:
 *           type: integer
 *         description: Timestamp limite (esclusivo)
 *     responses:
 *       200:
 *         description: Messaggi precedenti recuperati
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get(
  "/messages/:roomName/before/:timestamp",
  validateGetMessagesBefore,
  chatController.getMessagesBefore,
);

// ROUTES PER LE STANZE

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Crea o aggiorna una stanza
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomName
 *             properties:
 *               roomName:
 *                 type: string
 *                 pattern: ^[a-zA-Z0-9_-]+$
 *                 description: Nome della stanza (solo lettere, numeri, _, -)
 *     responses:
 *       201:
 *         description: Stanza creata/aggiornata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 room:
 *                   type: string
 *       400:
 *         description: Nome stanza non valido
 */
router.post("/rooms", validateSaveRoom, chatController.saveRoom);

/**
 * @swagger
 * /api/rooms/all:
 *   get:
 *     summary: Recupera tutte le stanze disponibili
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Lista stanze recuperata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 rooms:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       roomName:
 *                         type: string
 *                       lastActivity:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get("/rooms/all", chatController.getAllRooms);

/**
 * @swagger
 * /api/rooms/{roomName}:
 *   put:
 *     summary: Aggiorna attività di una stanza
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome della stanza
 *     responses:
 *       200:
 *         description: Attività aggiornata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Stanza non trovata
 */
router.put(
  "/rooms/:roomName",
  validateUpdateActivity,
  chatController.updateActivity,
);

/**
 * @swagger
 * tags:
 *   - name: Messages
 *     description: Gestione messaggi di chat
 *   - name: Rooms
 *     description: Gestione stanze di chat
 */
module.exports = router;
