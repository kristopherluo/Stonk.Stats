/**
 * Text Compression Utilities using LZ-String
 * Reduces storage size by 50-70% for text fields
 */

/**
 * Compress a string for localStorage storage
 * @param {string} text - Text to compress
 * @returns {string} Compressed string (or original if compression fails)
 */
export function compressText(text) {
  if (!text || typeof text !== 'string') return text;

  try {
    // Use compressToUTF16 for better compression + localStorage compatibility
    const compressed = LZString.compressToUTF16(text);

    // Only use compressed version if it's actually smaller
    // (short text might not compress well)
    if (compressed && compressed.length < text.length) {
      return compressed;
    }
    return text;
  } catch (error) {
    console.error('Compression error:', error);
    return text; // Return original on error
  }
}

/**
 * Decompress a string from localStorage
 * @param {string} text - Text to decompress (handles both compressed and uncompressed)
 * @returns {string} Decompressed string
 */
export function decompressText(text) {
  if (!text || typeof text !== 'string') return text;

  try {
    // Try to decompress - if it fails, it's likely uncompressed text
    const decompressed = LZString.decompressFromUTF16(text);

    // If decompression returns null, the text was never compressed
    if (decompressed === null) {
      return text;
    }

    return decompressed;
  } catch (error) {
    console.error('Decompression error:', error);
    return text; // Return original on error
  }
}

/**
 * Check if text is compressed
 * @param {string} text - Text to check
 * @returns {boolean} True if text appears to be compressed
 */
export function isCompressed(text) {
  if (!text || typeof text !== 'string') return false;

  try {
    const decompressed = LZString.decompressFromUTF16(text);
    // If decompression returns something, it was compressed
    return decompressed !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Compress a trade entry's notes field
 * @param {Object} trade - Trade entry object
 * @returns {Object} Trade with compressed notes
 */
export function compressTradeNotes(trade) {
  if (!trade || !trade.notes) return trade;

  return {
    ...trade,
    notes: compressText(trade.notes),
    notesCompressed: true // Flag to indicate compression
  };
}

/**
 * Decompress a trade entry's notes field
 * @param {Object} trade - Trade entry object
 * @returns {Object} Trade with decompressed notes
 */
export function decompressTradeNotes(trade) {
  if (!trade || !trade.notes) return trade;

  // If notes aren't marked as compressed, try to detect
  if (!trade.notesCompressed && !isCompressed(trade.notes)) {
    return trade; // Not compressed, return as-is
  }

  return {
    ...trade,
    notes: decompressText(trade.notes),
    notesCompressed: false
  };
}
