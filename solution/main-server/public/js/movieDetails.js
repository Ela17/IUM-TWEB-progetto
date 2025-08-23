/**
 * @fileoverview Script per la pagina di dettagli del film
 * @description Gestisce il caricamento e la visualizzazione dei dettagli completi di un film,
 * incluse le informazioni base, recensioni, cast, crew e statistiche.
 * 
 * Questo modulo si interfaccia con:
 * - API /api/movies/:id per i dettagli del film
 * - API /api/movies/:id/reviews per le recensioni
 * - API /api/movies/:id/reviews/stats per le statistiche
 */

/**
 * @class MovieDetailsPage
 * @description Gestisce tutta la logica della pagina dettagli film
 */
class MovieDetailsPage {
  constructor() {
    this.movieId = null;
    this.movieData = null;
    this.reviewsPage = 1;
    this.reviewsLoaded = false;
    
    this.init();
  }

  /**
   * @method init
   * @description Inizializza la pagina e carica i dettagli del film
   */
  init() {
    console.log('🎬 Initializing Movie Details Page...');
    
    this.movieId = this.getMovieIdFromUrl();
    if (this.movieId) {
      this.setupEventListeners();
      this.loadMovieDetails();
    } else {
      this.showError('Invalid movie ID provided');
    }
  }

  /**
   * @method setupEventListeners
   * @description Configura tutti gli event listeners della pagina
   */
  setupEventListeners() {
    // Load more reviews button
    const loadMoreBtn = document.getElementById('load-more-reviews');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.loadMoreReviews();
      });
    }

    // Start discussion button
    const discussionBtn = document.getElementById('start-discussion-btn');
    if (discussionBtn) {
      discussionBtn.addEventListener('click', () => {
        this.startDiscussion();
      });
    }

    // Share movie button
    const shareBtn = document.getElementById('share-movie-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        this.shareMovie();
      });
    }
  }

  /**
   * @method getMovieIdFromUrl
   * @description Estrae l'ID del film dall'URL corrente
   * @returns {string|null} L'ID del film o null se non valido
   */
  getMovieIdFromUrl() {
    const pathParts = window.location.pathname.split('/');
    const movieId = pathParts[pathParts.length - 1];
    
    // Validazione base
    if (!movieId || isNaN(parseInt(movieId))) {
      return null;
    }
    
    return movieId;
  }

  /**
   * @async
   * @method loadMovieDetails
   * @description Carica tutti i dettagli del film dall'API
   */
  async loadMovieDetails() {
    try {
      this.showLoading();
      
      const response = await fetch(`/api/movies/${this.movieId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      this.movieData = await response.json();
      this.displayMovieDetails();
      
      // Mostra notifica di successo
      if (window.cinemaHub) {
        window.cinemaHub.showNotification('Movie details loaded successfully', 'success');
      }
      
    } catch (error) {
      console.error('Error loading movie details:', error);
      this.showError(error.message);
      
      // Mostra notifica di errore
      if (window.cinemaHub) {
        window.cinemaHub.showNotification('Failed to load movie details', 'error');
      }
    } finally {
      this.hideLoading();
    }
  }

  /**
   * @method displayMovieDetails
   * @description Popola la pagina con i dati del film
   */
  displayMovieDetails() {
    if (!this.movieData || !this.movieData.movieDetails) {
      this.showError('Invalid movie data received');
      return;
    }

    const movie = this.movieData.movieDetails;
    
    // Aggiorna il titolo della pagina
    document.title = `${movie.name || 'Unknown Movie'} - CinemaHub`;
    
    // Informazioni base
    this.displayBasicInfo(movie);
    
    // Statistiche e recensioni
    if (this.movieData.reviewsStat) {
      this.displayStatistics(this.movieData.reviewsStat);
    }
    
    if (this.movieData.reviews) {
      this.displayReviews(this.movieData.reviews);
      this.reviewsLoaded = true;
    }
    
    // Cast e crew (se disponibili)
    if (movie.cast) {
      this.displayCast(movie.cast);
    }
    
    // Paesi e release info
    if (movie.countries) {
      this.displayCountries(movie.countries);
    }
    
    if (movie.releases) {
      this.displayReleases(movie.releases);
    }
  }

  /**
   * @method displayBasicInfo
   * @param {Object} movie - I dati base del film
   */
  displayBasicInfo(movie) {
    // Titolo e tagline
    this.updateElement('movie-title', movie.name || 'Unknown Title');
    this.updateElement('movie-tagline', movie.tagline || '');
    this.updateElement('movie-description', movie.description || 'No description available.');
    
    // Rating e meta info
    this.updateElement('movie-rating', movie.rating || 'N/A');
    this.updateElement('movie-year', movie.year || 'Unknown');
    this.updateElement('release-year', movie.year || 'N/A');
    
    // Durata
    const duration = movie.duration ? `${movie.duration} min` : '';
    this.updateElement('movie-duration', duration);
    
    // Genere (se disponibile)
    if (movie.genre) {
      const genreElement = document.getElementById('movie-genre');
      if (genreElement) {
        genreElement.textContent = movie.genre;
        genreElement.classList.remove('d-none');
      }
    }
    
    // Poster
    const poster = document.getElementById('movie-poster');
    if (poster) {
      poster.src = movie.poster_url || '/images/no-poster.jpg';
      poster.alt = `${movie.name || 'Movie'} poster`;
      
      // Aggiorna anche il backdrop se disponibile
      this.updateBackdrop(movie.poster_url);
    }
  }

  /**
   * @method displayStatistics
   * @param {Object} stats - Le statistiche delle recensioni
   */
  displayStatistics(stats) {
    this.updateElement('avg-rating', stats.averageRating || 'N/A');
    this.updateElement('total-reviews', stats.totalReviews || '0');
  }

  /**
   * @method displayReviews
   * @param {Array} reviews - Le recensioni del film
   */
  displayReviews(reviews) {
    const container = document.getElementById('reviews-container');
    if (!container) return;
    
    if (!reviews || reviews.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4">
          <i class="bi bi-chat-left-quote fs-1 text-muted mb-2"></i>
          <p class="text-muted">No reviews available for this movie yet.</p>
          <small class="text-muted">Be the first to share your thoughts!</small>
        </div>
      `;
      return;
    }

    let html = '';
    
    // Mostra solo le prime 3 recensioni inizialmente
    const reviewsToShow = reviews.slice(0, 3);
    
    reviewsToShow.forEach(review => {
      html += this.createReviewHtml(review);
    });
    
    container.innerHTML = html;
    
    // Mostra il bottone "Load More" se ci sono più recensioni
    if (reviews.length > 3) {
      const loadMoreBtn = document.getElementById('load-more-reviews');
      if (loadMoreBtn) {
        loadMoreBtn.classList.remove('d-none');
      }
    }
  }

  /**
   * @method createReviewHtml
   * @param {Object} review - Dati della recensione
   * @returns {string} HTML della recensione
   */
  createReviewHtml(review) {
    return `
      <div class="review-item">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 class="mb-1">${this.escapeHtml(review.critic_name || 'Anonymous Reviewer')}</h6>
            <small class="text-muted">
              ${review.publisher_name || 'Unknown Source'} • ${this.formatDate(review.review_date)}
            </small>
          </div>
          <div class="review-score">
            ${this.formatReviewScore(review.review_score)}
          </div>
        </div>
        <p class="mb-0">${this.truncateText(review.review_content || 'No review text available.', 250)}</p>
        ${review.review_type ? `<small class="badge bg-secondary mt-2">${review.review_type}</small>` : ''}
      </div>
    `;
  }

  /**
   * @method displayCast
   * @param {Array} cast - Lista del cast
   */
  displayCast(cast) {
    const container = document.getElementById('cast-container');
    if (!container || !cast || cast.length === 0) return;
    
    let html = '';
    
    // Mostra i primi 8 membri del cast
    cast.slice(0, 8).forEach(member => {
      html += `
        <div class="cast-member">
          <h6 class="mb-1">${this.escapeHtml(member.name)}</h6>
          <small class="text-muted">${this.escapeHtml(member.role || member.character || 'Unknown Role')}</small>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }

  /**
   * @method displayCountries
   * @param {Array} countries - Lista dei paesi
   */
  displayCountries(countries) {
    const container = document.getElementById('countries-container');
    if (!container || !countries || countries.length === 0) return;
    
    const countryList = countries.map(c => c.country || c).join(', ');
    container.innerHTML = `<p class="mb-0">${this.escapeHtml(countryList)}</p>`;
  }

  /**
   * @method displayReleases
   * @param {Array} releases - Informazioni sui rilasci
   */
  displayReleases(releases) {
    const container = document.getElementById('releases-container');
    if (!container || !releases || releases.length === 0) return;
    
    let html = '';
    releases.slice(0, 5).forEach(release => {
      html += `
        <div class="release-item mb-2">
          <div class="d-flex justify-content-between">
            <span>${this.escapeHtml(release.country || 'Unknown')}</span>
            <small class="text-muted">${this.formatDate(release.date)}</small>
          </div>
          <small class="text-muted">${release.type || ''} ${release.rating ? `• ${release.rating}` : ''}</small>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }

  /**
   * @async
   * @method loadMoreReviews
   * @description Carica più recensioni del film
   */
  async loadMoreReviews() {
    try {
      this.reviewsPage++;
      const response = await fetch(`/api/movies/${this.movieId}/reviews?page=${this.reviewsPage}`);
      
      if (!response.ok) {
        throw new Error('Failed to load more reviews');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const container = document.getElementById('reviews-container');
        data.forEach(review => {
          container.insertAdjacentHTML('beforeend', this.createReviewHtml(review));
        });
      } else {
        // Nascondi il bottone se non ci sono più recensioni
        const loadMoreBtn = document.getElementById('load-more-reviews');
        if (loadMoreBtn) {
          loadMoreBtn.style.display = 'none';
        }
        
        if (window.cinemaHub) {
          window.cinemaHub.showNotification('No more reviews available', 'info');
        }
      }
      
    } catch (error) {
      console.error('Error loading more reviews:', error);
      if (window.cinemaHub) {
        window.cinemaHub.showNotification('Failed to load more reviews', 'error');
      }
    }
  }

  /**
   * @method startDiscussion
   * @description Avvia una discussione sul film nella chat room ufficiale
   */
  startDiscussion() {
    if (!this.movieData || !this.movieData.movieDetails) {
      if (window.cinemaHub) {
        window.cinemaHub.showNotification('Movie data not loaded yet', 'warning');
      }
      return;
    }
    
    const movie = this.movieData.movieDetails;
    const movieId = this.movieId;
    const movieTitle = movie.name || 'Unknown Movie';
    const movieYear = movie.year || 'Unknown Year';

    let uniqueIdentifier;
    if (movieYear && movieYear !== 'Unknown Year') {
      uniqueIdentifier = movieYear;
    } else {
      uniqueIdentifier = movieId.slice(-4); // Usa le ultime 4 cifre dell'ID del film.
    }

    // Crea un nome di stanza user-friendly.
    // Sostituisce spazi e caratteri speciali con trattini.
    const sanitizedTitle = movieTitle.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-');
    const officialRoomName = `${sanitizedTitle}-${uniqueIdentifier}`;

    // Topic descrittivo per la room
    const roomTopic = `Official discussion for "${movieTitle}" (${movie.year || 'Unknown Year'})`;

    // Reindirizza alla chat room ufficiale del film
    const chatUrl = `/chat?room=${encodeURIComponent(officialRoomName)}&topic=${encodeURIComponent(roomTopic)}&movieId=${movieId}&autoJoin=true`;
    
    if (window.cinemaHub) {
      window.cinemaHub.showNotification(`Joining official discussion for ${movieTitle}...`, 'info');
    }
    
    window.location.href = chatUrl;
  }

  /**
   * @method shareMovie
   * @description Condivide il film (copia URL)
   */
  shareMovie() {
    if (navigator.share && this.movieData?.movieDetails) {
      const movie = this.movieData.movieDetails;
      navigator.share({
        title: movie.name || 'Movie on CinemaHub',
        text: `Check out "${movie.name}" on CinemaHub`,
        url: window.location.href
      }).catch(err => {
        console.log('Error sharing:', err);
        this.copyUrlToClipboard();
      });
    } else {
      this.copyUrlToClipboard();
    }
  }

  /**
   * @method copyUrlToClipboard
   * @description Copia l'URL della pagina negli appunti
   */
  copyUrlToClipboard() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        if (window.cinemaHub) {
          window.cinemaHub.showNotification('Movie URL copied to clipboard!', 'success');
        }
      }).catch(err => {
        console.error('Failed to copy URL:', err);
        this.fallbackCopyUrl();
      });
    } else {
      this.fallbackCopyUrl();
    }
  }

  /**
   * @method fallbackCopyUrl
   * @description Fallback per copiare URL (browser più vecchi)
   */
  fallbackCopyUrl() {
    const textArea = document.createElement('textarea');
    textArea.value = window.location.href;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      if (window.cinemaHub) {
        window.cinemaHub.showNotification('Movie URL copied to clipboard!', 'success');
      }
    } catch (err) {
      if (window.cinemaHub) {
        window.cinemaHub.showNotification('Failed to copy URL. Please copy manually.', 'error');
      }
    }
    
    document.body.removeChild(textArea);
  }

  /**
   * @method updateElement
   * @param {string} id - ID dell'elemento
   * @param {string} content - Contenuto da inserire
   */
  updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = content;
    }
  }

  /**
   * @method updateBackdrop
   * @param {string} imageUrl - URL dell'immagine di background
   */
  updateBackdrop(imageUrl) {
    if (imageUrl) {
      const backdrop = document.querySelector('.movie-backdrop');
      if (backdrop) {
        backdrop.style.backgroundImage = `url(${imageUrl})`;
        backdrop.style.opacity = '0.2';
      }
    }
  }

  /**
   * @method formatReviewScore
   * @param {string|number} score - Punteggio della recensione
   * @returns {string} HTML formattato per il punteggio
   */
  formatReviewScore(score) {
    if (!score || score === 'N/A') {
      return '<span class="badge bg-secondary">N/A</span>';
    }
    
    // Se è un numero, mostra come rating
    if (!isNaN(score)) {
      const numScore = parseFloat(score);
      if (numScore >= 4) {
        return `<span class="badge bg-success">${score}</span>`;
      } else if (numScore >= 3) {
        return `<span class="badge bg-warning">${score}</span>`;
      } else {
        return `<span class="badge bg-danger">${score}</span>`;
      }
    }
    
    // Se è testo (Fresh/Rotten, etc.)
    return `<span class="badge bg-cinema-gold text-dark">${score}</span>`;
  }

  /**
   * @method formatDate
   * @param {string} dateString - Data in formato stringa
   * @returns {string} Data formattata
   */
  formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Unknown date';
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
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * @method truncateText
   * @param {string} text - Testo da troncare
   * @param {number} maxLength - Lunghezza massima
   * @returns {string} Testo troncato
   */
  truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * @method showError
   * @param {string} message - Messaggio di errore
   */
  showError(message) {
    const errorDiv = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    
    if (errorDiv && errorMessage) {
      errorMessage.textContent = message;
      errorDiv.classList.remove('d-none');
    }
    
    // Nasconde il contenuto principale in caso di errore
    const heroSection = document.getElementById('movie-hero');
    if (heroSection) {
      heroSection.style.display = 'none';
    }
  }

  /**
   * @method showLoading
   * @description Mostra gli stati di caricamento
   */
  showLoading() {
    console.log('Loading movie details...');
  }

  /**
   * @method hideLoading
   * @description Nasconde gli stati di caricamento
   */
  hideLoading() {
    document.querySelectorAll('.spinner-border').forEach(spinner => {
      const parent = spinner.closest('.text-center');
      if (parent && parent.querySelector('.spinner-border')) {
        parent.remove();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  window.movieDetailsPage = new MovieDetailsPage();
  console.log('🎬 Movie Details Page initialized');
});