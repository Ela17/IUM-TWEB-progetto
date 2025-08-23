/**
 * @fileoverview Modello Mongoose per le stanze di chat
 * @description Implementa il modello Room secondo una organizzazione MVC.
 * Gestisce la persistenza delle stanze di chat su MongoDB con funzionalità
 * di tracciamento attività e pulizia automatica delle stanze inattive.
 *
 * @module roomModel
 */

const mongoose = require("mongoose");
const { VALIDATION_LIMITS } = require("../config/constants");

/**
 * @typedef {Object} RoomDocument
 * @property {string} roomName - Nome univoco della stanza (normalizzato in lowercase)
 * @property {Date} lastActivity - Timestamp dell'ultima attività nella stanza
 * @property {Date} createdAt - Data di creazione (generata automaticamente)
 * @property {Date} updatedAt - Data di ultimo aggiornamento (generata automaticamente)
 */

/**
 * Schema Mongoose per le stanze di chat.
 * Definisce la struttura dei documenti nella collection 'rooms'.
 *
 * Indici:
 * - Index unico su roomName per garantire unicità delle stanze
 * - Index su lastActivity per query efficienti sulle stanze inattive
 *
 * @type {mongoose.Schema<RoomDocument>}
 */
const roomSchema = new mongoose.Schema(
  {
    /**
     * Nome univoco della stanza
     * @type {String}
     * @required
     * @unique
     * @index
     */
    roomName: {
      type: String,
      required: [true, "Room name is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      minLength: [
        VALIDATION_LIMITS.ROOM_NAME_MIN_LENGTH,
        "Room name cannot be empty",
      ],
      maxLength: [
        VALIDATION_LIMITS.ROOM_NAME_MAX_LENGTH,
        `Room name cannot exceed ${VALIDATION_LIMITS.ROOM_NAME_MAX_LENGTH} characters`,
      ],
    },

    /**
     * Timestamp dell'ultima attività nella stanza
     * @type {Date}
     * @default Date.now
     * @index
     */
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "rooms",
  },
);

/**
 * Salva una nuova stanza nel database.
 * Se la stanza esiste già, aggiorna il timestamp di ultima attività.
 *
 * @param {Object} roomData - Dati della stanza
 * @param {string} roomData.roomName - Nome della stanza
 * @returns {Promise<RoomDocument>} La stanza salvata o aggiornata
 * @throws {Error} Se il salvataggio fallisce
 */
roomSchema.statics.saveRoom = async function (roomData) {
  try {
    const roomName = roomData.roomName.toLowerCase();

    const room = await this.findOneAndUpdate(
      { roomName },
      { $set: { roomName, lastActivity: Date.now() } },
      { upsert: true, new: true, runValidators: true },
    );

    console.log(`✅ Stanza salvata: ${roomName}`);
    return room;
  } catch (error) {
    throw error;
  }
};

/**
 * Aggiorna il timestamp di ultima attività di una stanza.
 * Utilizzato per tenere traccia delle stanze attive.
 *
 * @param {string} roomName - Nome della stanza
 * @returns {Promise<RoomDocument|null>} La stanza aggiornata o null se non trovata
 * @throws {Error} Se l'aggiornamento fallisce
 */
roomSchema.statics.updateActivity = async function (roomName) {
  try {
    const room = await this.findOneAndUpdate(
      { roomName: roomName.toLowerCase() },
      { $set: { lastActivity: Date.now() } },
      { new: true },
    );

    if (!room) {
      console.warn(`⚠️ Stanza non trovata: ${roomName}`);
    }

    return room;
  } catch (error) {
    throw error;
  }
};

/**
 * Trova i nomi delle stanze inattive da più di un periodo specificato.
 * Utilizzato per la pulizia automatica delle stanze inattive.
 *
 * @param {number} inactivityPeriodMs - Periodo di inattività in millisecondi
 * @returns {Promise<Array<string>>} Array di nomi delle stanze inattive
 * @throws {Error} Se la ricerca fallisce
 */
roomSchema.statics.findInactiveRoomNames = async function (inactivityPeriodMs) {
  try {
    const cutoffDate = new Date(Date.now() - inactivityPeriodMs);

    const inactiveRooms = await this.find(
      { lastActivity: { $lt: cutoffDate } },
      { roomName: 1, _id: 0 },
    ).lean();

    return inactiveRooms.map((room) => room.roomName);
  } catch (error) {
    throw error;
  }
};

/**
 * Elimina una stanza dal database.
 * Utilizzato durante la pulizia delle stanze inattive.
 *
 * @param {string} roomName - Nome della stanza da eliminare
 * @returns {Promise<{deletedCount: number}>} Risultato dell'operazione di eliminazione
 * @throws {Error} Se l'eliminazione fallisce
 */
roomSchema.statics.deleteRoom = async function (roomName) {
  try {
    const result = await this.deleteOne({
      roomName: roomName.toLowerCase(),
    });

    if (result.deletedCount === 0) {
      console.warn(`⚠️ Stanza non trovata: ${roomName}`);
    } else {
      console.log(`🗑️ Stanza eliminata: ${roomName}`);
    }

    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Recupera tutte le stanze disponibili nel sistema.
 *
 * @param {number} limit - Numero massimo di stanze da recuperare (default: 50)
 * @returns {Promise<Array<RoomDocument>>} Array di stanze
 * @throws {Error} Se il recupero fallisce
 */
roomSchema.statics.getAllRooms = async function (limit = 50) {
  try {
    const rooms = await this.find({})
      .sort({ lastActivity: -1 })
      .limit(limit)
      .lean();

    return rooms;
  } catch (error) {
    throw error;
  }
};

// Creazione del modello

/**
 * Modello Mongoose per le stanze di live chatting.
 * Una volta creato il modello, si può usare per find, create, update, delete
 *
 * @type {mongoose.Model<RoomDocument>}
 */
const roomModel = mongoose.model("Room", roomSchema);

module.exports = roomModel;
