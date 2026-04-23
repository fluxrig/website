/**
 * Keyboard Navigation for fluxrig documentation
 * 
 * Supports:
 * - ArrowLeft: Navigate to previous page
 * - ArrowRight: Navigate to next page
 */

document.addEventListener('keydown', (e) => {
  // Ignore if user is typing in an input, textarea, or contenteditable
  if (
    e.target.tagName === 'INPUT' ||
    e.target.tagName === 'TEXTAREA' ||
    e.target.isContentEditable ||
    e.metaKey || e.ctrlKey || e.altKey || e.shiftKey
  ) {
    return;
  }

  // Handle Arrow keys
  if (e.key === 'ArrowLeft') {
    const prevLink = document.querySelector('.pagination-nav__link--prev');
    if (prevLink) {
      prevLink.click();
    }
  } else if (e.key === 'ArrowRight') {
    const nextLink = document.querySelector('.pagination-nav__link--next');
    if (nextLink) {
      nextLink.click();
    }
  }
});
