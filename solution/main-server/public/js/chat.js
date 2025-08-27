/**
 * @fileoverview JavaScript specifico per la chat lobby di CinemaHub
 * @description Gestisce lobby chat, lista stanze, accesso chat rooms e Socket.IO
 */

/**
 * @class ChatPage
 * @description Controlla tutta la logica della lobby chat
 */
class ChatPage {
  constructor() {
    this.currentRoom = null;
    this.currentUser = null;
    this.isConnected = false;
    this.messageHistory = [];
    this.availableRooms = new Map();
    this.typingTimeout = null;
    this.messageCache = new Map();
    this.autoJoinAttempted = false;

    this.init();
  }

  /**
   * @method init
   * @description Inizializza il controller della lobby chat
   */
  init() {
    this.setupEventListeners();
    this.checkUrlParameters();
    this.setupSocketHandlers();
    this.loadAvailableRooms();
  }

  /**
   * @method setupEventListeners
   * @description Configura tutti gli event listeners
   */
  setupEventListeners() {
    // Message form submission
    const messageForm = document.getElementById("message-form");
    if (messageForm) {
      messageForm.addEventListener("submit", (e) => {
        e.preventDefault();
        // HTML5 validity + custom
        if (!this.validateMessageInput()) {
          if (messageForm.reportValidity) messageForm.reportValidity();
          return;
        }
        this.sendMessage();
      });
    }

    // Message input events
    const messageInput = document.getElementById("message-input");
    if (messageInput) {
      messageInput.addEventListener("input", (e) => {
        this.handleMessageInput(e.target.value);
      });

      messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          messageForm.dispatchEvent(new Event("submit"));
        }
      });
    }

    // Room creation
    const createRoomBtn = document.getElementById("create-room-btn");
    if (createRoomBtn) {
      createRoomBtn.addEventListener("click", () => {
        this.showCreateRoomModal();
      });
    }

    const createRoomForm = document.getElementById("create-room-form");
    if (createRoomForm) {
      createRoomForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.createNewRoom();
      });
    }

    // Room actions
    const leaveRoomBtn = document.getElementById("leave-room-btn");
    if (leaveRoomBtn) {
      leaveRoomBtn.addEventListener("click", () => {
        this.leaveCurrentRoom();
      });
    }

    const roomInfoBtn = document.getElementById("room-info-btn");
    if (roomInfoBtn) {
      roomInfoBtn.addEventListener("click", () => {
        this.showRoomInfoModal();
      });
    }

    // Welcome screen actions
    // Bottoni rimossi - non più necessari
  }

  /**
   * @method checkUrlParameters
   * @description Controlla i parametri URL per auto-join stanze
   */
  checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomName = urlParams.get("room");
    const topic = urlParams.get("topic");
    const autoJoin = urlParams.get("autoJoin") === "true";

    if (roomName && autoJoin) {
      // Se già connesso, join immediatamente
      if (this.isConnected) {
        this.joinSpecificRoom(roomName, topic);
        this.autoJoinAttempted = true; // Marca come completato solo dopo il join
      } else {
        // Il join verrà fatto quando onSocketConnected viene chiamato
        // NON impostare autoJoinAttempted qui
      }
    }
  }

  /**
   * @method setupSocketHandlers
   * @description Configura gli handler Socket.IO specifici per la chat
   */
  setupSocketHandlers() {
    if (!window.cinemaHub || !window.cinemaHub.socket) {
      console.error("Socket.IO not available from main.js");
      this.showConnectionError("Socket.IO connection not available");
      return;
    }

    const socket = window.cinemaHub.socket;

    // Override handleIncomingMessage dal main.js
    window.cinemaHub.handleIncomingMessage = (data) => {
      this.displayMessage(data);
    };

    // Handler specifici per la lobby chat
    socket.on("room_list", (rooms) => {
      this.updateRoomsList(rooms);
    });

    socket.on("room_users_update", (data) => {
      this.updateRoomUsersCount(data);
    });

    socket.on("user_typing", (data) => {
      this.showTypingIndicator(data);
    });

    socket.on("user_stopped_typing", (data) => {
      this.hideTypingIndicator(data);
    });

    socket.on("message_history", (messages) => {
      this.loadMessageHistory(messages);
    });

    // Override eventi dal main.js per la pagina chat
    socket.on("room_joined", (data) => {
      this.onRoomJoined(data);
    });

    // Evento specifico per la chat (emesso dal backend)
    socket.on("room_joined_chat", (data) => {
      this.onRoomJoined(data);
    });

    socket.on("room_creation_result", (data) => {
      if (data.success) {
        this.onRoomCreated(data);
      } else {
        this.showError("Failed to create room: " + data.message);
      }
    });

    // Evento specifico per la creazione stanza nella chat
    socket.on("room_creation_result_chat", (data) => {
      if (data.success) {
        this.onRoomCreated(data);
      } else {
        this.showError("Failed to create room: " + data.message);
      }
    });

    socket.on("connect", () => {
      this.onSocketConnected();
    });

    socket.on("disconnect", () => {
      this.onSocketDisconnected();
    });
  }

  /**
   * @method onSocketConnected
   * @description Handler per connessione Socket.IO stabilita
   */
  onSocketConnected() {
    this.isConnected = true;
    this.hideConnectionStatus();

    // Ottieni info utente corrente
    if (window.cinemaHub.currentUser) {
      this.currentUser = window.cinemaHub.currentUser;
    } else {
      this.currentUser = {
        userName: `Guest${Math.floor(Math.random() * 1000)}`,
        socketId: window.cinemaHub.socket.id,
      };
    }

    this.updateCurrentUsername();
    this.loadAvailableRooms();

    // Ricontrolla i parametri URL dopo la connessione
    if (!this.autoJoinAttempted) {
      this.checkUrlParameters();
    }
  }

  /**
   * @method onSocketDisconnected
   * @description Handler per disconnessione Socket.IO
   */
  onSocketDisconnected() {
    this.isConnected = false;
    this.showConnectionStatus("disconnected", "Disconnected from chat server");
    this.currentRoom = null;
    this.showWelcomeScreen();
  }

  /**
   * @method loadAvailableRooms
   * @description Carica la lista delle stanze disponibili
   */
  async loadAvailableRooms() {
    if (!this.isConnected) return;

    try {
      // Richiedi lista stanze al server
      if (window.cinemaHub.socket) {
        window.cinemaHub.socket.emit("get_rooms_list");
      }

      // Carica anche da API REST come fallback
      const response = await fetch("/api/chat/rooms");
      
      if (response.ok) {
        const rooms = await response.json();
        this.updateRoomsList(rooms);
      } else {
        console.error("❌ REST API error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("❌ Error loading rooms:", error);
    }
  }

  /**
   * @method updateRoomsList
   * @param {Array} rooms - Lista delle stanze
   */
  updateRoomsList(rooms) {
    const roomsList = document.getElementById("rooms-list");
    if (!roomsList) {
      console.error("❌ rooms-list element not found");
      return;
    }

    if (!rooms || rooms.length === 0) {
      roomsList.innerHTML = `
        <div class="text-center py-4">
          <i class="bi bi-chat-square-text text-primary mb-2" style="font-size: 2rem;"></i>
          <p class="text-primary mb-0">No active rooms</p>
          <small class="text-primary">Create the first one!</small>
        </div>
      `;
      return;
    }

    let html = "";
    rooms.forEach((room, index) => {
      this.availableRooms.set(room.roomName, room);
      const isActive = this.currentRoom === room.roomName;

      html += `
        <div class="room-item ${isActive ? "active" : ""}" data-room="${this.escapeHtml(room.roomName)}">
          <div class="room-name">${this.escapeHtml(room.roomName)}</div>
          ${room.topic ? `<div class="room-topic">${this.escapeHtml(room.topic)}</div>` : ""}
          <div class="room-users-count">${room.userCount || 0}</div>
        </div>
      `;
    });

    roomsList.innerHTML = html;

    roomsList.querySelectorAll(".room-item").forEach((item) => {
      item.addEventListener("click", () => {
        const roomName = item.dataset.room;
        if (roomName !== this.currentRoom) {
          this.joinRoom(roomName);
        }
      });
    });
  }

  /**
   * @method joinRoom
   * @param {string} roomName - Nome della stanza da joinare
   */
  joinRoom(roomName) {
    if (!this.isConnected || !this.currentUser) {
      this.showError("Not connected to chat server");
      return;
    }

    if (window.cinemaHub.socket) {
      window.cinemaHub.socket.emit("join_room", {
        roomName: roomName,
        userName: this.currentUser.userName,
      });
    }
  }

  /**
   * @method joinSpecificRoom
   * @param {string} roomName - Nome della stanza
   * @param {string} topic - Topic della stanza
   */
  joinSpecificRoom(roomName, topic) {
    if (!this.isConnected || !this.currentUser) {
      this.showError("Not connected to chat server");
      return;
    }

    // Prima prova a creare la stanza, se esiste già verrà gestito dal server
    if (topic && window.cinemaHub.socket) {
      const createRoomData = {
        roomName: roomName,
        userName: this.currentUser.userName,
        topic: topic,
      };

      window.cinemaHub.socket.emit("create_room", createRoomData);
    } else {
      this.joinRoom(roomName);
    }
  }

  /**
   * @method onRoomJoined
   * @param {Object} data - Dati della stanza joinata
   */
  onRoomJoined(data) {
    this.currentRoom = data.roomName;
    this.showChatInterface();
    this.updateCurrentRoomInfo(data);
    this.loadRoomHistory(data.roomName);
    this.updateActiveRoomInList();

    if (window.cinemaHub) {
      window.cinemaHub.showNotification(
        `Joined room: ${data.roomName}`,
        "success",
      );
    }
  }

  /**
   * @method onRoomCreated
   * @param {Object} data - Dati della stanza creata
   */
  onRoomCreated(data) {
    this.currentRoom = data.roomName;
    this.showChatInterface();
    this.updateCurrentRoomInfo(data);
    this.updateActiveRoomInList();
    this.hideCreateRoomModal();

    if (window.cinemaHub) {
      window.cinemaHub.showNotification(
        `Room "${data.roomName}" created!`,
        "success",
      );
    }
  }

  /**
   * @method showChatInterface
   * @description Mostra l'interfaccia di chat attiva
   */
  showChatInterface() {
    const welcome = document.getElementById("chat-welcome");
    const chatInterface = document.getElementById("chat-interface");

    if (welcome) welcome.classList.add("d-none");
    if (chatInterface) chatInterface.classList.remove("d-none");
  }

  /**
   * @method showWelcomeScreen
   * @description Mostra la schermata di benvenuto
   */
  showWelcomeScreen() {
    const welcome = document.getElementById("chat-welcome");
    const chatInterface = document.getElementById("chat-interface");

    if (welcome) welcome.classList.remove("d-none");
    if (chatInterface) chatInterface.classList.add("d-none");

    this.clearMessages();
  }

  /**
   * @method updateCurrentRoomInfo
   * @param {Object} data - Informazioni della stanza
   */
  updateCurrentRoomInfo(data) {
    const roomNameEl = document.getElementById("current-room-name");
    const roomTopicEl = document.getElementById("current-room-topic");

    if (roomNameEl) roomNameEl.textContent = data.roomName || "Unknown Room";
    if (roomTopicEl)
      roomTopicEl.textContent = data.topic || "General discussion";
  }

  /**
   * @method updateActiveRoomInList
   * @description Aggiorna quale stanza è attiva nella lista
   */
  updateActiveRoomInList() {
    const roomItems = document.querySelectorAll(".room-item");
    roomItems.forEach((item) => {
      item.classList.remove("active");
      if (item.dataset.room === this.currentRoom) {
        item.classList.add("active");
      }
    });
  }

  /**
   * @method loadRoomHistory
   * @param {string} roomName - Nome della stanza
   */
  async loadRoomHistory(roomName) {
    try {
      const response = await fetch(
        `/api/chat/messages/${encodeURIComponent(roomName)}?page=1`,
      );
      if (response.ok) {
        const messages = await response.json();
        this.loadMessageHistory(messages);
      }
    } catch (error) {
      console.error("Error loading room history:", error);
    }
  }

  /**
   * @method loadMessageHistory
   * @param {Array} messages - Lista dei messaggi storici
   */
  loadMessageHistory(messages) {
    this.clearMessages();

    if (!messages || messages.length === 0) {
      this.showEmptyMessages();
      return;
    }

    messages.forEach((message) => {
      this.displayMessage(
        {
          userName: message.userName,
          message: message.message,
          timestamp: message.timestamp,
          roomName: message.roomName,
        },
        false,
      );
    });

    this.scrollToBottom();
  }

  /**
   * @method sendMessage
   * @description Invia un messaggio nella stanza corrente
   */
  sendMessage() {
    const messageInput = document.getElementById("message-input");
    if (!messageInput) return;

    const message = messageInput.value.trim();
    if (!message || !this.currentRoom || !this.isConnected) return;

    // Simple anti-spam: limit 3 messages per 1000ms
    if (!this.messageTimestamps) this.messageTimestamps = [];
    const now = Date.now();
    this.messageTimestamps = this.messageTimestamps.filter((t) => now - t < 1000);
    if (this.messageTimestamps.length >= 3) {
      this.showError("You're sending messages too fast. Please slow down.");
      return;
    }
    this.messageTimestamps.push(now);

    if (window.cinemaHub.socket && this.currentUser) {
      window.cinemaHub.socket.emit("room_message", {
        roomName: this.currentRoom,
        userName: this.currentUser.userName,
        message: message,
      });

      messageInput.value = "";
      this.updateCharCount(0);

      messageInput.focus();
    }
  }

  /**
   * @method validateMessageInput
   * @description Valida input messaggio (non vuoto, limiti)
   * @returns {boolean}
   */
  validateMessageInput() {
    const input = document.getElementById("message-input");
    if (!input) return true;

    const value = input.value.trim();
    input.setCustomValidity("");

    if (value.length === 0) {
      input.setCustomValidity("Message cannot be empty");
    } else if (value.length > 500) {
      input.setCustomValidity("Message too long (max 500 characters)");
    }

    return input.checkValidity();
  }

  /**
   * @method displayMessage
   * @param {Object} data - Dati del messaggio
   * @param {boolean} animate - Se animare il messaggio
   */
  displayMessage(data, animate = true) {
    const messagesContainer = document.getElementById("messages-container");
    if (!messagesContainer) return;

    const emptyState = messagesContainer.querySelector(".empty-messages");
    if (emptyState) emptyState.remove();

    const isOwnMessage =
      this.currentUser && data.userName === this.currentUser.userName;
    const isSystemMessage = data.userName === "System";

    const messageEl = document.createElement("div");
    messageEl.className = `message ${isOwnMessage ? "message-own" : ""} ${isSystemMessage ? "message-system" : ""}`;

    if (!animate) {
      messageEl.style.animation = "none";
    }

    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    const timeString = timestamp.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isSystemMessage) {
      messageEl.innerHTML = `
        <div class="message-content">
          <i class="bi bi-info-circle me-1"></i>
          ${this.escapeHtml(data.message)}
        </div>
      `;
    } else {
      messageEl.innerHTML = `
        <div class="message-header">
          <div class="message-username">${this.escapeHtml(data.userName)}</div>
          <div class="message-time">${timeString}</div>
        </div>
        <div class="message-content">${this.formatMessageContent(data.message)}</div>
      `;
    }

    messagesContainer.appendChild(messageEl);
    this.scrollToBottom();

    // Mantieni solo gli ultimi 100 messaggi per performance
    const messages = messagesContainer.querySelectorAll(".message");
    if (messages.length > 100) {
      messages[0].remove();
    }
  }

  /**
   * @method formatMessageContent
   * @param {string} content - Contenuto del messaggio
   * @returns {string} Contenuto formattato
   */
  formatMessageContent(content) {
    if (!content) return "";

    let formatted = this.escapeHtml(content);

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    formatted = formatted.replace(
      urlRegex,
      '<a href="$1" target="_blank" rel="noopener">$1</a>',
    );

    formatted = formatted.replace(/\n/g, "<br>");

    return formatted;
  }

  /**
   * @method handleMessageInput
   * @param {string} value - Valore dell'input
   */
  handleMessageInput(value) {
    this.updateCharCount(value.length);
    this.updateSendButton(value.trim().length > 0);
  }

  /**
   * @method updateCharCount
   * @param {number} count - Numero di caratteri
   */
  updateCharCount(count) {
    const charCountEl = document.getElementById("char-count");
    if (charCountEl) {
      charCountEl.textContent = count;

      if (count > 450) {
        charCountEl.classList.add("text-warning");
      } else if (count > 480) {
        charCountEl.classList.remove("text-warning");
        charCountEl.classList.add("text-danger");
      } else {
        charCountEl.classList.remove("text-warning", "text-danger");
      }
    }
  }

  /**
   * @method updateSendButton
   * @param {boolean} enabled - Se abilitare il bottone
   */
  updateSendButton(enabled) {
    const sendBtn = document.getElementById("send-btn");
    if (sendBtn) {
      sendBtn.disabled = !enabled || !this.isConnected;
    }
  }

  /**
   * @method updateCurrentUsername
   */
  updateCurrentUsername() {
    const usernameEl = document.getElementById("current-username");
    if (usernameEl && this.currentUser) {
      usernameEl.textContent = this.currentUser.userName;
    }
  }

  /**
   * @method clearMessages
   * @description Pulisce tutti i messaggi
   */
  clearMessages() {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer) {
      messagesContainer.innerHTML = "";
    }
  }

  /**
   * @method showEmptyMessages
   * @description Mostra stato vuoto per messaggi
   */
  showEmptyMessages() {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer) {
      messagesContainer.innerHTML = `
        <div class="empty-messages">
          <i class="bi bi-chat-dots"></i>
          <p>No messages yet</p>
          <small>Be the first to start the conversation!</small>
        </div>
      `;
    }
  }

  /**
   * @method scrollToBottom
   * @description Scrolla alla fine dei messaggi
   */
  scrollToBottom() {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  /**
   * @method showCreateRoomModal
   */
  showCreateRoomModal() {
    const modal = new bootstrap.Modal(
      document.getElementById("createRoomModal"),
    );
    modal.show();
  }

  /**
   * @method hideCreateRoomModal
   */
  hideCreateRoomModal() {
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("createRoomModal"),
    );
    if (modal) modal.hide();
  }

  /**
   * @method createNewRoom
   * @description Crea una nuova stanza
   */
  createNewRoom() {
    const roomNameInput = document.getElementById("new-room-name");
    const roomTopicInput = document.getElementById("new-room-topic");

    if (!roomNameInput || !this.isConnected || !this.currentUser) return;

    const roomName = roomNameInput.value.trim();
    const roomTopic = roomTopicInput.value.trim();

    if (!roomName) {
      roomNameInput.focus();
      return;
    }

    if (window.cinemaHub.socket) {
      window.cinemaHub.socket.emit("create_room", {
        roomName: roomName,
        userName: this.currentUser.userName,
        topic: roomTopic || "",
      });
    }

    roomNameInput.value = "";
    roomTopicInput.value = "";
  }

  /**
   * @method leaveCurrentRoom
   * @description Esce dalla stanza corrente
   */
  leaveCurrentRoom() {
    if (!this.currentRoom || !this.isConnected || !this.currentUser) return;

    if (window.cinemaHub.socket) {
      window.cinemaHub.socket.emit("leave_room", {
        roomName: this.currentRoom,
        userName: this.currentUser.userName,
      });
    }

    this.currentRoom = null;
    this.showWelcomeScreen();
    this.updateActiveRoomInList();

    if (window.cinemaHub) {
      window.cinemaHub.showNotification("Left the room", "info");
    }
  }

  /**
   * @method showRoomInfoModal
   * @description Mostra informazioni sulla stanza corrente
   */
  showRoomInfoModal() {
    if (!this.currentRoom) return;

    const roomData = this.availableRooms.get(this.currentRoom);

    // Aggiorna contenuto modal
    document.getElementById("info-room-name").textContent = this.currentRoom;
    document.getElementById("info-room-topic").textContent =
      roomData?.topic || "No topic set";
    document.getElementById("info-room-users").textContent =
      roomData?.userCount || "0";
    document.getElementById("info-room-created").textContent =
      roomData?.created || "Unknown";

    const modal = new bootstrap.Modal(document.getElementById("roomInfoModal"));
    modal.show();
  }

  /**
   * @method updateRoomUsersCount
   * @param {Object} data - Dati aggiornamento utenti
   */
  updateRoomUsersCount(data) {
    const roomCountEl = document.getElementById("current-room-users");
    if (roomCountEl && data.roomName === this.currentRoom) {
      roomCountEl.textContent = data.userCount || 0;
    }

    // Aggiorna anche nella lista stanze
    const roomItem = document.querySelector(
      `[data-room="${data.roomName}"] .room-users-count`,
    );
    if (roomItem) {
      roomItem.textContent = data.userCount || 0;
    }
  }

  /**
   * @method showConnectionStatus
   * @param {string} type - Tipo di connessione
   * @param {string} message - Messaggio
   */
  showConnectionStatus(type, message) {
    const statusEl = document.getElementById("connection-status");
    const messageEl = document.getElementById("connection-message");

    if (statusEl && messageEl) {
      statusEl.className = `connection-status ${type}`;
      messageEl.textContent = message;
      statusEl.classList.remove("d-none");
    }
  }

  /**
   * @method hideConnectionStatus
   */
  hideConnectionStatus() {
    const statusEl = document.getElementById("connection-status");
    if (statusEl) {
      statusEl.classList.add("d-none");
    }
  }

  /**
   * @method showError
   * @param {string} message - Messaggio di errore
   */
  showError(message) {
    if (window.cinemaHub) {
      window.cinemaHub.showNotification(message, "error");
    }
  }

  /**
   * @method escapeHtml
   * @param {string} text - Testo da sanificare
   * @returns {string} Testo sanificato
   */
  escapeHtml(text) {
    if (window.cinemaHub && window.cinemaHub.escapeHtml) {
      return window.cinemaHub.escapeHtml(text);
    }

    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  window.ChatPage = new ChatPage();
});