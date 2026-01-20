/**
 * Virtual Scroll Component
 *
 * Renders only visible rows for large datasets (12,500+ items)
 * Expected improvement: Constant memory usage regardless of trade count
 *
 * Requirements:
 * - Fixed row height (enforced by CSS)
 * - Container with overflow-y: auto
 * - Smooth scrolling with buffer zones
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('VirtualScroll');

export class VirtualScroll {
  /**
   * @param {HTMLElement} container - Scrollable container element
   * @param {Object} options - Configuration
   * @param {number} options.rowHeight - Fixed height of each row in pixels
   * @param {Function} options.renderRow - Function that renders a single row (item, index) => HTML string
   * @param {number} options.buffer - Number of extra rows to render above/below visible area (default: 5)
   * @param {number} options.threshold - Scroll threshold before re-render (default: 100px)
   */
  constructor(container, options) {
    if (!container) {
      throw new Error('VirtualScroll requires a container element');
    }

    this.container = container;
    this.rowHeight = options.rowHeight || 50;
    this.renderRow = options.renderRow;
    this.buffer = options.buffer || 5;
    this.threshold = options.threshold || 100;

    // Data
    this.data = [];
    this.visibleStartIndex = 0;
    this.visibleEndIndex = 0;

    // DOM elements
    this.viewport = null;
    this.spacerTop = null;
    this.spacerBottom = null;
    this.contentContainer = null;

    // Scroll state
    this.lastScrollTop = 0;
    this.ticking = false;

    // Initialize
    this._setupDOM();
    this._bindEvents();
  }

  /**
   * Set up DOM structure for virtual scrolling
   * @private
   */
  _setupDOM() {
    // Find or create tbody
    let tbody = this.container.querySelector('tbody');
    if (!tbody) {
      tbody = document.createElement('tbody');
      this.container.appendChild(tbody);
    }

    this.viewport = tbody;
    this.viewport.style.position = 'relative';

    // Create spacers for scroll height
    this.spacerTop = document.createElement('tr');
    this.spacerTop.className = 'virtual-scroll-spacer-top';
    this.spacerTop.style.height = '0px';

    this.spacerBottom = document.createElement('tr');
    this.spacerBottom.className = 'virtual-scroll-spacer-bottom';
    this.spacerBottom.style.height = '0px';

    // Create content container for visible rows
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'virtual-scroll-content';

    this.viewport.innerHTML = '';
    this.viewport.appendChild(this.spacerTop);
    this.viewport.appendChild(this.spacerBottom);
  }

  /**
   * Bind scroll events
   * @private
   */
  _bindEvents() {
    this.container.addEventListener('scroll', () => this._onScroll(), { passive: true });
  }

  /**
   * Handle scroll events with requestAnimationFrame
   * @private
   */
  _onScroll() {
    const scrollTop = this.container.scrollTop;

    // Only re-render if scrolled past threshold
    if (Math.abs(scrollTop - this.lastScrollTop) < this.threshold) {
      return;
    }

    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this._updateVisibleRange();
        this._render();
        this.lastScrollTop = scrollTop;
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  /**
   * Update which rows should be visible based on scroll position
   * @private
   */
  _updateVisibleRange() {
    if (this.data.length === 0) {
      this.visibleStartIndex = 0;
      this.visibleEndIndex = 0;
      return;
    }

    const scrollTop = this.container.scrollTop;
    const viewportHeight = this.container.clientHeight;

    // Calculate visible range with buffer
    const startIndex = Math.max(0, Math.floor(scrollTop / this.rowHeight) - this.buffer);
    const visibleCount = Math.ceil(viewportHeight / this.rowHeight) + this.buffer * 2;
    const endIndex = Math.min(this.data.length, startIndex + visibleCount);

    this.visibleStartIndex = startIndex;
    this.visibleEndIndex = endIndex;
  }

  /**
   * Render visible rows
   * @private
   */
  _render() {
    if (!this.renderRow || this.data.length === 0) {
      this.viewport.innerHTML = '<tr><td colspan="100%" style="text-align: center; padding: 40px;">No trades to display</td></tr>';
      return;
    }

    // Calculate spacer heights
    const topSpacerHeight = this.visibleStartIndex * this.rowHeight;
    const bottomSpacerHeight = (this.data.length - this.visibleEndIndex) * this.rowHeight;

    // Render visible rows
    const visibleRows = [];
    for (let i = this.visibleStartIndex; i < this.visibleEndIndex; i++) {
      const item = this.data[i];
      if (item) {
        visibleRows.push(this.renderRow(item, i));
      }
    }

    // Update DOM
    this.spacerTop.style.height = `${topSpacerHeight}px`;
    this.spacerBottom.style.height = `${bottomSpacerHeight}px`;

    // Render rows between spacers
    const rowsHTML = visibleRows.join('');
    this.viewport.innerHTML = `
      <tr class="virtual-scroll-spacer-top" style="height: ${topSpacerHeight}px;"><td></td></tr>
      ${rowsHTML}
      <tr class="virtual-scroll-spacer-bottom" style="height: ${bottomSpacerHeight}px;"><td></td></tr>
    `;

    logger.debug(`Rendered rows ${this.visibleStartIndex}-${this.visibleEndIndex} of ${this.data.length}`);
  }

  /**
   * Set data and trigger initial render
   * @param {Array} data - Array of items to render
   */
  setData(data) {
    this.data = data || [];
    this.lastScrollTop = 0;
    this.container.scrollTop = 0;
    this._updateVisibleRange();
    this._render();
  }

  /**
   * Get the current data
   * @returns {Array} Current data array
   */
  getData() {
    return this.data;
  }

  /**
   * Refresh the current view (re-render visible rows)
   */
  refresh() {
    this._updateVisibleRange();
    this._render();
  }

  /**
   * Scroll to a specific index
   * @param {number} index - Index to scroll to
   * @param {string} behavior - 'auto' or 'smooth'
   */
  scrollToIndex(index, behavior = 'smooth') {
    if (index < 0 || index >= this.data.length) {
      logger.warn(`Invalid scroll index: ${index}`);
      return;
    }

    const scrollTop = index * this.rowHeight;
    this.container.scrollTo({
      top: scrollTop,
      behavior
    });
  }

  /**
   * Get total content height
   * @returns {number} Total height in pixels
   */
  getTotalHeight() {
    return this.data.length * this.rowHeight;
  }

  /**
   * Destroy the virtual scroll instance
   */
  destroy() {
    this.container.removeEventListener('scroll', this._onScroll);
    this.data = [];
    this.viewport.innerHTML = '';
  }
}
