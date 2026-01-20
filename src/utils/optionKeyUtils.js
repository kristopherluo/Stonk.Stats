/**
 * Option Key Utilities
 * Standardizes option key generation and parsing across the codebase
 *
 * Standard Format: ticker_strike_expiration_type
 * Example: AAPL_150_2025-02-21_call
 */

/**
 * Generate standard option key for caching and lookups
 * @param {string} ticker - Stock ticker (e.g., 'AAPL')
 * @param {number} strike - Strike price (e.g., 150)
 * @param {string} expirationDate - Expiration date in YYYY-MM-DD format
 * @param {string} optionType - 'call' or 'put'
 * @returns {string} Standardized option key
 */
export function generateOptionKey(ticker, strike, expirationDate, optionType) {
  if (!ticker || strike == null || !expirationDate || !optionType) {
    throw new Error('All parameters are required for option key generation');
  }
  return `${ticker.toUpperCase()}_${strike}_${expirationDate}_${optionType.toLowerCase()}`;
}

/**
 * Parse option key back into components
 * @param {string} key - Option key to parse
 * @returns {Object} Object with ticker, strike, expirationDate, optionType
 */
export function parseOptionKey(key) {
  if (!key || typeof key !== 'string') {
    throw new Error('Valid option key string required');
  }

  const [ticker, strike, expirationDate, optionType] = key.split('_');

  if (!ticker || !strike || !expirationDate || !optionType) {
    throw new Error(`Invalid option key format: ${key}`);
  }

  return {
    ticker: ticker.toUpperCase(),
    strike: parseFloat(strike),
    expirationDate,
    optionType: optionType.toLowerCase()
  };
}

/**
 * Generate option key from trade object
 * @param {Object} trade - Trade object with ticker, strike, expirationDate, optionType
 * @returns {string} Standardized option key
 */
export function generateOptionKeyFromTrade(trade) {
  if (!trade) {
    throw new Error('Trade object required');
  }

  return generateOptionKey(
    trade.ticker,
    trade.strike,
    trade.expirationDate,
    trade.optionType
  );
}

/**
 * Check if a key is a valid option key format
 * @param {string} key - Key to validate
 * @returns {boolean} True if valid option key format
 */
export function isValidOptionKey(key) {
  if (!key || typeof key !== 'string') {
    return false;
  }

  const parts = key.split('_');
  if (parts.length !== 4) {
    return false;
  }

  const [ticker, strike, expirationDate, optionType] = parts;

  // Check ticker (non-empty string)
  if (!ticker || ticker.length === 0) {
    return false;
  }

  // Check strike (valid number)
  if (isNaN(parseFloat(strike))) {
    return false;
  }

  // Check expiration date (YYYY-MM-DD format)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expirationDate)) {
    return false;
  }

  // Check option type (call or put)
  if (!['call', 'put'].includes(optionType.toLowerCase())) {
    return false;
  }

  return true;
}

/**
 * Convert hyphen-format key to underscore-format key
 * Legacy format: ticker-expiration-type-strike
 * New format: ticker_strike_expiration_type
 * @param {string} hyphenKey - Hyphen-separated option key
 * @returns {string} Underscore-separated option key
 */
export function convertHyphenKeyToUnderscoreKey(hyphenKey) {
  if (!hyphenKey || typeof hyphenKey !== 'string') {
    throw new Error('Valid hyphen key string required');
  }

  const parts = hyphenKey.split('-');
  if (parts.length !== 4) {
    throw new Error(`Invalid hyphen key format: ${hyphenKey}`);
  }

  const [ticker, expirationDate, optionType, strike] = parts;
  return generateOptionKey(ticker, strike, expirationDate, optionType);
}
