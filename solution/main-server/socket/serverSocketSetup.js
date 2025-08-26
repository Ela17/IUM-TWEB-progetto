const socketIo = require("socket.io");
const { socketConfig } = require("../config/index");
const setupClientSocket = require("./clientSocketSetup");
const usersMetadataManager = require("./utils/UsersMetadataManager");
const getErrorSocketHandler = require("./eventHandlers/ErrorSocketHandler");

/**
 * @function createSocketServer
 * @description Creazione del socket server su server http.
 * @param {http.Server} httpServer - Il server HTTP su cui montare Socket.IO
 * @param {Object} [options=socketConfig] - Configurazione Socket.IO (CORS, transports, etc.)
 * @returns {Server} io - L'istanza del server Socket.IO configurata e pronta all'uso
 * @throws {Error} Rilancia eventuali errori durante l'inizializzazione di Socket.IO
 */
function createSocketServer(httpServer, options = socketConfig) {
  try {
    const io = socketIo(httpServer, options);
    const errorSocketHandler = getErrorSocketHandler(io);
    console.log("User Manager configured");

    // Gestione connessioni con logging migliorato
    io.on("connection", (clientSocket) => {
      console.log(`🔌 Nuova connessione Socket.io: ${clientSocket.id}`);

      // Gestione disconnessione
      clientSocket.on("disconnect", (reason) => {
        console.log(
          `🔌 Disconnessione Socket.io ${clientSocket.id}: ${reason}`,
        );
      });

      // Gestione errori del client
      clientSocket.on("error", (error) => {
        console.error(`❌ Errore Socket.io ${clientSocket.id}:`, error);
      });

      setupClientSocket(clientSocket, io, errorSocketHandler);
    });

    // Gestione errori del server
    io.engine.on("connection_error", (err) => {
      console.error("❌ Errore connessione Socket.io:", err);
    });

    console.log(
      "✅ Server socket configurato con gestione connessioni migliorata",
    );
    return io;
  } catch (error) {
    console.error("++ CRITICO ++ , ERROR IN SETUP SOCKET SERVER", error);
    throw error;
  }
}

module.exports = createSocketServer;
