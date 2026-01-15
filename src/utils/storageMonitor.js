/**
 * Storage Monitor - Calculate and display IndexedDB usage
 */

import { storage } from './storage.js';

/**
 * Get total IndexedDB usage breakdown
 * @returns {Promise<Object>} Storage usage info
 */
export async function getStorageUsage() {
  try {
    // Get usage from IndexedDB via storage adapter
    const usage = await storage.getUsage();

    // Map IndexedDB keys to friendly names for UI
    const keyMapping = {
      'riskCalcJournal': 'journal',
      'riskCalcCashFlow': 'cashFlow',
      'eodCache': 'eodCache',
      'historicalPriceCache': 'historicalPriceCache',
      'riskCalcSettings': 'settings',
      'riskCalcJournalMeta': 'journalMeta',
      'companyDataCache': 'companyData',
      'chartDataCache': 'chartData',
      'riskCalcPriceCache': 'priceCache'
    };

    const breakdown = {
      journal: 0,
      cashFlow: 0,
      eodCache: 0,
      historicalPriceCache: 0,
      settings: 0,
      journalMeta: 0,
      companyData: 0,
      chartData: 0,
      priceCache: 0,
      other: 0
    };

    // Map raw breakdown to friendly names
    let totalTracked = 0;
    for (const [key, size] of Object.entries(usage.breakdown)) {
      const friendlyName = keyMapping[key];
      if (friendlyName) {
        breakdown[friendlyName] = size;
        totalTracked += size;
      }
    }

    // Calculate "other" (untracked keys)
    breakdown.other = Math.max(0, usage.totalSize - totalTracked);

    // IndexedDB limit is approximately 50-500MB (varies by browser)
    // We'll use 50MB as conservative estimate
    const limit = 50 * 1024 * 1024; // 50MB in bytes

    return {
      breakdown,
      totalUsed: usage.totalSize,
      limit,
      percentUsed: (usage.totalSize / limit) * 100,
      remainingBytes: limit - usage.totalSize,
      warningLevel: getWarningLevel(usage.totalSize, limit)
    };
  } catch (error) {
    console.error('[StorageMonitor] Error getting storage usage:', error);

    // Return safe defaults on error
    const limit = 50 * 1024 * 1024;
    return {
      breakdown: {
        journal: 0,
        cashFlow: 0,
        eodCache: 0,
        historicalPriceCache: 0,
        settings: 0,
        journalMeta: 0,
        companyData: 0,
        chartData: 0,
        priceCache: 0,
        other: 0
      },
      totalUsed: 0,
      limit,
      percentUsed: 0,
      remainingBytes: limit,
      warningLevel: 'safe'
    };
  }
}

/**
 * Get warning level based on usage
 * @param {number} used - Bytes used
 * @param {number} limit - Total limit
 * @returns {string} 'safe', 'warning', or 'critical'
 */
function getWarningLevel(used, limit) {
  const percent = (used / limit) * 100;
  if (percent >= 90) return 'critical';
  if (percent >= 80) return 'warning';
  return 'safe';
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get storage breakdown as percentage
 * @returns {Promise<Object>} Breakdown with percentages
 */
export async function getStorageBreakdownPercent() {
  const usage = await getStorageUsage();
  const breakdown = {};

  for (const key in usage.breakdown) {
    breakdown[key] = {
      bytes: usage.breakdown[key],
      formatted: formatBytes(usage.breakdown[key]),
      percent: (usage.breakdown[key] / usage.totalUsed) * 100
    };
  }

  return {
    breakdown,
    total: usage
  };
}
