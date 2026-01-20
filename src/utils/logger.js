/**
 * Logging Infrastructure
 *
 * Provides structured logging with module-based context and configurable log levels.
 * Replaces console.log statements throughout the codebase for better debugging and production control.
 *
 * Usage:
 *   import { createLogger } from '../utils/logger.js';
 *   const logger = createLogger('ModuleName');
 *   logger.debug('Debug message', { data });
 *   logger.info('Info message');
 *   logger.warn('Warning message');
 *   logger.error('Error message', error);
 */

export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Default log level - can be changed via setGlobalLogLevel()
let globalLogLevel = LOG_LEVELS.INFO;

/**
 * Set global log level for all loggers
 * @param {number} level - Log level from LOG_LEVELS
 */
export function setGlobalLogLevel(level) {
  if (typeof level !== 'number' || level < 0 || level > 3) {
    console.error('Invalid log level. Must be a number between 0-3');
    return;
  }
  globalLogLevel = level;
}

/**
 * Get current global log level
 * @returns {number} Current log level
 */
export function getGlobalLogLevel() {
  return globalLogLevel;
}

/**
 * Logger class for module-based structured logging
 */
class Logger {
  constructor(moduleName) {
    this.moduleName = moduleName;
  }

  /**
   * Format log message with timestamp and module context
   * @private
   */
  _formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const levelStr = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level);
    return {
      timestamp,
      level: levelStr,
      module: this.moduleName,
      message,
      data: args
    };
  }

  /**
   * Output formatted log to console
   * @private
   */
  _output(level, consoleMethod, message, ...args) {
    if (level > globalLogLevel) {
      return; // Skip if below current log level
    }

    const formatted = this._formatMessage(level, message, ...args);

    // Output format: [timestamp] [LEVEL] [Module] message
    const prefix = `[${formatted.timestamp}] [${formatted.level}] [${formatted.module}]`;

    if (args.length > 0) {
      consoleMethod(prefix, message, ...args);
    } else {
      consoleMethod(prefix, message);
    }
  }

  /**
   * Log error message (always shown)
   * @param {string} message - Error message
   * @param {...any} args - Additional arguments to log
   */
  error(message, ...args) {
    this._output(LOG_LEVELS.ERROR, console.error, message, ...args);
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {...any} args - Additional arguments to log
   */
  warn(message, ...args) {
    this._output(LOG_LEVELS.WARN, console.warn, message, ...args);
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {...any} args - Additional arguments to log
   */
  info(message, ...args) {
    this._output(LOG_LEVELS.INFO, console.log, message, ...args);
  }

  /**
   * Log debug message (only shown when log level is DEBUG)
   * @param {string} message - Debug message
   * @param {...any} args - Additional arguments to log
   */
  debug(message, ...args) {
    this._output(LOG_LEVELS.DEBUG, console.log, message, ...args);
  }
}

/**
 * Create a logger instance for a specific module
 * @param {string} moduleName - Name of the module for context
 * @returns {Logger} Logger instance
 */
export function createLogger(moduleName) {
  if (!moduleName || typeof moduleName !== 'string') {
    throw new Error('Module name is required for logger creation');
  }
  return new Logger(moduleName);
}

// Export singleton for settings control
export const loggerSettings = {
  setLevel: setGlobalLogLevel,
  getLevel: getGlobalLogLevel,
  levels: LOG_LEVELS
};
