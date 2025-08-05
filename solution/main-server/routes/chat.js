const express = require("express");

const proxyService = require("../services/ProxyCallerService");
const ChatController = require("../controllers/ChatController");

const router = express.Router();

const chatController = new ChatController(proxyService);

/**
 * @api {get} /chat Pagina Chat
 * @apiGroup Chat
 * @apiDescription Serve la pagina principale della chat con Socket.IO.
 */
router.get("/", chatController.getChatPage.bind(chatController));

/**
 * @api {get} /chat/messages/:roomName Cronologia Chat
 * @apiGroup Chat
 * @apiDescription Recupera la cronologia dei messaggi per una stanza specifica
 * dall'OTHER_EXPRESS_SERVER tramite ProxyCallerService.
 * Endpoint reale: /api/messages/:roomName
 */
router.get(
  "/messages/:roomName",
  chatController.getChatHistory.bind(chatController),
);

/**
 * @api {post} /chat/rooms Crea Stanza Chat
 * @apiGroup Chat
 * @apiDescription Crea una nuova stanza di chat sul secondo server Express.
 */
router.post("/rooms", chatController.createRoom.bind(chatController));

/**
 * @api {get} /chat/rooms Lista Stanze
 * @apiGroup Chat
 * @apiDescription Recupera la lista delle stanze di chat disponibili
 * dall'OTHER_EXPRESS_SERVER.
 * Endpoint reale: /api/rooms/all
 */
router.get("/rooms", chatController.getRoomsList.bind(chatController));

/**
 * @api {put} /chat/rooms/:roomName Aggiorna Attività Stanza
 * @apiGroup Chat
 * @apiDescription Aggiorna l'attività di una stanza nel secondo server Express.
 * Endpoint reale: /api/rooms/:roomName (PUT)
 */
router.put("/rooms/:roomName", chatController.deleteRoom.bind(chatController));

module.exports = router;
