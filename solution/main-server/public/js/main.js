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
    this.liveSearchAbortController = null;

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
    // Inizializza Socket.IO per aggiornare indicatori globali (footer, navbar)
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

    // Rimosso: gestione visibilità per socket
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
    // Annulla la richiesta precedente se ancora in volo
    try {
      if (this.liveSearchAbortController) {
        this.liveSearchAbortController.abort();
      }
    } catch (_) {}

    this.liveSearchAbortController = new AbortController();
    const signal = this.liveSearchAbortController.signal;
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
        signal,
      });

      const results = {
        query: query,
        movies: (response.data && response.data.suggestions) ? response.data.suggestions : [],
      };

      this.searchCache.set(query, results);
      this.displaySearchResults(results);
    } catch (error) {
      if (axios.isCancel?.(error) || error?.name === "CanceledError" || error?.name === "AbortError") {
        // richiesta annullata: non mostrare errori
        return;
      }
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
          <i class="bi bi-search fs-1 text-secondary mb-2"></i>
          <p class="text-secondary">No results found</p>
          <small class="text-secondary">Try different keywords or browse our collections</small>
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
    try {
      if (!window.io) return;
      this.socket = io();

      // Richiede subito il conteggio
      this.socket.emit("request_user_count");

      this.socket.on("user_count_update", (count) => {
        this.updateOnlineUsersCount(count || 0);
      });
    } catch (e) {
      console.warn("Socket init failed", e?.message || e);
    }
  }

  /**
   * @method startOnlineUsersPolling
   * @description Aggiorna periodicamente il numero di utenti online chiedendolo al server via HTTP.
   */
  startOnlineUsersPolling() {
    const update = async () => {
      try {
        const resp = await axios.get(`/api/health`);
        // Come fallback, se non abbiamo un endpoint specifico, manteniamo il valore corrente
        // In futuro si potrà sostituire con socket o endpoint dedicato.
      } catch (e) {}
    };
    // Se in futuro aggiungiamo un endpoint, potremo usarlo qui.
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
        const nextCount = count || 0;

        if (nextCount !== prevCount) {
          this.animateNumber(element, prevCount, nextCount, 600);
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
  handleVisibilityChange() {}

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

  /**
   * @method animateNumber
   * @param {HTMLElement} element
   * @param {number} from
   * @param {number} to
   * @param {number} duration
   */
  animateNumber(element, from, to, duration = 800) {
    const start = performance.now();
    const format = (n) => new Intl.NumberFormat("en-US").format(n);

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(from + (to - from) * eased);
      element.textContent = format(value);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
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
