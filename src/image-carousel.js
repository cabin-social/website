/**
 * Image Carousel Module
 * Handles the interactive image carousel with navigation and active card display
 */

// Configuration constants
const CAROUSEL_CONFIG = {
    CARD_WIDTH: 344,
    CARD_GAP: 24,
    OPACITY_DELAY_MULTIPLIER: 50,
    TRANSITION_DURATION: 500,
    FADE_DURATION: 100,
    BUTTON_TRANSITION: '0.3s ease',
    CAROUSEL_EASING: 'ease-out',
    DISABLED_OPACITY: 0.4,
    INACTIVE_OPACITY: 0.5,
    ACTIVE_OPACITY: 1
};

// State management
const carouselState = {
    currentIndex: 0,
    isAnimating: false
};

// DOM element cache
let elements = {};

/**
 * Initialize DOM element references
 */
function cacheElements() {
    elements = {
        imageGrid: document.getElementById('image-grid'),
        prevBtn: document.getElementById('prev-btn'),
        nextBtn: document.getElementById('next-btn'),
        activeDisplay: document.getElementById('active-card-display'),
        cards: document.querySelectorAll('[data-index]')
    };
}

/**
 * Validate that all required DOM elements exist
 */
function validateElements() {
    const requiredElements = ['imageGrid', 'prevBtn', 'nextBtn', 'activeDisplay'];
    const missingElements = requiredElements.filter(key => !elements[key]);
    
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        return false;
    }
    
    if (elements.cards.length === 0) {
        console.error('No carousel cards found');
        return false;
    }
    
    return true;
}

/**
 * Update the opacity of carousel cards with staggered animation
 */
function updateCardOpacity() {
    elements.cards.forEach((card, index) => {
        const delay = Math.abs(index - carouselState.currentIndex) * CAROUSEL_CONFIG.OPACITY_DELAY_MULTIPLIER;
        card.style.transitionDelay = `${delay}ms`;
        card.style.opacity = index === carouselState.currentIndex 
            ? CAROUSEL_CONFIG.ACTIVE_OPACITY 
            : CAROUSEL_CONFIG.INACTIVE_OPACITY;
    });
}

/**
 * Update the active card display with fade effect
 */
function updateActiveDisplay() {
    const activeCard = elements.cards[carouselState.currentIndex];
    
    elements.activeDisplay.style.opacity = '0';
    
    setTimeout(() => {
        elements.activeDisplay.style.backgroundImage = activeCard.style.backgroundImage;
        elements.activeDisplay.innerHTML = activeCard.innerHTML;
        elements.activeDisplay.style.transition = `opacity ${CAROUSEL_CONFIG.FADE_DURATION / 100}s ease-in-out`;
        elements.activeDisplay.style.opacity = CAROUSEL_CONFIG.ACTIVE_OPACITY;
    }, CAROUSEL_CONFIG.FADE_DURATION);
}

/**
 * Update navigation button states
 */
function updateButtonStates() {
    const { currentIndex } = carouselState;
    const maxIndex = elements.cards.length - 1;
    
    // Previous button
    const isPrevDisabled = currentIndex === 0;
    elements.prevBtn.style.transition = CAROUSEL_CONFIG.BUTTON_TRANSITION;
    elements.prevBtn.style.opacity = isPrevDisabled ? CAROUSEL_CONFIG.DISABLED_OPACITY : CAROUSEL_CONFIG.ACTIVE_OPACITY;
    elements.prevBtn.style.cursor = isPrevDisabled ? 'not-allowed' : 'pointer';
    elements.prevBtn.disabled = isPrevDisabled;
    
    // Next button
    const isNextDisabled = currentIndex === maxIndex;
    elements.nextBtn.style.transition = CAROUSEL_CONFIG.BUTTON_TRANSITION;
    elements.nextBtn.style.opacity = isNextDisabled ? CAROUSEL_CONFIG.INACTIVE_OPACITY : CAROUSEL_CONFIG.ACTIVE_OPACITY;
    elements.nextBtn.style.cursor = isNextDisabled ? 'not-allowed' : 'pointer';
    elements.nextBtn.disabled = isNextDisabled;
}

/**
 * Shift the carousel to show the current card
 */
function updateCarouselPosition() {
    const firstCard = elements.cards[0];
    const cardWidth = firstCard.offsetWidth + CAROUSEL_CONFIG.CARD_GAP;
    const offset = -carouselState.currentIndex * cardWidth;

    elements.imageGrid.style.transition = `transform ${CAROUSEL_CONFIG.TRANSITION_DURATION / 1000}s ${CAROUSEL_CONFIG.CAROUSEL_EASING}`;
    elements.imageGrid.style.transform = `translateX(${offset}px)`;
}

/**
 * Main update function - orchestrates all UI updates
 */
function updateCarousel() {
    if (carouselState.isAnimating) return;
    
    carouselState.isAnimating = true;
    
    updateCardOpacity();
    updateActiveDisplay();
    updateButtonStates();
    updateCarouselPosition();
    
    setTimeout(() => {
        carouselState.isAnimating = false;
    }, CAROUSEL_CONFIG.TRANSITION_DURATION);
}

/**
 * Navigate to previous card
 */
function navigatePrevious() {
    if (carouselState.currentIndex > 0) {
        carouselState.currentIndex--;
        updateCarousel();
    }
}

/**
 * Navigate to next card
 */
function navigateNext() {
    if (carouselState.currentIndex < elements.cards.length - 1) {
        carouselState.currentIndex++;
        updateCarousel();
    }
}

/**
 * Navigate to specific card by index
 */
function navigateToCard(index) {
    if (index >= 0 && index < elements.cards.length && carouselState.currentIndex !== index) {
        carouselState.currentIndex = index;
        updateCarousel();
    }
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
    elements.prevBtn.addEventListener('click', navigatePrevious);
    elements.nextBtn.addEventListener('click', navigateNext);
    
    elements.cards.forEach((card, index) => {
        card.addEventListener('click', () => navigateToCard(index));
    });
}

/**
 * Initialize the carousel
 */
function initCarousel() {
    cacheElements();
    
    if (!validateElements()) {
        return;
    }
    
    attachEventListeners();
    updateCarousel();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCarousel);
