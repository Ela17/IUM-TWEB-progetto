const express = require("express");

const chatController = require("../controllers/chatController");

const router = express.Router();

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Pagina Chat
 *     description: Serve la pagina principale della chat con Socket.IO.
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Pagina della chat servita correttamente.
 */
router.get("/", chatController.getChatPage);

/**
 * @swagger
 * /chat/messages/{roomName}:
 *   get:
 *     summary: Cronologia Chat
 *     description: Recupera la cronologia dei messaggi per una stanza specifica.
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: roomName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome della stanza di chat.
 *     responses:
 *       200:
 *         description: Cronologia dei messaggi recuperata con successo.
 *       404:
 *         description: Stanza non trovata.
 */
router.get(
  "/messages/:roomName",
  chatController.getChatHistory,
);

/**
 * @swagger
 * /chat/rooms:
 *   post:
 *     summary: Crea Stanza Chat
 *     description: Crea una nuova stanza di chat.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomName:
 *                 type: string
 *             description: Nome della nuova stanza.
 *     responses:
 *       201:
 *         description: Stanza creata con successo.
 *       400:
 *         description: Richiesta non valida.
 */
router.post("/rooms", chatController.createRoom);

/**
 * @swagger
 * /chat/rooms:
 *   get:
 *     summary: Lista Stanze
 *     description: Recupera la lista delle stanze di chat disponibili.
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Lista delle stanze recuperata con successo.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 */
router.get("/rooms", chatController.getRoomsList);

/**
 * @swagger
 * /chat/rooms/{roomName}:
 *   put:
 *     summary: Aggiorna Attività Stanza (o elimina)
 *     description: Aggiorna l'attività di una stanza. L'API originale sembra usare PUT per una funzione che ha a che fare con la cancellazione. Questo riflette l'uso nel file originale.
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: roomName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome della stanza da aggiornare.
 *     responses:
 *       200:
 *         description: Attività della stanza aggiornata con successo.
 *       404:
 *         description: Stanza non trovata.
 */
router.put("/rooms/:roomName", chatController.deleteRoom);

module.exports = router;
