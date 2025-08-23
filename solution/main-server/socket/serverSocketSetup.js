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

    io.on("connection", (clientSocket) => {
      console.log(`New Socket.io connection: ${clientSocket.id}`);
      setupClientSocket(
        clientSocket,
        io,
        errorSocketHandler,
      );
    });

    console.log("Server socket configurato");
  } catch (error) {
    console.error("++ CRITICO ++ , ERROR IN SETUP SOCKET SERVER", error);
  }
}

module.exports = createSocketServer;
