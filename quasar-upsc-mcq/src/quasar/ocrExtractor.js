import Tesseract from 'tesseract.js'

/**
 * Extract text from an image using Tesseract.js
 * @param {File} imageFile - The image file to extract text from
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromImage(imageFile, onProgress = null) {
  if (!imageFile) throw new Error('No image file provided')

  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const imageData = reader.result

        const result = await Tesseract.recognize(imageData, 'eng', {
          logger: msg => {
            if (onProgress && msg.status === 'recognizing') {
              onProgress(Math.round(msg.progress * 100))
            }
          },
        })

        const extractedText = result.data.text
        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error('No text found in image')
        }

        resolve(extractedText)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read image file'))
    }

    reader.readAsDataURL(imageFile)
  })
}

/**
 * Split extracted text into paragraphs
 * Uses double newlines and other heuristics to identify paragraph boundaries
 * @param {string} text - The extracted text
 * @returns {Array<string>} Array of paragraphs
 */
export function splitIntoParagraphs(text) {
  if (!text || typeof text !== 'string') return []

  // Split on double newlines or multiple spaces followed by newlines
  let paragraphs = text
    .split(/\n\n+|\r\n\r\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)

  // If we only have one paragraph, try splitting on single newlines (for dense text)
  if (paragraphs.length === 1) {
    paragraphs = text
      .split(/\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 20) // Only keep substantial lines
  }

  // If still only one big chunk, split by sentences (heuristic)
  if (paragraphs.length === 1 && paragraphs[0].length > 500) {
    paragraphs = paragraphs[0]
      .split(/(?<=[.!?])\s+/)
      .map(p => p.trim())
      .filter(p => p.length > 0)

    // Group sentences into chunks of 2-3
    const grouped = []
    for (let i = 0; i < paragraphs.length; i += 2) {
      grouped.push(paragraphs.slice(i, i + 2).join(' '))
    }
    paragraphs = grouped
  }

  return paragraphs.length > 0 ? paragraphs : (text.trim().length > 0 ? [text] : [])
}

/**
 * Sanitize extracted text (remove artifacts from OCR)
 * @param {string} text - Raw extracted text
 * @returns {string} Sanitized text
 */
export function sanitizeExtractedText(text) {
  if (!text || typeof text !== 'string') return ''

  return text
    // Remove extra whitespace while preserving paragraph structure
    .replace(/\s+/g, ' ')
    .replace(/ \n/g, '\n')
    .replace(/\n /g, '\n')
    .trim()
}
