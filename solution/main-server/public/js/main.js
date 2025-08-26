/**
 * @fileoverview Script principale per CinemaHub
 * @description Coordina tutti i moduli dell'applicazione
 */

/**
 * @class CinemaHub
 * @description Gestisce tutta l'interattività del lato client, inclusa la ricerca,
 * la gestione dei socket e le interazioni con l'interfaccia utente.
 */
class CinemaHub {
  constructor() {
    this.searchTimeout = null;
    this.socket = null;
    this.onlineUsers = 0;
    this.searchCache = new Map();
    this.searchHistory = [];

    this.init();
  }

  /**
   * @method init
   * @description Metodo principale di inizializzazione che avvia tutti i componenti.
   */
  init() {
    console.log("🎬 Initializing CinemaHub...");

    this.setupEventListeners();
    this.initializeSearch();
    this.initializeSocket();
    this.initializeThemeManager();

    console.log("✅ CinemaHub initialized successfully");
  }

  // ======================
  // THEME MANAGEMENT
  // ======================

  /**
   * @method initializeThemeManager
   * @description Inizializza il sistema di gestione del tema.
   */
  initializeThemeManager() {
    this.themeManager = new ThemeManager();
    console.log("🎨 Theme manager initialized");
  }

  /**
   * @method getCurrentTheme
   * @returns {string} Il tema corrente ('light' o 'dark').
   */
  getCurrentTheme() {
    return this.themeManager ? this.themeManager.getCurrentTheme() : "light";
  }

  /**
   * @method setTheme
   * @param {string} theme - Il tema da applicare ('light' o 'dark').
   */
  setTheme(theme) {
    if (this.themeManager) {
      this.themeManager.forceTheme(theme);
    }
  }

  // =================
  // EVENT LISTENERS
  // =================

  /**
   * @method setupEventListeners
   * @description Configura tutti i listener di eventi per l'interfaccia utente.
   */
  setupEventListeners() {
    // Invio del form di ricerca
    const searchForm = document.getElementById("quick-search");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.performQuickSearch();
      });
    }

    // Input di ricerca in tempo reale
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.handleSearchInput(e.target.value);
      });

      // Nasconde risultati quando si clicca fuori
      document.addEventListener("click", (e) => {
        const searchResults = document.getElementById("search-results");
        if (
          !searchInput.contains(e.target) &&
          (!searchResults || !searchResults.contains(e.target))
        ) {
          this.hideSearchResults();
        }
      });

      // Navigazione con tastiera
      searchInput.addEventListener("keydown", (e) => {
        this.handleSearchKeyNavigation(e);
      });
    }

    // Navbar scroll effect
    window.addEventListener("scroll", () => {
      this.handleNavbarScroll();
    });

    // Visibilità pagina per socket
    document.addEventListener("visibilitychange", () => {
      this.handleVisibilityChange();
    });
  }

  // ==========================
  // SEARCH FUNCTIONALITY
  // ==========================

  /**
   * @method initializeSearch
   * @description Prepara la funzionalità di ricerca.
   */
  initializeSearch() {
    this.searchCache = new Map();
    this.searchHistory = JSON.parse(
      localStorage.getItem("searchHistory") || "[]",
    );
    this.selectedSearchIndex = -1;
  }

  /**
   * @method handleSearchInput
   * @param {string} query - La stringa di ricerca inserita dall'utente.
   */
  handleSearchInput(query) {
    clearTimeout(this.searchTimeout);

    if (query.length < 2) {
      this.hideSearchResults();
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.performLiveSearch(query);
    }, 300);
  }

  /**
   * @method handleSearchKeyNavigation
   * @param {KeyboardEvent} e - L'evento di pressione del tasto.
   */
  handleSearchKeyNavigation(e) {
    const searchResults = document.getElementById("search-results");
    if (!searchResults || searchResults.classList.contains("d-none")) {
      return;
    }

    const items = searchResults.querySelectorAll(".search-item");

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.selectedSearchIndex = Math.min(
          this.selectedSearchIndex + 1,
          items.length - 1,
        );
        this.updateSearchSelection(items);
        break;

      case "ArrowUp":
        e.preventDefault();
        this.selectedSearchIndex = Math.max(this.selectedSearchIndex - 1, -1);
        this.updateSearchSelection(items);
        break;

      case "Enter":
        if (this.selectedSearchIndex >= 0 && items[this.selectedSearchIndex]) {
          e.preventDefault();
          items[this.selectedSearchIndex].click();
        }
        break;

      case "Escape":
        this.hideSearchResults();
        break;
    }
  }

  /**
   * @method updateSearchSelection
   * @param {NodeList} items - La lista degli elementi dei risultati di ricerca.
   */
  updateSearchSelection(items) {
    items.forEach((item, index) => {
      if (index === this.selectedSearchIndex) {
        item.classList.add("active");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("active");
      }
    });
  }

  /**
   * @async
   * @method performLiveSearch
   * @param {string} query - La stringa di ricerca.
   */
  async performLiveSearch(query) {
    // Controlla cache
    if (this.searchCache.has(query)) {
      this.displaySearchResults(this.searchCache.get(query));
      return;
    }

    try {
      this.showSearchLoading();

      const response = await axios.get(`/api/movies/suggestions`, {
        params: { q: query },
        timeout: 5000,
      });

      const results = {
        query: query,
        movies: response.data || [],
      };

      this.searchCache.set(query, results);
      this.displaySearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      this.displaySearchError("Search failed. Please try again.");
    } finally {
      this.hideSearchLoading();
    }
  }

  /**
   * @method performQuickSearch
   * @description Esegue una ricerca completa reindirizzando alla pagina dei risultati.
   */
  performQuickSearch() {
    const query = document.getElementById("search-input").value.trim();
    if (query) {
      this.addToSearchHistory(query);
      window.location.href = `/movies?search=${encodeURIComponent(query)}`;
    }
  }

  /**
   * @method displaySearchResults
   * @param {object} results - I risultati di ricerca.
   */
  displaySearchResults(results) {
    const resultsContainer = document.getElementById("search-results");

    if (!results || !results.movies?.length) {
      this.displaySearchEmpty();
      return;
    }

    this.selectedSearchIndex = -1;

    let html = '<div class="search-results-content">';
    html += '<div class="search-category">';
    html += "<h6>Movies</h6>";

    results.movies.forEach((movie, index) => {
      html += `
        <a href="/movies/${movie.id}" class="search-item" data-index="${index}">
          <img src="${movie.poster_url || "/images/no-image.svg"}" 
              alt="${this.escapeHtml(movie.name)}" 
              class="search-item-image"
              onerror="this.src='/images/no-image.svg'">
          <div class="search-item-info">
            <h6>${this.highlightSearchTerm(movie.name, results.query)}</h6>
            <small>
              ${movie.year || "Unknown year"} • 
              <i class="bi bi-star-fill text-cinema-gold"></i> ${movie.rating || "N/A"}
              ${movie.duration ? ` • ${movie.duration}min` : ""}
            </small>
          </div>
        </a>
      `;
    });

    html += "</div></div>";

    if (resultsContainer) {
      resultsContainer.innerHTML = html;
      this.showSearchResults();
    }
  }

  /**
   * @method displaySearchEmpty
   */
  displaySearchEmpty() {
    const resultsContainer = document.getElementById("search-results");
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="search-results-content text-center py-4">
          <i class="bi bi-search fs-1 text-muted mb-2"></i>
          <p class="text-muted">No results found</p>
          <small class="text-muted">Try different keywords or browse our collections</small>
        </div>
      `;
      this.showSearchResults();
    }
  }

  /**
   * @method displaySearchError
   * @param {string} message - Il messaggio di errore.
   */
  displaySearchError(message) {
    const resultsContainer = document.getElementById("search-results");
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="search-results-content text-center py-4">
          <i class="bi bi-exclamation-circle fs-1 text-danger mb-2"></i>
          <p class="text-danger">${message}</p>
          <button class="btn btn-sm btn-outline-primary" onclick="location.reload()">
            <i class="bi bi-arrow-clockwise me-1"></i>Retry
          </button>
        </div>
      `;
      this.showSearchResults();
    }
  }

  /**
   * @method showSearchLoading
   */
  showSearchLoading() {
    const resultsContainer = document.getElementById("search-results");
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="search-results-content text-center py-4">
          <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
          <p class="text-muted mb-0">Searching...</p>
        </div>
      `;
      this.showSearchResults();
    }
  }

  hideSearchLoading() {
    // Lo stato di caricamento verrà sostituito dai risultati
  }

  showSearchResults() {
    const resultsContainer = document.getElementById("search-results");
    if (resultsContainer) {
      resultsContainer.classList.remove("d-none");
    }
  }

  hideSearchResults() {
    const resultsContainer = document.getElementById("search-results");
    if (resultsContainer) {
      resultsContainer.classList.add("d-none");
    }
    this.selectedSearchIndex = -1;
  }

  /**
   * @method highlightSearchTerm
   * @param {string} text - Il testo originale.
   * @param {string} term - Il termine da evidenziare.
   * @returns {string} Il testo con il termine evidenziato.
   */
  highlightSearchTerm(text, term) {
    if (!term || !text) return this.escapeHtml(text);

    const regex = new RegExp(`(${this.escapeRegex(term)})`, "gi");
    return this.escapeHtml(text).replace(regex, "<mark>$1</mark>");
  }

  /**
   * @method addToSearchHistory
   * @param {string} query - La query da aggiungere allo storico.
   */
  addToSearchHistory(query) {
    this.searchHistory = this.searchHistory.filter((item) => item !== query);
    this.searchHistory.unshift(query);
    this.searchHistory = this.searchHistory.slice(0, 10);
    localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
  }

  // ================
  // SOCKET.IO
  // ================

  /**
   * @method initializeSocket
   * @description Inizializza la connessione Socket.IO.
   */
  initializeSocket() {
    if (typeof io === "undefined") {
      console.warn("Socket.IO not loaded, chat features disabled");
      return;
    }

    try {
      this.socket = io({
        timeout: 5000,
        retries: 3,
      });

      this.socket.on("connect", () => {
        console.log("✅ Connected to chat server");
        this.updateChatIndicator(true);
        this.showNotification("Connected to live chat", "success");

        this.socket.emit("request_user_count");
      });

      this.socket.on("disconnect", (reason) => {
        console.log("❌ Disconnected from chat server:", reason);
        this.updateChatIndicator(false);

        if (reason === "io server disconnect") {
          this.socket.connect();
        }
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        this.updateChatIndicator(false);
      });

      this.socket.on("welcome", (data) => {
        console.log("🎯 Welcome message received:", data);
        if (data.success) {
          this.currentUser = {
            userName: data.userName,
            socketId: data.socketId,
          };
          this.showNotification(`Welcome ${data.userName}!`, "success");
        }
      });

      this.socket.on("room_creation_result", (data) => {
        if (data.success) {
          console.log(`🎬 Room "${data.roomName}" created successfully`);
          this.currentRoom = data.roomName;
          this.showNotification(`Room "${data.roomName}" created!`, "success");
        }
      });

      this.socket.on("room_joined", (data) => {
        console.log(`🚪 Joined room: ${data.roomName}`);
        this.currentRoom = data.roomName;
        this.showNotification(`Joined room: ${data.roomName}`, "info");
      });

      this.socket.on("user_joined", (data) => {
        console.log(`👋 ${data.userName} joined ${data.roomName}`);
        this.showNotification(`${data.userName} joined the room`, "info");
      });

      this.socket.on("user_left", (data) => {
        console.log(`👋 ${data.userName} left ${data.roomName}`);
        this.showNotification(`${data.userName} left the room`, "info");
      });

      this.socket.on("room_message_received", (data) => {
        console.log(
          `💬 Message in ${data.roomName} from ${data.userName}: ${data.message}`,
        );
        this.handleIncomingMessage(data);
      });

      this.socket.on("error", (error) => {
        console.error("Socket error:", error);
        this.showNotification("Chat connection error", "error");
      });

      this.socket.on("user_count_update", (count) => {
        this.updateOnlineUsersCount(count);
      });

      this.socket.on("notification", (data) => {
        this.showNotification(data.message, data.type || "info");
      });
    } catch (error) {
      console.error("Socket initialization failed:", error);
    }
  }

  /**
   * @method joinRoom
   * @param {string} roomName - Nome della stanza
   * @param {string} userName - Nome utente
   */
  joinRoom(roomName, userName) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("join_room", {
        roomName: roomName,
        userName: userName,
      });
    }
  }

  /**
   * @method createRoom
   * @param {string} roomName - Nome della stanza
   * @param {string} userName - Nome utente
   * @param {string} topic - Argomento della stanza
   */
  createRoom(roomName, userName, topic = "") {
    if (this.socket && this.socket.connected) {
      this.socket.emit("create_room", {
        roomName: roomName,
        userName: userName,
        topic: topic,
      });
    }
  }

  /**
   * @method leaveRoom
   * @param {string} roomName - Nome della stanza
   * @param {string} userName - Nome utente
   */
  leaveRoom(roomName, userName) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("leave_room", {
        roomName: roomName,
        userName: userName,
      });
      this.currentRoom = null;
    }
  }

  /**
   * @method sendMessage
   * @param {string} roomName - Nome della stanza
   * @param {string} userName - Nome utente
   * @param {string} message - Messaggio da inviare
   */
  sendMessage(roomName, userName, message) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("room_message", {
        roomName: roomName,
        userName: userName,
        message: message,
      });
    }
  }

  /**
   * @method updateChatIndicator
   * @param {boolean} connected - Stato della connessione.
   */
  updateChatIndicator(connected) {
    const indicator = document.getElementById("chat-indicator");
    if (indicator) {
      if (connected) {
        indicator.classList.add("text-success");
        indicator.classList.remove("text-danger");
        indicator.title = "Chat online";
      } else {
        indicator.classList.add("text-danger");
        indicator.classList.remove("text-success");
        indicator.title = "Chat offline";
      }
    }
  }

  /**
   * @method updateOnlineUsersCount
   * @param {number} count - Il numero di utenti online.
   */
  updateOnlineUsersCount(count) {
    const counters = [
      "navbar-online-users",
      "home-online-users",
      "chat-online-users",
      "footer-online-users",
    ];

    counters.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        const prevCount = parseInt(element.textContent) || 0;
        element.textContent = count || 0;

        if (count !== prevCount) {
          element.style.animation = "none";
          element.offsetHeight;
          element.style.animation = "fadeIn 0.5s ease";
        }
      }
    });
  }

  // ===================
  // UI INTERACTIONS
  // ===================

  /**
   * @method handleNavbarScroll
   * @description Gestisce l'effetto di scroll sulla navbar.
   */
  handleNavbarScroll() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    if (window.scrollY > 50) {
      navbar.classList.add("navbar-scrolled");
      navbar.style.backdropFilter = "blur(15px)";

      const isDark = this.getCurrentTheme() === "dark";
      navbar.style.backgroundColor = isDark
        ? "rgba(20, 20, 20, 0.95)"
        : "rgba(44, 62, 80, 0.95)";
    } else {
      navbar.classList.remove("navbar-scrolled");
      navbar.style.backdropFilter = "blur(10px)";
      navbar.style.backgroundColor = "";
    }
  }

  /**
   * @method handleVisibilityChange
   * @description Gestisce cambio di visibilità della pagina per socket.
   */
  handleVisibilityChange() {
    if (document.hidden) {
      if (this.socket && this.socket.connected) {
        this.socket.emit("user_inactive");
      }
    } else {
      if (this.socket && this.socket.connected) {
        this.socket.emit("user_active");
      }
    }
  }

  /**
   * @method showNotification
   * @param {string} message - Il messaggio della notifica.
   * @param {string} [type='info'] - Il tipo di notifica.
   */
  showNotification(message, type = "info") {
    const toastHtml = `
      <div class="toast align-items-center border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <i class="bi bi-${this.getIconForType(type)} me-2"></i>
            ${message}
          </div>
          <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    let toastContainer = document.querySelector(".toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.className =
        "toast-container position-fixed top-0 end-0 p-3";
      toastContainer.style.zIndex = "1055";
      document.body.appendChild(toastContainer);
    }

    toastContainer.insertAdjacentHTML("beforeend", toastHtml);

    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement, {
      delay: type === "error" ? 5000 : 3000,
    });
    toast.show();

    toastElement.addEventListener("hidden.bs.toast", () => {
      toastElement.remove();
    });
  }

  /**
   * @method getIconForType
   * @param {string} type - Il tipo di notifica.
   * @returns {string} La classe dell'icona Bootstrap.
   */
  getIconForType(type) {
    const icons = {
      success: "check-circle text-success",
      error: "exclamation-circle text-danger",
      warning: "exclamation-triangle text-warning",
      info: "info-circle text-primary",
    };
    return icons[type] || "info-circle text-primary";
  }

  // ======================
  // UTILITY METHODS
  // ======================

  showLoading() {
    let overlay = document.getElementById("loading-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "loading-overlay";
      overlay.className = "loading-overlay";
      overlay.innerHTML = `
        <div class="text-center">
          <div class="spinner-border text-cinema-gold mb-3" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-white">Loading...</p>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    overlay.classList.remove("d-none");
  }

  hideLoading() {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
      overlay.classList.add("d-none");
    }
  }

  /**
   * @method escapeHtml
   * @param {string} text - Il testo da sanificare.
   * @returns {string} Il testo sanificato.
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * @method escapeRegex
   * @param {string} text - La stringa da sanificare per regex.
   * @returns {string} La stringa sanificata.
   */
  escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  formatNumber(num) {
    return new Intl.NumberFormat("en-US").format(num);
  }

  truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  }

  debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }
}

// ===========================
// THEME MANAGER
// ===========================

/**
 * @class ThemeManager
 * @description Gestisce il cambio di tema tra light e dark mode.
 */
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("theme-toggle");
    this.themeText = document.getElementById("theme-text");
    this.init();
  }

  init() {
    this.loadTheme();

    if (this.themeToggle) {
      this.themeToggle.addEventListener("click", () => this.toggleTheme());
    }

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
          this.setTheme(e.matches ? "dark" : "light");
        }
      });
  }

  loadTheme() {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      this.setTheme(systemPrefersDark ? "dark" : "light");
    }
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    if (this.themeText) {
      this.themeText.textContent = theme === "light" ? "Dark" : "Light";
    }

    if (this.themeToggle) {
      this.themeToggle.setAttribute(
        "title",
        theme === "light" ? "Switch to dark mode" : "Switch to light mode",
      );
    }

    console.log(`🎨 Theme set to: ${theme}`);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    this.setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (this.themeToggle) {
      this.themeToggle.style.transform = "scale(0.95)";
      setTimeout(() => {
        this.themeToggle.style.transform = "";
      }, 150);
    }

    this.showThemeToast(newTheme);
  }

  showThemeToast(theme) {
    if (window.cinemaHub) {
      const icon = theme === "dark" ? "🌙" : "☀️";
      window.cinemaHub.showNotification(
        `${icon} Switched to ${theme} mode`,
        "info",
      );
    }
  }

  getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  forceTheme(theme) {
    this.setTheme(theme);
    localStorage.setItem("theme", theme);
  }
}

// =================================
// FUNZIONI GLOBALI
// =================================

window.showLoading = function () {
  if (window.cinemaHub) {
    window.cinemaHub.showLoading();
  }
};

window.hideLoading = function () {
  if (window.cinemaHub) {
    window.cinemaHub.hideLoading();
  }
};

window.showNotification = function (message, type = "info") {
  if (window.cinemaHub) {
    window.cinemaHub.showNotification(message, type);
  }
};

window.formatNumber = function (num) {
  if (window.cinemaHub) {
    return window.cinemaHub.formatNumber(num);
  }
  return num;
};

window.setTheme = function (theme) {
  if (window.cinemaHub) {
    window.cinemaHub.setTheme(theme);
  }
};

window.getCurrentTheme = function () {
  if (window.cinemaHub) {
    return window.cinemaHub.getCurrentTheme();
  }
  return "light";
};

window.joinRoom = function (roomName, userName) {
  if (window.cinemaHub) {
    window.cinemaHub.joinRoom(roomName, userName);
  }
};

window.createRoom = function (roomName, userName, topic = "") {
  if (window.cinemaHub) {
    window.cinemaHub.createRoom(roomName, userName, topic);
  }
};

window.sendMessage = function (roomName, userName, message) {
  if (window.cinemaHub) {
    window.cinemaHub.sendMessage(roomName, userName, message);
  }
};

// ======================
// INIZIALIZZAZIONE
// ======================

document.addEventListener("DOMContentLoaded", function () {
  window.cinemaHub = new CinemaHub();
  console.log("🎬 CinemaHub layout initialized");
});

window.addEventListener("beforeunload", function () {
  if (window.cinemaHub && window.cinemaHub.socket) {
    window.cinemaHub.socket.disconnect();
  }
});

window.addEventListener("online", function () {
  if (window.cinemaHub) {
    window.cinemaHub.showNotification("Connection restored", "success");
    if (window.cinemaHub.socket && !window.cinemaHub.socket.connected) {
      window.cinemaHub.socket.connect();
    }
  }
});

window.addEventListener("offline", function () {
  if (window.cinemaHub) {
    window.cinemaHub.showNotification("Connection lost", "warning");
  }
});

// CSS personalizzate
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .search-item.active {
    background-color: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
    transform: translateX(8px);
  }
  
  .search-item mark {
    background-color: var(--cinema-gold);
    color: #000;
    padding: 0.1em 0.2em;
    border-radius: 0.2em;
    font-weight: 600;
  }
  
  .theme-toggle:focus,
  .search-item:focus,
  #search-input:focus {
    outline: 2px solid var(--cinema-gold);
    outline-offset: 2px;
  }
`;
document.head.appendChild(style);
