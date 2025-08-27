/**
 * @fileoverview Modello Mongoose per i messaggi della chat
 * @description Implementa il modello Message secondo una organizzazione MVC.
 * Gestisce la persistenza dei messaggi di chat su MongoDB con funzionalità
 * di paginazione e recupero storico.
 *
 * @module messageModel
 */

const mongoose = require("mongoose");
const { VALIDATION_LIMITS } = require("../config/constants");

/**
 * @typedef {Object} MessageDocument
 * @property {number} uniqueTimestamp - Timestamp univoco del messaggio (millisecondi, indicizzato)
 * @property {string} roomName - Nome della stanza (normalizzato in lowercase, indicizzato)
 * @property {string} userName - Nome dell'utente che ha inviato il messaggio
 * @property {string} message - Contenuto del messaggio (max 500 caratteri)
 * @property {Date} createdAt - Data di creazione (generata automaticamente)
 * @property {Date} updatedAt - Data di ultimo aggiornamento (generata automaticamente)
 */

/**
 * Schema Mongoose per i messaggi.
 * Definisce la struttura dei documenti nella collection 'messages'.
 *
 * Indici:
 * - Compound index su roomName + uniqueTimestamp per query efficienti di paginazione
 * - Index singolo su uniqueTimestamp per ordinamento temporale
 *
 * @type {mongoose.Schema<MessageDocument>}
 */
const messageSchema = new mongoose.Schema(
  {
    /**
     * Timestamp univoco del messaggio
     * @type {Number}
     * @required
     * @unique
     * @index
     */
    uniqueTimestamp: {
      type: Number,
      required: [true, "Timestamp is required"],
      unique: true,
      index: true,
    },

    /**
     * Nome della stanza di chat
     * @type {String}
     * @required
     * @index
     */
    roomName: {
      type: String,
      required: [true, "Room name is required"],
      lowercase: true,
      trim: true,
      index: true,
    },

    /**
     * Nome dell'utente mittente
     * @type {String}
     * @required
     */
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      maxlength: [
        VALIDATION_LIMITS.NICKNAME_MAX_LENGTH,
        `userName cannot exceed ${VALIDATION_LIMITS.NICKNAME_MAX_LENGTH} characters`,
      ],
    },

    /**
     * Contenuto del messaggio
     * @type {String}
     * @required
     * @maxLength 500
     */
    message: {
      type: String,
      required: [true, "Message content is required"],
      maxLength: [
        VALIDATION_LIMITS.MESSAGE_MAX_LENGTH,
        `Message cannot exceed ${VALIDATION_LIMITS.MESSAGE_MAX_LENGTH} characters`,
      ],
    },
  },
  {
    timestamps: true,
    collection: "messages",
  },
);

/**
 * Indice composto per query efficienti di paginazione per stanza
 * Ottimizzato per query del tipo: trova messaggi di una stanza prima di un certo timestamp
 */
messageSchema.index({ roomName: 1, uniqueTimestamp: -1 });

/**
 * Recupera gli ultimi messaggi di una stanza con paginazione.
 *
 * @param {string} roomName - Nome della stanza
 * @param {number} page - Numero di pagina (1-based)
 * @param {number} limit - Numero massimo di messaggi per pagina (default: 100)
 * @returns {Promise<{messages: Array<MessageDocument>, pagination: Object}>}
 *          Oggetto contenente array di messaggi e informazioni di paginazione
 * @throws {Error} Se il recupero dei messaggi fallisce
 *
 * @example
 * const result = await messageModel.getLatestMessages('general', 1, 50);
 * console.log(result.messages); // Array di messaggi
 * console.log(result.pagination); // { page: 1, beforeUniqueTimestamp: 1234567890 }
 */
messageSchema.statics.getLatestMessages = async function (
  roomName,
  page = 1,
  limit = 100,
) {
  try {
    const skip = (page - 1) * limit;

    const messages = await this.find({ roomName: roomName.toLowerCase() })
      .sort({ uniqueTimestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const beforeUniqueTimestamp =
      messages.length > 0
        ? messages[messages.length - 1].uniqueTimestamp
        : null;

    return {
      messages,
      pagination: {
        page: page,
        beforeUniqueTimestamp: beforeUniqueTimestamp,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get latest messages: ${error.message}`);
  }
};

/**
 * Recupera messaggi precedenti a un determinato timestamp (per paginazione infinita).
 *
 * @param {string} roomName - Nome della stanza
 * @param {number} beforeUniqueTimestamp - Timestamp limite (esclusivo)
 * @param {number} limit - Numero massimo di messaggi da recuperare (default: 100)
 * @returns {Promise<Array<MessageDocument>>} Array di messaggi più vecchi del timestamp
 * @throws {Error} Se il recupero dei messaggi fallisce
 */
messageSchema.statics.getMessagesBefore = async function (
  roomName,
  beforeUniqueTimestamp,
  limit = 100,
) {
  try {
    const result = await this.find({
      roomName: roomName.toLowerCase(),
      uniqueTimestamp: { $lt: beforeUniqueTimestamp },
    })
      .sort({ uniqueTimestamp: -1 })
      .limit(limit)
      .lean();

    return result;
  } catch (error) {
    throw new Error(
      `Failed to get messages before timestamp: ${error.message}`,
    );
  }
};

/**
 * Salva un nuovo messaggio nel database.
 *
 * @param {Object} messageData - Dati del messaggio
 * @param {number} messageData.uniqueTimestamp - Timestamp univoco
 * @param {string} messageData.roomName - Nome della stanza
 * @param {string} messageData.userName - Nome utente
 * @param {string} messageData.message - Contenuto del messaggio
 * @returns {Promise<MessageDocument>} Il messaggio salvato
 * @throws {Error} Se il salvataggio fallisce
 *
 * @example
 * await messageModel.saveMessage({
 *   uniqueTimestamp: Date.now(),
 *   roomName: 'general',
 *   userName: 'pippobaudo123',
 *   message: 'Hello world!'
 * });
 */
messageSchema.statics.saveMessage = async function (messageData) {
  try {
    const message = new this({
      uniqueTimestamp: messageData.uniqueTimestamp,
      roomName: messageData.roomName.toLowerCase(),
      userName: messageData.userName,
      message: messageData.message,
    });

    await message.save();
    return message;
  } catch (error) {
    throw new Error(`Failed to save message: ${error.message}`);
  }
};

/**
 * Elimina tutti i messaggi di una stanza.
 * Utilizzato per la pulizia delle stanze inattive.
 *
 * @param {string} roomName - Nome della stanza
 * @returns {Promise<{deletedCount: number}>} Risultato dell'operazione di eliminazione
 * @throws {Error} Se l'eliminazione fallisce
 *
 * @example
 * const result = await messageModel.deleteMessages('old-room');
 * console.log(`Deleted ${result.deletedCount} messages`);
 */
messageSchema.statics.deleteMessages = async function (roomName) {
  try {
    const result = await this.deleteMany({
      roomName: roomName.toLowerCase(),
    });

    if (result.deletedCount === 0) {
      console.warn(`⚠️ No messages found in room: ${roomName}`);
    } else {
      console.log(
        `✅ Deleted ${result.deletedCount} messages from room: ${roomName}`,
      );
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to delete messages: ${error.message}`);
  }
};

 

/**
 * Modello Mongoose per i messaggi di live chatting.
 * Una volta creato il modello, si può usare per find, create, update, delete
 *
 * @type {mongoose.Model<MessageDocument>}
 */
const messageModel = mongoose.model("Message", messageSchema);

module.exports = messageModel;
