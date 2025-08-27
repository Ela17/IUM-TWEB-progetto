const socketIo = require("socket.io");
const { socketConfig } = require("../config/index");
const setupClientSocket = require("./clientSocketSetup");

/**
 * @function createSocketServer
 * @description Inizializza Socket.IO sul server HTTP con la configurazione fornita.
 * @param {import('http').Server} httpServer - Server HTTP Express.
 * @param {Object} [options=socketConfig] - Opzioni Socket.IO (CORS, ping, transports, ecc.).
 * @returns {import('socket.io').Server} Istanza di Socket.IO.
 */
function createSocketServer(httpServer, options = socketConfig) {
  const io = socketIo(httpServer, options);

  // Logging base delle connessioni
  io.on("connection", (clientSocket) => {
    console.log(`🔌 Socket connected: ${clientSocket.id}`);
    setupClientSocket(clientSocket, io);

    clientSocket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected ${clientSocket.id}: ${reason}`);
    });
  });

  // Errori di livello engine
  if (io.engine && typeof io.engine.on === "function") {
    io.engine.on("connection_error", (err) => {
      console.error("❌ Socket.IO connection error:", err && err.message ? err.message : err);
    });
  }

  console.log("✅ Socket.IO server initialized");
  return io;
}

module.exports = createSocketServer;
