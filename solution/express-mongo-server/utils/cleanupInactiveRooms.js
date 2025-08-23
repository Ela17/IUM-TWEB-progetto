/**
 * @fileoverview Service per la pulizia automatica delle stanze inattive
 * @description Gestisce la rimozione periodica delle stanze di chat che non hanno attività
 * da un periodo specificato, insieme ai relativi messaggi
 */

const roomModel = require("../models/roomModel");
const messageModel = require("../models/messageModel");
const { CLEANUP_CONFIG } = require("../config/constants");

/**
 * Intervallo di tempo per la pulizia automatica (in millisecondi)
 * @private
 * @constant {number}
 */
const CLEANUP_INTERVAL_MS = CLEANUP_CONFIG.CLEANUP_INTERVAL_MS;

/**
 * ID dell'intervallo attivo per la pulizia
 * @private
 * @type {NodeJS.Timeout|null}
 */
let cleanupIntervalId = null;

/**
 * Elimina i messaggi associati a una stanza specifica
 * @private
 * @async
 * @param {string} roomName - Nome della stanza di cui eliminare i messaggi
 * @returns {Promise<void>}
 * @throws {Error} Se l'eliminazione dei messaggi fallisce
 */
async function deleteRoomMessages(roomName) {
  try {
    const messageResult = await messageModel.deleteMessages(roomName);
    console.log(
      `🗑️ Deleted ${messageResult.deletedCount || 0} messages for room: ${roomName}`,
    );
  } catch (error) {
    console.error(`❌ Error deleting messages for ${roomName}:`, error.message);
    throw error;
  }
}

/**
 * Elimina una stanza dal database
 * @private
 * @async
 * @param {string} roomName - Nome della stanza da eliminare
 * @returns {Promise<void>}
 * @throws {Error} Se l'eliminazione della stanza fallisce
 */
async function deleteRoom(roomName) {
  try {
    const roomResult = await roomModel.deleteRoom(roomName);
    if (roomResult.deletedCount > 0) {
      console.log(`🏠 Room deleted: ${roomName}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting room ${roomName}:`, error.message);
    throw error;
  }
}

/**
 * Esegue la pulizia delle stanze inattive e dei loro messaggi associati
 * @async
 * @function cleanInactiveRooms
 * @description Trova tutte le stanze che non hanno attività da più del periodo specificato
 * e le elimina insieme ai relativi messaggi
 * @returns {Promise<Object>} Risultato dell'operazione di pulizia
 * @throws {Error} Se il processo di pulizia fallisce
 */
async function cleanInactiveRooms() {
  console.log("🧹 Starting inactive room cleanup cycle...");

  try {
    // Trova le stanze inattive
    const inactiveRoomNames =
      await roomModel.findInactiveRoomNames(CLEANUP_INTERVAL_MS);

    if (inactiveRoomNames.length === 0) {
      console.log("✅ No inactive rooms to delete");
      return {
        success: true,
        deletedRooms: 0,
        message: "No inactive rooms found",
      };
    }

    console.log(
      `📋 Inactive rooms to be deleted (${inactiveRoomNames.length}): ${inactiveRoomNames.join(", ")}`,
    );

    let deletedRooms = 0;
    let errors = [];

    // Elimina ogni stanza e i suoi messaggi
    for (const roomName of inactiveRoomNames) {
      try {
        // Elimina prima i messaggi, poi la stanza
        await deleteRoomMessages(roomName);
        await deleteRoom(roomName);

        deletedRooms++;
        console.log(`✅ Cleanup completed for: ${roomName}`);
      } catch (error) {
        const errorMessage = `Error cleaning up ${roomName}: ${error.message}`;
        console.error(`❌ ${errorMessage}`);
        errors.push(errorMessage);
      }
    }

    const result = {
      success: errors.length === 0,
      deletedRooms,
      totalFound: inactiveRoomNames.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Cleanup completed: ${deletedRooms}/${inactiveRoomNames.length} rooms deleted`,
    };

    console.log(`🏁 Cleanup cycle finished: ${result.message}`);
    return result;
  } catch (error) {
    const errorMessage = `Critical error in inactive room cleanup cycle: ${error.message}`;
    console.error(`💥 ${errorMessage}`);
    throw new Error(errorMessage);
  }
}

/**
 * Avvia l'intervallo automatico per la pulizia delle stanze inattive
 * @function startCleanupInterval
 * @description Configura un timer che esegue periodicamente la pulizia delle stanze inattive.
 * Il primo ciclo viene eseguito immediatamente, poi ripetuto secondo l'intervallo configurato.
 * @returns {NodeJS.Timeout} ID dell'intervallo per future operazioni di stop
 */
function startCleanupInterval() {
  // Ferma un eventuale intervallo precedente
  if (cleanupIntervalId) {
    stopCleanupInterval();
  }

  console.log(
    `⏰ Starting automatic inactive room cleanup every ${CLEANUP_INTERVAL_MS / (1000 * 60 * 60)} hours`,
  );

  // Esegui immediatamente la prima pulizia
  cleanInactiveRooms().catch((error) => {
    console.error("❌ Error in initial cleanup:", error.message);
  });

  // Configura l'intervallo periodico
  cleanupIntervalId = setInterval(() => {
    cleanInactiveRooms().catch((error) => {
      console.error("❌ Error in periodic cleanup:", error.message);
    });
  }, CLEANUP_INTERVAL_MS);

  console.log("✅ Automatic cleanup interval configured");
  return cleanupIntervalId;
}

/**
 * Ferma l'intervallo automatico di pulizia delle stanze inattive
 * @function stopCleanupInterval
 * @description Cancella il timer per la pulizia automatica se attivo
 * @returns {boolean} True se l'intervallo è stato fermato, false se non era attivo
 */
function stopCleanupInterval() {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
    console.log("⏹️ Automatic cleanup interval stopped");
    return true;
  }
  return false;
}

/**
 * Verifica se l'intervallo di pulizia automatica è attivo
 * @function isCleanupActive
 * @description Controlla se il timer per la pulizia automatica è attualmente in esecuzione
 * @returns {boolean} True se la pulizia automatica è attiva, false altrimenti
 */
function isCleanupActive() {
  return cleanupIntervalId !== null;
}

/**
 * Ottiene informazioni sullo stato del servizio di pulizia
 * @function getCleanupStatus
 * @description Restituisce informazioni dettagliate sulla configurazione e stato del servizio
 * @returns {Object} Oggetto contenente informazioni di stato
 */
function getCleanupStatus() {
  return {
    isActive: isCleanupActive(),
    intervalMs: CLEANUP_INTERVAL_MS,
    intervalHours: CLEANUP_INTERVAL_MS / (1000 * 60 * 60),
    intervalDays: CLEANUP_INTERVAL_MS / (1000 * 60 * 60 * 24),
    nextCleanupEstimate: cleanupIntervalId
      ? new Date(Date.now() + CLEANUP_INTERVAL_MS).toISOString()
      : null,
  };
}

module.exports = {
  cleanInactiveRooms,
  startCleanupInterval,
  stopCleanupInterval,
  isCleanupActive,
  getCleanupStatus,
};
