/**
 * @fileoverview JavaScript specifico per la homepage di CinemaHub
 * @description Gestisce animazioni, contatori e interattività homepage
 */

/**
 * @class Homepage
 * @description Controlla tutta la logica specifica della homepage
 */
class Homepage {
  constructor() {
    this.statsAnimated = false;
    this.observerOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -50px 0px'
    };
    
    this.init();
  }

  /**
   * @method init
   * @description Inizializza tutti i componenti della homepage
   */
  init() {
    console.log('🏠 Initializing Homepage Controller...');
    
    this.setupIntersectionObserver();
    this.setupOnlineUsersCounter();
    this.setupHeroAnimations();
    this.setupFeatureCardAnimations();
    
    console.log('✅ Homepage Controller initialized successfully');
  }

  /**
   * @method setupIntersectionObserver
   * @description Configura l'observer per le animazioni on-scroll
   */
  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => this.handleIntersection(entries), 
        this.observerOptions
      );

      this.observeElements();
    }
  }

  /**
   * @method observeElements
   * @description Aggiunge gli elementi da osservare
   */
  observeElements() {
    // Stats cards per l'animazione counter
    const statCards = document.querySelectorAll('.stats-card .display-6');
    statCards.forEach(card => this.observer.observe(card));

    // Feature cards per l'animazione di entrata
    const featureCards = document.querySelectorAll('.movie-card');
    featureCards.forEach(card => this.observer.observe(card));

    // Section titles
    const sectionTitles = document.querySelectorAll('.display-5');
    sectionTitles.forEach(title => this.observer.observe(title));
  }

  /**
   * @method handleIntersection
   * @param {IntersectionObserverEntry[]} entries - Gli elementi intersecati
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.animateElement(entry.target);
      }
    });
  }

  /**
   * @method animateElement
   * @param {Element} element - L'elemento da animare
   */
  animateElement(element) {
    if (element.classList.contains('display-6')) {
      this.animateStatCounter(element);
    } else if (element.classList.contains('movie-card')) {
      this.animateFeatureCard(element);
    } else if (element.classList.contains('display-5')) {
      this.animateSectionTitle(element);
    }
  }

  /**
   * @method animateStatCounter
   * @param {Element} statElement - L'elemento del contatore
   */
  animateStatCounter(statElement) {
    if (statElement.dataset.animated === 'true') return;
    
    const finalValue = statElement.textContent.trim();
    const numericValue = this.extractNumericValue(finalValue);
    
    if (numericValue > 0) {
      statElement.dataset.animated = 'true';
      this.countUpAnimation(statElement, 0, numericValue, finalValue, 2000);
    }
  }

  /**
   * @method extractNumericValue
   * @param {string} text - Testo contenente il numero
   * @returns {number} Valore numerico estratto
   */
  extractNumericValue(text) {
    // Estrae numeri da stringhe come "940K+", "5.7M+", "10K+", etc.
    const match = text.match(/[\d.]+/);
    if (!match) return 0;
    
    const num = parseFloat(match[0]);
    if (text.includes('K')) return num * 1000;
    if (text.includes('M')) return num * 1000000;
    return num;
  }

  /**
   * @method countUpAnimation
   * @param {Element} element - Elemento da animare
   * @param {number} start - Valore iniziale
   * @param {number} end - Valore finale
   * @param {string} finalText - Testo finale con formattazione
   * @param {number} duration - Durata animazione in ms
   */
  countUpAnimation(element, start, end, finalText, duration) {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(start + (end - start) * easedProgress);
      
      element.textContent = this.formatStatValue(currentValue, finalText);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = finalText; // Assicura il valore finale
        element.style.animation = 'pulse 0.5s ease';
      }
    };
    
    requestAnimationFrame(animate);
  }

  /**
   * @method formatStatValue
   * @param {number} value - Valore numerico
   * @param {string} originalText - Testo originale per il formato
   * @returns {string} Valore formattato
   */
  formatStatValue(value, originalText) {
    if (originalText.includes('K')) {
      return (value / 1000).toFixed(0) + 'K+';
    }
    if (originalText.includes('M')) {
      return (value / 1000000).toFixed(1) + 'M+';
    }
    return value.toString();
  }

  /**
   * @method animateFeatureCard
   * @param {Element} card - Card da animare
   */
  animateFeatureCard(card) {
    if (card.dataset.animated === 'true') return;
    
    card.dataset.animated = 'true';
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    
    // Delay basato sull'indice per effetto cascata
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const index = cards.indexOf(card);
    const delay = index * 150;
    
    setTimeout(() => {
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, delay);
  }

  /**
   * @method animateSectionTitle
   * @param {Element} title - Titolo da animare
   */
  animateSectionTitle(title) {
    if (title.dataset.animated === 'true') return;
    
    title.dataset.animated = 'true';
    title.style.opacity = '0';
    title.style.transform = 'translateX(-30px)';
    
    setTimeout(() => {
      title.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      title.style.opacity = '1';
      title.style.transform = 'translateX(0)';
    }, 100);
  }

  /**
   * @method setupOnlineUsersCounter
   * @description Gestisce il contatore utenti online in tempo reale
   */
  setupOnlineUsersCounter() {
    const displayElement = document.getElementById('online-users-display');
    const footerElement = document.getElementById('online-users-footer');
    
    if (window.cinemaHub && window.cinemaHub.socket) {
      // Listener per aggiornamenti contatore utenti
      window.cinemaHub.socket.on('user_count_update', (count) => {
        this.updateOnlineUsersCount(count, displayElement);
        this.updateOnlineUsersCount(count, footerElement);
      });
      
      // Richiedi il conteggio corrente
      window.cinemaHub.socket.emit('request_user_count');
    }
  }

  /**
   * @method updateOnlineUsersCount
   * @param {number} newCount - Nuovo conteggio
   * @param {Element} element - Elemento da aggiornare
   */
  updateOnlineUsersCount(newCount, element) {
    if (!element) return;
    
    const currentCount = parseInt(element.textContent) || 0;
    
    if (newCount !== currentCount) {
      // Animazione di cambio valore
      element.style.transform = 'scale(0.8)';
      element.style.opacity = '0.5';
      
      setTimeout(() => {
        element.textContent = newCount;
        element.style.transform = 'scale(1.1)';
        element.style.opacity = '1';
        
        setTimeout(() => {
          element.style.transform = 'scale(1)';
        }, 200);
      }, 150);
    }
  }

  /**
   * @method setupHeroAnimations
   * @description Configura le animazioni per la sezione hero
   */
  setupHeroAnimations() {
    const heroTitle = document.querySelector('.hero-section .display-3');
    const heroSubtitle = document.querySelector('.hero-section .lead');
    const heroButtons = document.querySelectorAll('.hero-section .btn');
    
    if (heroTitle) {
      // Animazione typing effect per il titolo
      this.typeWriterEffect(heroTitle, 50);
    }
    
    if (heroSubtitle) {
      // Animazione fade-in per il sottotitolo
      setTimeout(() => {
        heroSubtitle.style.animation = 'fadeIn 1s ease forwards';
      }, 1000);
    }
    
    // Animazione staggered per i bottoni
    heroButtons.forEach((button, index) => {
      button.style.opacity = '0';
      button.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        button.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        button.style.opacity = '1';
        button.style.transform = 'translateY(0)';
      }, 1500 + (index * 200));
    });
  }

  /**
   * @method typeWriterEffect
   * @param {Element} element - Elemento per l'effetto typing
   * @param {number} speed - Velocità in ms
   */
  typeWriterEffect(element, speed = 100) {
    if (!element) return;
    
    const originalText = element.textContent;
    element.textContent = '';
    element.style.opacity = '1';
    
    let index = 0;
    const typeNextChar = () => {
      if (index < originalText.length) {
        element.textContent += originalText.charAt(index);
        index++;
        setTimeout(typeNextChar, speed);
      }
    };
    
    // Inizia dopo un piccolo delay
    setTimeout(typeNextChar, 300);
  }

  /**
   * @method setupFeatureCardAnimations
   * @description Configura animazioni hover per le feature cards
   */
  setupFeatureCardAnimations() {
    const featureCards = document.querySelectorAll('.movie-card');
    
    featureCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        const icon = card.querySelector('.feature-icon');
        if (icon) {
          icon.style.animation = 'bounce 0.6s ease';
        }
      });
      
      card.addEventListener('mouseleave', () => {
        const icon = card.querySelector('.feature-icon');
        if (icon) {
          icon.style.animation = 'none';
        }
      });
    });
  }

  /**
   * @method destroy
   * @description Pulizia degli observer e listener
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Inizializzazione al caricamento della pagina
document.addEventListener('DOMContentLoaded', function() {
  window.homepageController = new Homepage();
  console.log('🏠 Homepage Controller initialized');
});

// Cleanup al cambio pagina
window.addEventListener('beforeunload', function() {
  if (window.homepageController) {
    window.homepageController.destroy();
  }
});

// CSS per le animazioni aggiuntive
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.1) rotate(-5deg); }
    75% { transform: scale(1.1) rotate(5deg); }
  }
  
  .hero-section .display-3 {
    opacity: 0;
  }
  
  .movie-card {
    will-change: transform, opacity;
  }
  
  .stats-card .display-6 {
    font-variant-numeric: tabular-nums;
  }
`;
document.head.appendChild(additionalStyles);