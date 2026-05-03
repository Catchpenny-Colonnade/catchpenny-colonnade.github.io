/**
 * Typewriter Animation Engine
 * Handles character-by-character text animation for the MAZE game
 */

class TypewriterEngine {
  constructor(options = {}) {
    this.charDelay = options.charDelay || 40; // milliseconds per character
    this.isAnimating = false;
    this.canSkip = true;
    this.skipRequested = false;
  }

  /**
   * Animate text character by character
   * @param {string} text - Text to animate
   * @param {HTMLElement} container - Element to render text in
   * @param {Function} onComplete - Callback when animation completes
   * @returns {Promise} Resolves when animation completes or is skipped
   */
  async animateText(text, container, onComplete) {
    return new Promise((resolve) => {
      this.isAnimating = true;
      this.skipRequested = false;
      let charIndex = 0;
      let displayText = '';

      const renderChar = () => {
        if (this.skipRequested) {
          // Skip to end
          container.textContent = text;
          this.isAnimating = false;
          if (onComplete) onComplete();
          resolve();
          return;
        }

        if (charIndex < text.length) {
          displayText += text[charIndex];
          container.textContent = displayText;
          charIndex++;

          // Auto-scroll to bottom
          container.scrollTop = container.scrollHeight;

          setTimeout(renderChar, this.charDelay);
        } else {
          this.isAnimating = false;
          if (onComplete) onComplete();
          resolve();
        }
      };

      renderChar();
    });
  }

  /**
   * Request animation skip (on next update)
   */
  skipAnimation() {
    if (this.isAnimating) {
      this.skipRequested = true;
    }
  }

  /**
   * Check if currently animating
   */
  get animating() {
    return this.isAnimating;
  }
}

// Export for use in React components
window.TypewriterEngine = TypewriterEngine;
