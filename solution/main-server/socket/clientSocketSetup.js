const usersMetadataManager = require("./utils/UsersMetadataManager");
const {
  SOCKET_ROOM_EVENTS,
  ROOM_EVENTS,
  SOCKET_MESSAGE_EVENTS,
  SOCKET_USER_COUNT_EVENTS,
} = require("./constants/socketConstants");

function getPublicRooms(io) {
  const publicRooms = [];
  const roomsMap = io.sockets.adapter.rooms;
  const socketsMap = io.sockets.sockets;

  for (const [roomName, clientsSet] of roomsMap) {
    // Filtra le "stanze" che in realtà sono i singoli socketId
    if (!socketsMap.has(roomName)) {
      publicRooms.push({ roomName, userCount: clientsSet.size });
    }
  }
  return publicRooms;
}

function sendUserCount(io) {
  const currentConnections = usersMetadataManager.getCurrentConnections();
  io.emit(SOCKET_USER_COUNT_EVENTS.USER_COUNT_UPDATE, currentConnections);
}

function emitRoomUsersUpdate(io, roomName) {
  if (!roomName) return;
  const room = io.sockets.adapter.rooms.get(roomName);
  const userCount = room ? room.size : 0;
  io.to(roomName).emit("room_users_update", { roomName, userCount });
}

module.exports = function setupClientSocket(clientSocket, io) {
  const userProfile = usersMetadataManager.registerUser(clientSocket.id);

  // Benvenuto al singolo client
  clientSocket.emit(SOCKET_MESSAGE_EVENTS.WELCOME, {
    success: true,
    userName: userProfile.userName,
    socketId: userProfile.socketId,
    timestamp: new Date().toISOString(),
  });

  // Broadcast conteggio utenti
  sendUserCount(io);

  // Richiesta esplicita del conteggio utenti
  clientSocket.on(SOCKET_USER_COUNT_EVENTS.REQUEST_USER_COUNT, () => {
    clientSocket.emit(
      SOCKET_USER_COUNT_EVENTS.USER_COUNT_UPDATE,
      usersMetadataManager.getCurrentConnections(),
    );
  });

  // Room: create (in memoria, nessuna persistenza)
  clientSocket.on(SOCKET_ROOM_EVENTS.CREATE_ROOM, (data = {}) => {
    const roomName = (data.roomName || "").trim();
    const userName = data.userName || userProfile.userName;
    if (!roomName) return;

    clientSocket.join(roomName);
    usersMetadataManager.updateCurrentRoom(
      clientSocket.id,
      roomName,
      ROOM_EVENTS.JOIN,
    );

    clientSocket.emit(SOCKET_ROOM_EVENTS.ROOM_CREATED, {
      success: true,
      roomName,
      message: `Room "${roomName}" created successfully!`,
      userName,
      timestamp: new Date().toISOString(),
    });

    emitRoomUsersUpdate(io, roomName);
  });

  // Room: join
  clientSocket.on(SOCKET_ROOM_EVENTS.JOIN_ROOM, (data = {}) => {
    const roomName = (data.roomName || "").trim();
    const userName = data.userName || userProfile.userName;
    if (!roomName) return;

    clientSocket.join(roomName);
    usersMetadataManager.updateCurrentRoom(
      clientSocket.id,
      roomName,
      ROOM_EVENTS.JOIN,
    );

    clientSocket.emit(SOCKET_ROOM_EVENTS.ROOM_JOINED, {
      roomName,
      message: `You joined room: ${roomName}`,
      timestamp: new Date().toISOString(),
    });

    io.to(roomName).emit(SOCKET_ROOM_EVENTS.USER_JOINED, {
      roomName,
      userName,
      timestamp: new Date().toISOString(),
    });

    emitRoomUsersUpdate(io, roomName);
  });

  // Room: leave
  clientSocket.on(SOCKET_ROOM_EVENTS.LEAVE_ROOM, (data = {}) => {
    const roomName = (data.roomName || "").trim();
    const userName = data.userName || userProfile.userName;
    if (!roomName) return;

    clientSocket.leave(roomName);
    usersMetadataManager.updateCurrentRoom(
      clientSocket.id,
      roomName,
      ROOM_EVENTS.LEAVE,
    );

    clientSocket.to(roomName).emit(SOCKET_ROOM_EVENTS.USER_LEFT, {
      roomName,
      userName,
      timestamp: new Date().toISOString(),
    });

    emitRoomUsersUpdate(io, roomName);
  });

  // Room: lista stanze attive (in memoria)
  clientSocket.on(SOCKET_ROOM_EVENTS.GET_ROOMS_LIST, () => {
    const rooms = getPublicRooms(io);
    clientSocket.emit(SOCKET_ROOM_EVENTS.ROOM_LIST, rooms);
  });

  // Messaggi stanza (broadcast in memoria)
  clientSocket.on(SOCKET_MESSAGE_EVENTS.ROOM_MESSAGE, (data = {}) => {
    const roomName = (data.roomName || "").trim();
    const userName = data.userName || userProfile.userName;
    const message = (data.message || "").toString();
    if (!roomName || !message) return;

    io.to(roomName).emit(SOCKET_MESSAGE_EVENTS.ROOM_MESSAGE_RECEIVED, {
      roomName,
      userName,
      message,
      timestamp: new Date().toISOString(),
    });
  });

  // Disconnessione
  clientSocket.on("disconnect", (reason) => {
    usersMetadataManager.removeUser(clientSocket.id);
    sendUserCount(io);
  });
};
