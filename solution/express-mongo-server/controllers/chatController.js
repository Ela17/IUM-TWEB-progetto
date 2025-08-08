/**
 * @fileoverview Controller per la gestione delle operazioni di chat
 * @module chatController
 * Logica di business per il salvataggio e recupero dei messaggi,
 * la gestione delle stanze e delle loro attività.
 */

const messageModel = require("../models/messageModel");
const roomModel = require("../models/roomModel");

/**
 * @method saveMessage
 * @description Salva un nuovo messaggio nel database MongoDB.
 * ASSUME: I dati sono già stati validati e formattati dal server Express centrale.
 * @param {Object} req - L'oggetto Request contenente messageData nel body
 * @param {Object} res - L'oggetto Response per inviare la risposta al client
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo
 * @throws {Error} Lancia un errore se il salvataggio del messaggio fallisce
 */
exports.saveMessage = async function (req, res, next) {
  try {
    await messageModel.saveMessage(req.body);

    return res.status(201).json({
      success: true,
      messageId: req.body.uniqueTimestamp,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @method getLatestMessages
 * @description Recupera gli ultimi messaggi di una stanza specifica con paginazione.
 * ASSUME: roomName valido dai parametri URL.
 * @param {Object} req - L'oggetto Request contenente roomName nei params e page nella query
 * @param {Object} res - L'oggetto Response per inviare la risposta al client
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo
 * @throws {Error} Lancia un errore se il recupero dei messaggi fallisce
 */
exports.getLatestMessages = async function (req, res, next) {
  try {
    const roomName = req.params.roomName;
    const parsedPage = parseInt(req.query.page);
    const page = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    const result = await messageModel.getLatestMessages(roomName, page);

    res.status(200).json({
      success: true,
      messages: result.messages,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @method getMessagesBefore
 * @description Recupera messaggi precedenti per implementare la paginazione infinita.
 * ASSUME: roomName e timestamp validi dai parametri URL.
 * @param {Object} req - L'oggetto Request contenente roomName e timestamp nei params
 * @param {Object} res - L'oggetto Response per inviare la risposta al client
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo
 * @throws {Error} Lancia un errore se il recupero dei messaggi precedenti fallisce
 */
exports.getMessagesBefore = async function (req, res, next) {
  try {
    const roomName = req.params.roomName;
    const beforeUniqueTimestamp = parseInt(req.params.timestamp);

    const messages = await messageModel.getMessagesBefore(
      roomName,
      beforeUniqueTimestamp,
    );

    res.status(200).json({
      success: true,
      messages: messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @method saveRoom
 * @description Salva una nuova stanza nel database MongoDB.
 * ASSUME: I dati della stanza sono già stati validati dai middleware.
 * @param {Object} req - L'oggetto Request contenente i dati della stanza nel body
 * @param {Object} res - L'oggetto Response per inviare la risposta al client
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo
 * @throws {Error} Lancia un errore se il salvataggio della stanza fallisce
 */
exports.saveRoom = async function (req, res, next) {
  try {
    await roomModel.saveRoom(req.body);

    res.status(201).json({
      success: true,
      room: req.body.roomName,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @method getAllRooms
 * @description Recupera tutte le stanze disponibili nel sistema.
 * @param {Object} req - L'oggetto Request
 * @param {Object} res - L'oggetto Response per inviare la risposta al client
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo
 * @throws {Error} Lancia un errore se il recupero delle stanze fallisce
 */
exports.getAllRooms = async function (req, res, next) {
  try {
    const rooms = await roomModel.getAllRooms();

    res.status(200).json({
      success: true,
      rooms: rooms,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @method updateActivity
 * @description Aggiorna il timestamp di ultima attività di una stanza.
 * Utilizzato per tenere traccia delle stanze attive nel sistema.
 * @param {Object} req - L'oggetto Request contenente roomName nei params
 * @param {Object} res - L'oggetto Response per inviare la risposta al client
 * @param {Function} next - La funzione `next` per passare gli errori al middleware successivo
 * @throws {Error} Lancia un errore se l'aggiornamento dell'attività fallisce
 */
exports.updateActivity = async function (req, res, next) {
  try {
    const activeRoom = req.params.roomName;
    const response = await roomModel.updateActivity(activeRoom);

    if (!response) {
      const error = new Error("Room not found");
      error.status = 404;
      return next(error);
    }

    return res.status(200).json({
      success: true,
      message: "Room activity updated",
    });
  } catch (error) {
    next(error);
  }
};
