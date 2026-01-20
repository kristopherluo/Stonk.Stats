/**
 * Application Constants
 * Central location for all magic numbers and repeated constants
 */

// Storage Limits
export const STORAGE_LIMITS = {
  EOD_CACHE_RETENTION_DAYS: 730,  // 2 years default retention
  EOD_CACHE_MAX_MB: 50,           // IndexedDB safe limit
  SUMMARY_CACHE_MAX_ITEMS: 30,   // Company summary cache size
  COMPANY_DATA_CACHE_DAYS: 30    // How long to cache company data
};

// Asset Types
export const ASSET_TYPES = {
  STOCK: 'stock',
  OPTIONS: 'options'
};

// Options Constants
export const OPTIONS_CONTRACT_MULTIPLIER = 100;  // 1 contract = 100 shares

// Trade Status
export const TRADE_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  TRIMMED: 'trimmed'
};

// Time Constants (in milliseconds)
export const TIME_CONSTANTS = {
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  THIRTY_DAYS_MS: 30 * 24 * 60 * 60 * 1000,
  FIVE_MINUTES_MS: 5 * 60 * 1000
};

// Storage Cache Keys
export const CACHE_KEYS = {
  EOD_CACHE: 'eodCache',
  PRICE_CACHE: 'riskCalcPriceCache',
  OPTIONS_PRICE_CACHE: 'optionsPriceCache',
  SUMMARY_CACHE: 'companySummaryCache',
  COMPANY_DATA_CACHE: 'companyDataCache',
  JOURNAL: 'riskCalcJournal',
  SETTINGS: 'riskCalcSettings',
  CASH_FLOW: 'riskCalcCashFlow'
};

// API Rate Limits
export const RATE_LIMITS = {
  POLYGON_FREE_TIER_CALLS_PER_MIN: 5,
  FINNHUB_FREE_TIER_CALLS_PER_MIN: 60,
  TWELVE_DATA_BATCH_SIZE: 8
};

// UI Constants
export const AUTO_REFRESH_INTERVAL_MS = 60000;  // 60 seconds
