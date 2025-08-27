/**
 * @fileoverview Gestione connessione MongoDB
 * @module database
 */

const mongoose = require("mongoose");
const { DATABASE_CONFIG } = require("../config/constants");

// Configurazione database
const mongoDB =
  process.env.MONGODB_URI ||
  `mongodb://localhost:27017/${process.env.DB_NAME || "cinema_db"}`;

mongoose.Promise = global.Promise;

/**
 * Connette al database MongoDB
 * @returns {Promise} Promise della connessione
 */
async function connect() {
  try {
    await mongoose.connect(mongoDB, {
      maxPoolSize: DATABASE_CONFIG.MAX_POOL_SIZE,
      serverSelectionTimeoutMS: DATABASE_CONFIG.CONNECTION_TIMEOUT,
    });

    console.log("✅ MongoDB connection successful!");
    console.log(
      `🔗 Connected to database: ${mongoose.connection.db.databaseName}`,
    );

    // Gestione eventi di connessione
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("🔌 MongoDB disconnected");
    });

    mongoose.connection.on("connected", () => {
      console.log("🟢 Mongoose connected to MongoDB");
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

/**
 * Chiude la connessione al database
 */
async function disconnect() {
  try {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database:", error);
    throw error;
  }
}

// Nota: la gestione dei segnali di processo è centralizzata in bin/www
// per evitare comportamenti duplicati o incoerenti.

module.exports = {
  connect,
  disconnect,
};
