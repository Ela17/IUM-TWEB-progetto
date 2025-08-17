/**
 * @fileoverview Script principale per gestire l'interattività del layout di CinemaHub.
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
    console.log('🎬 Initializing CinemaHub...');
    
    this.setupEventListeners();
    this.initializeSearch();
    this.initializeSocket();
    this.initializeThemeManager();
    
    console.log('✅ CinemaHub initialized successfully');
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
    console.log('🎨 Theme manager initialized');
  }

  /**
   * @method getCurrentTheme
   * @returns {string} Il tema corrente ('light' o 'dark').
   * @description Ottiene il tema correntemente attivo.
   */
  getCurrentTheme() {
    return this.themeManager ? this.themeManager.getCurrentTheme() : 'light';
  }

  /**
   * @method setTheme
   * @param {string} theme - Il tema da applicare ('light' o 'dark').
   * @description Forza l'applicazione di un tema specifico.
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
   * Include la gestione della ricerca, lo scroll della navbar, e il cambio di visibilità della pagina.
   */
  setupEventListeners() {
    // invio del form di ricerca
    const searchForm = document.getElementById('quick-search');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.performQuickSearch();
      });
    }

    // input di ricerca in tempo reale
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearchInput(e.target.value);
      });

      // Nasconde risultati della ricerca quando si clicca fuori dall'area
      document.addEventListener('click', (e) => {
        const searchResults = document.getElementById('search-results');
        if (!searchInput.contains(e.target) && 
            (!searchResults || !searchResults.contains(e.target))) {
          this.hideSearchResults();
        }
      });

      // navigazione con tastiera nei risultati di ricerca
      searchInput.addEventListener('keydown', (e) => {
        this.handleSearchKeyNavigation(e);
      });
    }

    // Navbar scroll
    window.addEventListener('scroll', () => {
      this.handleNavbarScroll();
    });

    // cambio di visibilità della pagina
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // ridimensionamento della finestra
    window.addEventListener('resize', () => {
      this.handleWindowResize();
    });
  }

  // ==========================
  // SEARCH FUNCTIONALITY
  // ==========================

  /**
   * @method initializeSearch
   * @description Prepara la funzionalità di ricerca, inclusa l'inizializzazione della cache e dello storico.
   */
  initializeSearch() {
    this.searchCache = new Map();
    this.searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    this.selectedSearchIndex = -1;
  }

  /**
   * @method handleSearchInput
   * @param {string} query - La stringa di ricerca inserita dall'utente.
   * @description Gestisce l'input dell'utente con un debounce per evitare richieste API eccessive.
   * Avvia la ricerca live dopo 300ms di inattività.
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
   * @description Permette la navigazione nei risultati di ricerca tramite tasti freccia e Enter.
   */
  handleSearchKeyNavigation(e) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults || searchResults.classList.contains('d-none')) {
      return;
    }

    const items = searchResults.querySelectorAll('.search-item');
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedSearchIndex = Math.min(this.selectedSearchIndex + 1, items.length - 1);
        this.updateSearchSelection(items);
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        this.selectedSearchIndex = Math.max(this.selectedSearchIndex - 1, -1);
        this.updateSearchSelection(items);
        break;
      
      case 'Enter':
        if (this.selectedSearchIndex >= 0 && items[this.selectedSearchIndex]) {
          e.preventDefault();
          items[this.selectedSearchIndex].click();
        }
        break;
      
      case 'Escape':
        this.hideSearchResults();
        break;
    }
  }

  /**
   * @method updateSearchSelection
   * @param {NodeList} items - La lista degli elementi dei risultati di ricerca.
   * @description Aggiorna la selezione visuale degli elementi di ricerca durante la navigazione con la tastiera.
   */
  updateSearchSelection(items) {
    items.forEach((item, index) => {
      if (index === this.selectedSearchIndex) {
        item.classList.add('active');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * @async
   * @method performLiveSearch
   * @param {string} query - La stringa di ricerca.
   * @description Esegue una ricerca live asincrona, utilizzando la cache per evitare richieste ripetute.
   * Richiede l'API `/api/search` e visualizza i risultati.
   */
  async performLiveSearch(query) {
    // Prima constrolla in cache
    if (this.searchCache.has(query)) {
      this.displaySearchResults(this.searchCache.get(query));
      return;
    }

    try {
      this.showSearchLoading();
      
      const response = await axios.get(`/api/search`, {
        params: { 
          q: query, 
          limit: 5,
          include: 'movies,actors'
        },
        timeout: 5000
      });

      const results = response.data;
      this.searchCache.set(query, results);
      this.displaySearchResults(results);
      
    } catch (error) {
      console.error('Search error:', error);
      this.displaySearchError('Search failed. Please try again.');
    } finally {
      this.hideSearchLoading();
    }
  }

  /**
   * @async
   * @method performLiveSearch
   * @param {string} query - La stringa di ricerca.
   * @description Esegue una ricerca live asincrona, utilizzando la cache per evitare richieste ripetute.
   * Richiede l'API `/api/search` e visualizza i risultati.
   */
  performQuickSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (query) {
      this.addToSearchHistory(query);
      window.location.href = `/movies?search=${encodeURIComponent(query)}`;
    }
  }

  /**
   * @method displaySearchResults
   * @param {object} results - I risultati di ricerca contenenti array di film e attori.
   * @description Visualizza i risultati di ricerca nel dropdown.
   */
  displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    
    if (!results || (!results.movies?.length && !results.actors?.length)) {
      this.displaySearchEmpty();
      return;
    }

    // Reset
    this.selectedSearchIndex = -1;

    let html = '<div class="search-results-content">';

    // Sezione Film
    if (results.movies && results.movies.length > 0) {
      html += '<div class="search-category">';
      html += '<h6>Movies</h6>';
      results.movies.forEach((movie, index) => {
        html += `
          <a href="/movies/${movie.id}" class="search-item" data-index="${index}">
            <img src="${movie.poster_url || '/images/no-poster.jpg'}" 
                alt="${this.escapeHtml(movie.name)}" 
                class="search-item-image"
                onerror="this.src='/images/no-poster.jpg'">
            <div class="search-item-info">
              <h6>${this.highlightSearchTerm(movie.name, results.query)}</h6>
              <small>
                ${movie.year || 'Unknown year'} • 
                <i class="bi bi-star-fill text-cinema-gold"></i> ${movie.rating || 'N/A'}
                ${movie.duration ? ` • ${movie.duration}min` : ''}
              </small>
            </div>
          </a>
        `;
      });
      html += '</div>';
    }

    // Sezione Attori
    if (results.actors && results.actors.length > 0) {
      html += '<div class="search-category">';
      html += '<h6>Actors</h6>';
      results.actors.forEach((actor, index) => {
        html += `
          <a href="/actors/${encodeURIComponent(actor.name)}" class="search-item" data-index="${index + (results.movies?.length || 0)}">
            <div class="search-item-image bg-light d-flex align-items-center justify-content-center">
              <i class="bi bi-person fs-4 text-muted"></i>
            </div>
            <div class="search-item-info">
              <h6>${this.highlightSearchTerm(actor.name, results.query)}</h6>
              <small>
                ${actor.movie_count || 0} movies
                ${actor.popular_movies ? ` • Known for: ${actor.popular_movies.slice(0, 2).join(', ')}` : ''}
              </small>
            </div>
          </a>
        `;
      });
      html += '</div>';
    }

    html += '</div>';

    if (resultsContainer) {
      resultsContainer.innerHTML = html;
      this.showSearchResults();
    }
  }

  /**
   * @method displaySearchEmpty
   * @description Visualizza un messaggio quando la ricerca non produce risultati.
   */
  displaySearchEmpty() {
    const resultsContainer = document.getElementById('search-results');
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
   * @param {string} message - Il messaggio di errore da visualizzare.
   * @description Visualizza un messaggio di errore in caso di fallimento della ricerca.
   */
  displaySearchError(message) {
    const resultsContainer = document.getElementById('search-results');
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
   * @description Mostra un'indicazione di caricamento nei risultati di ricerca.
   */
  showSearchLoading() {
    const resultsContainer = document.getElementById('search-results');
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

  /**
   * @method hideSearchLoading
   * @description Nasconde l'indicazione di caricamento.
   */
  hideSearchLoading() {
    // Lo stato di caricamento verrà sostituito dai risultati o nascosto
  }

  /**
   * @method showSearchResults
   * @description Rende visibile il contenitore dei risultati di ricerca.
   */
  showSearchResults() {
    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
      resultsContainer.classList.remove('d-none');
    }
  }

  /**
   * @method hideSearchResults
   * @description Nasconde il contenitore dei risultati di ricerca.
   */
  hideSearchResults() {
    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
      resultsContainer.classList.add('d-none');
    }
    this.selectedSearchIndex = -1;
  }

  /**
   * @method highlightSearchTerm
   * @param {string} text - Il testo originale.
   * @param {string} term - Il termine da evidenziare.
   * @returns {string} Il testo con il termine di ricerca evidenziato con un tag `<mark>`.
   */
  highlightSearchTerm(text, term) {
    if (!term || !text) return this.escapeHtml(text);
    
    const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
    return this.escapeHtml(text).replace(regex, '<mark>$1</mark>');
  }

  /**
   * @method addToSearchHistory
   * @param {string} query - La query di ricerca da aggiungere allo storico.
   * @description Aggiunge una query allo storico delle ricerche, gestendo la duplicazione e il limite massimo.
   */
  addToSearchHistory(query) {
    this.searchHistory = this.searchHistory.filter(item => item !== query);
    this.searchHistory.unshift(query);
    this.searchHistory = this.searchHistory.slice(0, 10); // Keep only last 10
    localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
  }

  // ================
  // SOCKET.IO
  // ================

  /**
   * @method initializeSocket
   * @description Inizializza la connessione con Socket.IO e configura i listener per gli eventi in tempo reale.
   */
  initializeSocket() {
    if (typeof io === 'undefined') {
      console.warn('Socket.IO not loaded, chat features disabled');
      return;
    }

    try {
      this.socket = io({
        timeout: 5000,
        retries: 3
      });
      
      this.socket.on('connect', () => {
        console.log('✅ Connected to chat server');
        this.updateChatIndicator(true);
        this.showNotification('Connected to live chat', 'success');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from chat server:', reason);
        this.updateChatIndicator(false);
        
        if (reason === 'io server disconnect') {
          this.socket.connect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.updateChatIndicator(false);
      });

      this.socket.on('user_count_update', (count) => {
        this.updateOnlineUsersCount(count);
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
        this.showNotification('Chat connection error', 'error');
      });

      this.socket.on('notification', (data) => {
        this.showNotification(data.message, data.type || 'info');
      });

    } catch (error) {
      console.error('Socket initialization failed:', error);
    }
  }

  /**
   * @method updateChatIndicator
   * @param {boolean} connected - Stato della connessione.
   * @description Aggiorna l'indicatore visivo dello stato della connessione alla chat.
   */
  updateChatIndicator(connected) {
    const indicator = document.getElementById('chat-indicator');
    if (indicator) {
      if (connected) {
        indicator.classList.add('text-success');
        indicator.classList.remove('text-danger');
        indicator.title = 'Chat online';
      } else {
        indicator.classList.add('text-danger');
        indicator.classList.remove('text-success');
        indicator.title = 'Chat offline';
      }
    }
  }

  /**
   * @method updateOnlineUsersCount
   * @param {number} count - Il numero di utenti online.
   * @description Aggiorna il contatore degli utenti online con un'animazione.
   */
  updateOnlineUsersCount(count) {
    const counter = document.getElementById('online-users');
    if (counter) {
      const prevCount = parseInt(counter.textContent) || 0;
      counter.textContent = count || 0;
      
      if (count !== prevCount) {
        counter.style.animation = 'none';
        counter.offsetHeight;
        counter.style.animation = 'fadeIn 0.5s ease';
      }
    }
  }

  // ===================
  // INTERAZIONI UI
  // ===================

  /**
   * @method handleNavbarScroll
   * @description Gestisce l'effetto di scroll sulla navbar, applicando uno sfondo sfumato e un effetto di sfocatura.
   */
  handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    if (window.scrollY > 50) {
      navbar.classList.add('navbar-scrolled');
      navbar.style.backdropFilter = 'blur(15px)';
      
      const isDark = this.getCurrentTheme() === 'dark';
      navbar.style.backgroundColor = isDark 
        ? 'rgba(20, 20, 20, 0.95)' 
        : 'rgba(44, 62, 80, 0.95)';
    } else {
      navbar.classList.remove('navbar-scrolled');
      navbar.style.backdropFilter = 'blur(10px)';
      navbar.style.backgroundColor = '';
    }
  }

  /**
   * @method handleVisibilityChange
   * @description Gestisce gli eventi di visibilità della pagina (quando l'utente cambia tab).
   * Emette un segnale al server per indicare l'inattività o l'attività dell'utente.
   */
  handleVisibilityChange() {
    if (document.hidden) {
      // La pagina è nascosta - conserva risorse
      if (this.socket && this.socket.connected) {
        this.socket.emit('user_inactive');
      }
    } else {
      // La pagina è visibile - ripristina l'attività
      if (this.socket && this.socket.connected) {
        this.socket.emit('user_active');
      }
    }
  }

  /**
   * @method handleWindowResize
   * @description Gestisce il ridimensionamento della finestra per adattare la posizione dei risultati di ricerca su schermi mobile.
   */
  handleWindowResize() {
    const searchResults = document.getElementById('search-results');
    if (searchResults && !searchResults.classList.contains('d-none')) {
      if (window.innerWidth <= 768) {
        searchResults.style.position = 'fixed';
        searchResults.style.top = '70px';
        searchResults.style.left = '1rem';
        searchResults.style.right = '1rem';
      } else {
        searchResults.style.position = 'absolute';
        searchResults.style.top = '100%';
        searchResults.style.left = '0';
        searchResults.style.right = '0';
      }
    }
  }

  /**
   * @method showNotification
   * @param {string} message - Il messaggio della notifica.
   * @param {string} [type='info'] - Il tipo di notifica (success, error, warning, info).
   * @description Mostra una notifica all'utente tramite un toast di Bootstrap.
   */
  showNotification(message, type = 'info') {
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
    
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
      toastContainer.style.zIndex = '1055';
      document.body.appendChild(toastContainer);
    }
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Mostra il toast
    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement, {
      delay: type === 'error' ? 5000 : 3000
    });
    toast.show();
    
    // Rimuovi il toast dopo la visualizzazione
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  }

  /**
   * @method getIconForType
   * @param {string} type - Il tipo di notifica.
   * @returns {string} La classe dell'icona Bootstrap corrispondente.
   */
  getIconForType(type) {
    const icons = {
      'success': 'check-circle text-success',
      'error': 'exclamation-circle text-danger',
      'warning': 'exclamation-triangle text-warning',
      'info': 'info-circle text-primary'
    };
    return icons[type] || 'info-circle text-primary';
  }

  // ======================
  // UTILITY METHODS
  // ======================

  /**
   * @method showLoading
   * @description Mostra l'overlay di caricamento.
   */
  showLoading() {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
      // Crea l'overlay se non esiste
      overlay = document.createElement('div');
      overlay.id = 'loading-overlay';
      overlay.className = 'loading-overlay';
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
    overlay.classList.remove('d-none');
  }

  /**
   * @method hideLoading
   * @description Nasconde l'overlay di caricamento.
   */
  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('d-none');
    }
  }

  /**
   * @method escapeHtml
   * @param {string} text - Il testo da sanificare.
   * @returns {string} Il testo con i caratteri HTML speciali convertiti in entità.
   * @description Sanifica una stringa per prevenire attacchi XSS (Cross-Site Scripting).
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * @method escapeRegex
   * @param {string} text - La stringa da sanificare.
   * @returns {string} La stringa con i caratteri speciali di regex preceduti da un backslash.
   * @description Converte una stringa in un pattern regex sicuro.
   */
  escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * @method formatNumber
   * @param {number} num - Il numero da formattare.
   * @returns {string} Il numero formattato con separatori per le migliaia.
   */
  formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
  }

  /**
   * @method truncateText
   * @param {string} text - Il testo da troncare.
   * @param {number} [maxLength=100] - La lunghezza massima del testo.
   * @returns {string} Il testo troncato, con "..." alla fine se necessario.
   */
  truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * @method debounce
   * @param {Function} func - La funzione da ritardare.
   * @param {number} delay - Il ritardo in millisecondi.
   * @returns {Function} Una versione della funzione che esegue solo dopo un certo periodo di inattività.
   */
  debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * @method scrollToElement
   * @param {Element} element - L'elemento a cui scrollare.
   * @param {number} [offset=0] - L'offset aggiuntivo da applicare.
   * @description Esegue uno scroll animato verso un elemento specificato.
   */
  scrollToElement(element, offset = 0) {
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetTop = rect.top + scrollTop - offset;
    
    window.scrollTo({
      top: targetTop,
      behavior: 'smooth'
    });
  }

  /**
   * @method isInViewport
   * @param {Element} element - L'elemento da controllare.
   * @returns {boolean} `true` se l'elemento è visibile nel viewport, altrimenti `false`.
   */
  isInViewport(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
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
    this.themeToggle = document.getElementById('theme-toggle');
    this.themeText = document.getElementById('theme-text');
    this.init();
  }

  /**
   * @method init
   * @description Inizializza il theme manager.
   */
  init() {
    // Carica il tema salvato o usa la preferenza del sistema
    this.loadTheme();
    
    // Aggiungi event listener al toggle
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    // Ascolta i cambiamenti delle preferenze del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Solo se non c'è una preferenza salvata esplicitamente
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * @method loadTheme
   * @description Carica il tema salvato o applica la preferenza del sistema.
   */
  loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      // Usa il tema salvato
      this.setTheme(savedTheme);
    } else {
      // Usa la preferenza del sistema
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(systemPrefersDark ? 'dark' : 'light');
    }
  }

  /**
   * @method setTheme
   * @param {string} theme - Il tema da applicare ('light' o 'dark').
   * @description Applica il tema specificato all'interfaccia.
   */
  setTheme(theme) {
    // Applica il tema al documento
    document.documentElement.setAttribute('data-theme', theme);
    
    // Aggiorna il testo del button (opzionale)
    if (this.themeText) {
      this.themeText.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
    
    // Aggiorna il tooltip
    if (this.themeToggle) {
      this.themeToggle.setAttribute('title', 
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
    
    console.log(`🎨 Theme set to: ${theme}`);
  }

  /**
   * @method toggleTheme
   * @description Cambia il tema corrente tra light e dark.
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Applica il nuovo tema
    this.setTheme(newTheme);
    
    // Salva la preferenza
    localStorage.setItem('theme', newTheme);
    
    // Animazione di feedback
    if (this.themeToggle) {
      this.themeToggle.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.themeToggle.style.transform = '';
      }, 150);
    }
    
    // Toast di conferma (opzionale)
    this.showThemeToast(newTheme);
  }

  /**
   * @method showThemeToast
   * @param {string} theme - Il tema appena applicato.
   * @description Mostra un toast di conferma per il cambio tema.
   */
  showThemeToast(theme) {
    // Usa il sistema di notifiche globale se disponibile
    if (window.cinemaHub) {
      const icon = theme === 'dark' ? '🌙' : '☀️';
      window.cinemaHub.showNotification(
        `${icon} Switched to ${theme} mode`, 
        'info'
      );
    }
  }

  /**
   * @method getCurrentTheme
   * @returns {string} Il tema corrente ('light' o 'dark').
   * @description Ottiene il tema correntemente attivo.
   */
  getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  /**
   * @method forceTheme
   * @param {string} theme - Il tema da forzare.
   * @description Forza l'applicazione di un tema specifico e lo salva.
   */
  forceTheme(theme) {
    this.setTheme(theme);
    localStorage.setItem('theme', theme);
  }
}

// =================================
// FUNZIONI GLOBALI PER IL LAYOUT
// =================================

/**
 * @function showLoading
 * @description Funzione globale per mostrare l'overlay di caricamento.
 * Delega la chiamata all'istanza della classe `CinemaHub`.
 */
window.showLoading = function() {
  if (window.cinemaHub) {
    window.cinemaHub.showLoading();
  }
};

/**
 * @function hideLoading
 * @description Funzione globale per nascondere l'overlay di caricamento.
 * Delega la chiamata all'istanza della classe `CinemaHub`.
 */
window.hideLoading = function() {
  if (window.cinemaHub) {
    window.cinemaHub.hideLoading();
  }
};

/**
 * @function showNotification
 * @param {string} message - Il messaggio della notifica.
 * @param {string} [type='info'] - Il tipo di notifica.
 * @description Funzione globale per mostrare una notifica.
 * Delega la chiamata all'istanza della classe `CinemaHub`.
 */
window.showNotification = function(message, type = 'info') {
  if (window.cinemaHub) {
    window.cinemaHub.showNotification(message, type);
  }
};

/**
 * @function formatNumber
 * @param {number} num - Il numero da formattare.
 * @returns {string} Il numero formattato.
 * @description Funzione globale per formattare i numeri.
 * Delega la chiamata all'istanza della classe `CinemaHub`.
 */
window.formatNumber = function(num) {
  if (window.cinemaHub) {
    return window.cinemaHub.formatNumber(num);
  }
  return num;
};

window.setTheme = function(theme) {
  if (window.cinemaHub) {
    window.cinemaHub.setTheme(theme);
  }
};

window.getCurrentTheme = function() {
  if (window.cinemaHub) {
    return window.cinemaHub.getCurrentTheme();
  }
  return 'light';
};

// ======================
// INIZIALIZZAZIONE
// ======================

/**
 * @description Inizializza l'applicazione `CinemaHub` quando il DOM è completamente caricato.
 * L'istanza viene assegnata a `window.cinemaHub` per renderla accessibile globalmente.
 */
document.addEventListener('DOMContentLoaded', function() {
  window.cinemaHub = new CinemaHub();
  console.log('🎬 CinemaHub layout initialized');
});

/**
 * @description Gestisce l'evento di chiusura della pagina per disconnettere il socket in modo pulito.
 */
window.addEventListener('beforeunload', function() {
  if (window.cinemaHub && window.cinemaHub.socket) {
    window.cinemaHub.socket.disconnect();
  }
});

/**
 * @description Gestisce l'evento di ritorno della connessione a internet.
 * Mostra una notifica e tenta di riconnettere il socket.
 */
window.addEventListener('online', function() {
  if (window.cinemaHub) {
    window.cinemaHub.showNotification('Connection restored', 'success');
    if (window.cinemaHub.socket && !window.cinemaHub.socket.connected) {
      window.cinemaHub.socket.connect();
    }
  }
});

/**
 * @description Gestisce l'evento di perdita della connessione a internet.
 * Mostra una notifica all'utente.
 */
window.addEventListener('offline', function() {
  if (window.cinemaHub) {
    window.cinemaHub.showNotification('Connection lost', 'warning');
  }
});

/**
 * @description Aggiunge animazioni CSS personalizzate all'head del documento.
 */
const style = document.createElement('style');
style.textContent = `
  /* Animazioni base */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  /* Aggiorna gli stili esistenti per usare le CSS Custom Properties */
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
  
  /* Focus states migliorati per accessibilità */
  .theme-toggle:focus,
  .search-item:focus {
    outline: 2px solid var(--cinema-gold);
    outline-offset: 2px;
  }
`;
document.head.appendChild(style);