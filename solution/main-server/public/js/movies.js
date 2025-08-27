/**
 * @fileoverview JavaScript specifico per la pagina catalogo film
 * @description Gestisce ricerca, filtri, collezioni e paginazione
 */

/**
 * @class MoviesController
 * @description Controlla tutta la logica della pagina catalogo film
 */
class MoviesController {
  constructor() {
    this.currentCollection = "top-rated";
    this.currentPage = 1;
    this.isLoading = false;

    // Configurazione delle collezioni con filtri
    this.collections = {
      "top-rated": {
        title: "Top Rated Movies",
        description: "Movies with rating 4+ stars",
        params: { min_rating: 4, limit: 24 },
      },
      "oscar-winners": {
        title: "Oscar Winners",
        description: "Movies that won at least one Academy Award",
        params: { oscar_winner: true, limit: 24 },
      },
      recent: {
        title: "Recent Releases",
        description: "Movies from 2025",
        params: { year_from: 2025, year_to: 2025, limit: 24 },
      },
      drama: {
        title: "Drama Movies",
        description: "Compelling dramatic storytelling",
        params: { genre: "Drama", min_rating: 3, limit: 24 },
      },
      comedy: {
        title: "Comedy Movies",
        description: "Laugh-out-loud comedies",
        params: { genre: "Comedy", min_rating: 3, limit: 24 },
      },
      action: {
        title: "Action Movies",
        description: "High-octane action and adventure films",
        params: { genre: "Action", min_rating: 3, limit: 24 },
      },
      horror: {
        title: "Horror Movies",
        description: "Spine-chilling horror films",
        params: { genre: "Horror", min_rating: 3, limit: 24 },
      },
      documentary: {
        title: "Documentary Films",
        description: "Real stories, real people",
        params: { genre: "Documentary", min_rating: 3, limit: 24 },
      },
      animation: {
        title: "Animation Movies",
        description: "Beautiful animated storytelling",
        params: { genre: "Animation", min_rating: 3, limit: 24 },
      },
      thriller: {
        title: "Thriller Movies",
        description: "Edge-of-your-seat suspense",
        params: { genre: "Thriller", min_rating: 3, limit: 24 },
      },
      custom: {
        title: "Custom Search",
        description: "Search with your own criteria",
        params: {},
      },
    };

    this.init();
  }

  /**
   * @method init
   * @description Inizializza il controller del catalogo film
   */
  init() {
    console.log("🎬 Initializing Movies Controller...");

    this.setupEventListeners();
    this.checkUrlParameters();
    this.loadCurrentCollection();

    console.log("✅ Movies Controller initialized successfully");
  }

  /**
   * @method setupEventListeners
   * @description Configura tutti gli event listeners
   */
  setupEventListeners() {
    // Collection filter buttons
    document.querySelectorAll(".collection-filter").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const collection = e.currentTarget.dataset.collection;
        this.switchCollection(collection);
      });
    });

    // Advanced search form
    const searchForm = document.getElementById("movie-search-form");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.performCustomSearch();
      });
    }

    // Clear filters button
    const clearBtn = document.getElementById("clear-filters");
    if (clearBtn) {
      clearBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.clearAllFilters();
      });
    }

    // Collapse icon toggle
    this.setupCollapseToggle();

    // Form field changes for real-time updates
    this.setupFormFieldListeners();
  }

  /**
   * @method setupCollapseToggle
   * @description Configura il toggle dell'icona collapse
   */
  setupCollapseToggle() {
    const collapseElement = document.getElementById("advancedSearchForm");
    const collapseIcon = document.getElementById("collapse-icon");

    if (collapseElement && collapseIcon) {
      collapseElement.addEventListener("show.bs.collapse", () => {
        collapseIcon.className = "bi bi-chevron-up";
      });
      collapseElement.addEventListener("hide.bs.collapse", () => {
        collapseIcon.className = "bi bi-chevron-down";
      });
    }
  }

  /**
   * @method setupFormFieldListeners
   * @description Configura listener per i campi del form
   */
  setupFormFieldListeners() {
    const formFields = document.querySelectorAll(
      "#movie-search-form input, #movie-search-form select",
    );

    formFields.forEach((field) => {
      field.addEventListener("change", () => {
        if (this.currentCollection === "custom") {
          // Debounce per evitare troppe richieste
          this.debounceCustomSearch();
        }
      });
    });
  }

  /**
   * @method debounceCustomSearch
   * @description Debounce per la ricerca personalizzata
   */
  debounceCustomSearch() {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.performCustomSearch();
    }, 800);
  }

  /**
   * @method checkUrlParameters
   * @description Controlla i parametri URL per ricerca automatica
   */
  checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get("search");

    if (searchQuery) {
      // Preimposta il campo di ricerca
      const titleInput = document.getElementById("search-title");
      if (titleInput) {
        titleInput.value = searchQuery;
      }

      // Attiva automaticamente la ricerca personalizzata
      this.switchCollection("custom");

      // Esegui la ricerca automaticamente dopo un breve delay
      setTimeout(() => {
        this.performCustomSearch();
      }, 500);
    }
  }

  /**
   * @method switchCollection
   * @param {string} collection - Nome della collezione
   */
  switchCollection(collection) {
    if (collection === this.currentCollection) return;

    // Aggiorna il bottone attivo
    this.updateActiveButton(collection);

    this.currentCollection = collection;
    this.currentPage = 1;

    // Mostra/nasconde campi di ricerca personalizzati
    this.toggleCustomSearchFields(collection === "custom");

    if (collection === "custom") {
      this.updateCollectionInfo();
      return;
    } else {
      this.clearFormFields();
    }

    this.updateCollectionInfo();
    this.loadCurrentCollection();
  }

  /**
   * @method updateActiveButton
   * @param {string} activeCollection - Collezione attiva
   */
  updateActiveButton(activeCollection) {
    document.querySelectorAll(".collection-filter").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.collection === activeCollection) {
        btn.classList.add("active");
      }
    });
  }

  /**
   * @method toggleCustomSearchFields
   * @param {boolean} show - Mostra/nasconde i campi personalizzati
   */
  toggleCustomSearchFields(show) {
    const customFields = document.getElementById("custom-search-fields");
    if (customFields) {
      if (show) {
        customFields.classList.remove("d-none");
      } else {
        customFields.classList.add("d-none");
      }
    }
  }

  /**
   * @method performCustomSearch
   * @description Esegue una ricerca personalizzata basata sui campi del form
   */
  performCustomSearch() {
    this.currentCollection = "custom";
    this.currentPage = 1;

    const formData = new FormData(document.getElementById("movie-search-form"));
    const customParams = {};

    // Raccogli parametri dal form
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.trim()) {
        customParams[key] = value.trim();
      }
    }

    // Gestione checkbox booleani (es. oscar_winner)
    const oscarCheckbox = document.getElementById("search-oscar-winner");
    if (oscarCheckbox && oscarCheckbox.checked) {
      customParams["oscar_winner"] = true;
    }

    // Set default limit if not specified
    if (!customParams.limit) {
      customParams.limit = 24;
    }

    // Update collection config
    this.collections["custom"].params = customParams;

    // Update title based on search criteria
    this.updateCustomSearchTitle(customParams);

    this.updateCollectionInfo();
    this.loadCurrentCollection();
  }

  /**
   * @method updateCustomSearchTitle
   * @param {Object} params - Parametri di ricerca
   */
  updateCustomSearchTitle(params) {
    let title = "Custom Search Results";
    let description = this.buildSearchDescription(params);

    if (params.title) {
      title = `Search: "${params.title}"`;
    } else if (params.genre) {
      title = `${params.genre} Movies`;
    }

    this.collections["custom"].title = title;
    this.collections["custom"].description = description;
  }

  /**
   * @method buildSearchDescription
   * @param {Object} params - Parametri di ricerca
   * @returns {string} Descrizione della ricerca
   */
  buildSearchDescription(params) {
    const parts = [];

    if (params.genre) parts.push(`Genre: ${params.genre}`);
    if (params.year_from && params.year_to) {
      parts.push(`Years: ${params.year_from}-${params.year_to}`);
    } else if (params.year_from) {
      parts.push(`From: ${params.year_from}`);
    } else if (params.year_to) {
      parts.push(`Until: ${params.year_to}`);
    }
    if (params.min_rating) parts.push(`Min rating: ${params.min_rating}+`);
    if (params.max_rating) parts.push(`Max rating: ${params.max_rating}`);
    if (params.oscar_winner === true || params.oscar_winner === "true")
      parts.push("Oscar winners only");

    return parts.length > 0 ? parts.join(" • ") : "Custom search criteria";
  }

  /**
   * @method clearAllFilters
   * @description Pulisce tutti i campi del form
   */
  clearAllFilters() {
    const form = document.getElementById("movie-search-form");
    const inputs = form.querySelectorAll(
      'input[type="text"], input[type="number"]',
    );
    const selects = form.querySelectorAll("select");
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');

    inputs.forEach((input) => {
      input.value = "";
      input.dispatchEvent(new Event("change"));
    });

    selects.forEach((select) => {
      select.selectedIndex = 0;
      select.dispatchEvent(new Event("change"));
    });

    checkboxes.forEach((cb) => {
      cb.checked = false;
      cb.dispatchEvent(new Event("change"));
    });

    // Reset to default limit
    document.getElementById("search-limit").value = "24";

    // Mostra notifica
    if (window.cinemaHub) {
      window.cinemaHub.showNotification("Filters cleared", "info");
    }
  }

  /**
   * @method clearFormFields
   * @description Pulisce i campi del form quando si cambia collezione
   */
  clearFormFields() {
    if (this.currentCollection !== "custom") {
      this.clearAllFilters();
    }
  }

  /**
   * @method updateCollectionInfo
   * @description Aggiorna le informazioni della collezione visualizzate
   */
  updateCollectionInfo() {
    const config = this.collections[this.currentCollection];
    const titleElement = document.getElementById("collection-title");
    const descriptionElement = document.getElementById(
      "collection-description",
    );

    if (titleElement) titleElement.textContent = config.title;
    if (descriptionElement) descriptionElement.textContent = config.description;
  }

  /**
   * @async
   * @method loadCurrentCollection
   * @param {number} [page=1] - Numero di pagina da caricare
   */
  async loadCurrentCollection(page = 1) {
    if (this.isLoading) return;

    this.currentPage = page;
    const config = this.collections[this.currentCollection];

    // Costruisci parametri per l'API
    const params = new URLSearchParams({
      ...config.params,
      page: page,
    });

    try {
      this.isLoading = true;
      this.showLoading();
      this.hideError();

      // Chiama l'API /api/movies/search
      const response = await fetch(`/api/movies/search?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();
      this.displayMovies(data);

      // Mostra notifica di successo
      if (window.cinemaHub) {
        window.cinemaHub.showNotification(
          `Loaded ${data.data?.length || 0} movies`,
          "success",
        );
      }
    } catch (error) {
      console.error("Error loading collection:", error);
      this.showError(error.message);

      // Mostra notifica di errore
      if (window.cinemaHub) {
        window.cinemaHub.showNotification("Failed to load movies", "error");
      }
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  /**
   * @method displayMovies
   * @param {Object} data - Dati dei film dall'API
   */
  displayMovies(data) {
    const container = document.getElementById("movies-container");

    if (!data.data || data.data.length === 0) {
      this.showNoResults();
      return;
    }

    // Update results info
    this.updateResultsInfo(data);

    // Create movies grid
    let html = '<div class="row g-4">';

    data.data.forEach((movie, index) => {
      html += this.createMovieCard(movie, index);
    });

    html += "</div>";
    container.innerHTML = html;

    // Anima le card con delay scaglionato
    this.animateMovieCards();

    // Show pagination if available
    if (data.pagination && data.pagination.totalPages > 1) {
      this.createPagination(data.pagination);
    } else {
      document.getElementById("pagination-container").innerHTML = "";
    }

    this.hideNoResults();
  }

  /**
   * @method createMovieCard
   * @param {Object} movie - Dati del film
   * @param {number} index - Indice della card
   * @returns {string} HTML della card
   */
  createMovieCard(movie, index) {
    const posterUrl = movie.poster_url || "/images/no-image.svg";
    const title = movie.name || movie.title || "Unknown Title";
    const year = (movie.year ?? movie.date) || "Unknown";
    const rawRating = movie.rating ?? movie.avg_rating ?? movie.averageRating;
    const rating =
      typeof rawRating === "number" && !isNaN(rawRating)
        ? Math.round(rawRating * 10) / 10
        : rawRating || "N/A";
    const duration = movie.duration ? ` • ${movie.duration}min` : "";
    const description = movie.description
      ? movie.description.length > 120
        ? movie.description.substring(0, 120) + "..."
        : movie.description
      : "";
    const genre = movie.genre || "";

    return `
      <div class="col-md-6 col-lg-4 col-xl-3" style="animation-delay: ${index * 0.1}s">
        <div class="card movie-card h-100 border-0 shadow-sm movie-card-animate">
          <div class="position-relative">
            <img src="${posterUrl}" alt="${this.escapeHtml(title)}" 
                 class="card-img-top" style="height: 350px; object-fit: cover;"
                 onerror="this.src='/images/no-image.svg'"
                 loading="lazy">
            <div class="movie-rating-badge position-absolute top-0 end-0 m-2 bg-dark text-white px-2 py-1 rounded">
              <i class="bi bi-star-fill text-warning me-1"></i>
              <span>${rating}</span>
            </div>
            ${genre ? `<div class="movie-genre-badge position-absolute bottom-0 start-0 m-2 bg-cinema-gold text-dark px-2 py-1 rounded-pill small fw-medium">${this.escapeHtml(genre)}</div>` : ""}
          </div>
          <div class="card-body d-flex flex-column">
            <h6 class="card-title mb-2 fw-bold">${this.escapeHtml(title)}</h6>
            <div class="text-muted small mb-2">
              <i class="bi bi-calendar3 me-1"></i>
              <span>${year}</span>${duration}
            </div>
            <p class="card-text small text-muted flex-grow-1 mb-3">${this.escapeHtml(description)}</p>
            <a href="/movies/${movie.id}" class="btn btn-outline-primary btn-sm mt-auto hover-lift">
              <i class="bi bi-eye me-1"></i>
              View Details
            </a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * @method animateMovieCards
   * @description Anima l'entrata delle card film
   */
  animateMovieCards() {
    const cards = document.querySelectorAll(".movie-card-animate");

    cards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(30px) scale(0.95)";

      setTimeout(() => {
        card.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        card.style.opacity = "1";
        card.style.transform = "translateY(0) scale(1)";

        // Rimuovi la classe dopo l'animazione
        setTimeout(() => {
          card.classList.remove("movie-card-animate");
        }, 600);
      }, index * 100);
    });
  }

  /**
   * @method createPagination
   * @param {Object} pagination - Dati paginazione
   */
  createPagination(pagination) {
    const container = document.getElementById("pagination-container");

    if (pagination.totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    let html =
      '<nav aria-label="Movie catalogue pagination"><ul class="pagination">';

    // Previous button
    const prevDisabled = pagination.currentPage === 1;
    html += `
      <li class="page-item ${prevDisabled ? "disabled" : ""}">
        <button class="page-link" ${prevDisabled ? "disabled" : ""} 
                onclick="window.moviesController.loadCurrentCollection(${pagination.currentPage - 1})"
                aria-label="Previous page">
          <i class="bi bi-chevron-left"></i>
        </button>
      </li>
    `;

    // Page numbers with intelligent grouping
    const { startPage, endPage } = this.calculatePageRange(
      pagination.currentPage,
      pagination.totalPages,
    );

    // First page if not in range
    if (startPage > 1) {
      html += `
        <li class="page-item">
          <button class="page-link" onclick="window.moviesController.loadCurrentCollection(1)">1</button>
        </li>
      `;
      if (startPage > 2) {
        html +=
          '<li class="page-item disabled"><span class="page-link">...</span></li>';
      }
    }

    // Page range
    for (let i = startPage; i <= endPage; i++) {
      const active = i === pagination.currentPage ? "active" : "";
      html += `
        <li class="page-item ${active}">
          <button class="page-link" onclick="window.moviesController.loadCurrentCollection(${i})"
                  ${active ? 'aria-current="page"' : ""}>${i}</button>
        </li>
      `;
    }

    // Last page if not in range
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        html +=
          '<li class="page-item disabled"><span class="page-link">...</span></li>';
      }
      html += `
        <li class="page-item">
          <button class="page-link" onclick="window.moviesController.loadCurrentCollection(${pagination.totalPages})">
            ${pagination.totalPages}
          </button>
        </li>
      `;
    }

    // Next button
    const nextDisabled = pagination.currentPage === pagination.totalPages;
    html += `
      <li class="page-item ${nextDisabled ? "disabled" : ""}">
        <button class="page-link" ${nextDisabled ? "disabled" : ""}
                onclick="window.moviesController.loadCurrentCollection(${pagination.currentPage + 1})"
                aria-label="Next page">
          <i class="bi bi-chevron-right"></i>
        </button>
      </li>
    `;

    html += "</ul></nav>";
    container.innerHTML = html;
  }

  /**
   * @method calculatePageRange
   * @param {number} currentPage - Pagina corrente
   * @param {number} totalPages - Totale pagine
   * @returns {Object} Range di pagine da mostrare
   */
  calculatePageRange(currentPage, totalPages) {
    const maxVisiblePages = 5;
    const halfRange = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, currentPage + halfRange);

    // Adjust if we're near the beginning
    if (currentPage <= halfRange) {
      endPage = Math.min(maxVisiblePages, totalPages);
    }

    // Adjust if we're near the end
    if (currentPage > totalPages - halfRange) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    return { startPage, endPage };
  }

  /**
   * @method updateResultsInfo
   * @param {Object} data - Dati dei risultati
   */
  updateResultsInfo(data) {
    const info = document.getElementById("results-info");
    if (!info) return;

    if (data.pagination) {
      const { currentPage, totalPages, totalResults } = data.pagination;
      info.textContent = `Page ${currentPage} of ${totalPages} • ${totalResults} movies`;
    } else if (data.movies) {
      info.textContent = `${data.movies.length} movies found`;
    }
  }

  /**
   * @method showLoading
   */
  showLoading() {
    const loadingState = document.getElementById("loading-state");
    if (loadingState) {
      loadingState.classList.remove("d-none");
    }

    const container = document.getElementById("movies-container");
    if (container) {
      container.innerHTML = "";
    }

    const paginationContainer = document.getElementById("pagination-container");
    if (paginationContainer) {
      paginationContainer.innerHTML = "";
    }
  }

  /**
   * @method hideLoading
   */
  hideLoading() {
    const loadingState = document.getElementById("loading-state");
    if (loadingState) {
      loadingState.classList.add("d-none");
    }
  }

  /**
   * @method showError
   * @param {string} message - Messaggio di errore
   */
  showError(message) {
    const errorDiv = document.getElementById("error-state");
    const errorMessage = document.getElementById("error-message");

    if (errorDiv && errorMessage) {
      errorMessage.textContent = message;
      errorDiv.classList.remove("d-none");
    }
  }

  /**
   * @method hideError
   */
  hideError() {
    const errorDiv = document.getElementById("error-state");
    if (errorDiv) {
      errorDiv.classList.add("d-none");
    }
  }

  /**
   * @method showNoResults
   */
  showNoResults() {
    const noResults = document.getElementById("no-results");
    if (noResults) {
      noResults.classList.remove("d-none");
    }

    const resultsInfo = document.getElementById("results-info");
    if (resultsInfo) {
      resultsInfo.textContent = "";
    }
  }

  /**
   * @method hideNoResults
   */
  hideNoResults() {
    const noResults = document.getElementById("no-results");
    if (noResults) {
      noResults.classList.add("d-none");
    }
  }

  /**
   * @method escapeHtml
   * @param {string} text - Testo da sanificare
   * @returns {string} Testo sanificato
   */
  escapeHtml(text) {
    if (!text) return "";

    if (window.cinemaHub && window.cinemaHub.escapeHtml) {
      return window.cinemaHub.escapeHtml(text);
    }

    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

window.loadCurrentCollection = function (page) {
  if (window.moviesController) {
    window.moviesController.loadCurrentCollection(page);
  }
};

document.addEventListener("DOMContentLoaded", function () {
  window.moviesController = new MoviesController();
  console.log("🎬 Movies Controller initialized");
});
