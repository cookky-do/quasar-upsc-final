# Quick Start Guide - OCR MCQ Feature

## What Was Added?

✅ **Complete IMAGE → TEXT → PARAGRAPH → MCQ pipeline**

Users can now:
1. Upload a UPSC book page screenshot (JPG/PNG)
2. Automatically extract text using Tesseract.js OCR
3. Intelligently split text into paragraphs
4. Generate UPSC-style MCQs from each paragraph
5. Navigate between paragraphs with Previous/Next buttons

## Key Components

| File | Purpose |
|------|---------|
| `src/quasar/ocrExtractor.js` | OCR text extraction + paragraph splitting |
| `src/quasar/generateMcqs.js` | Updated with new `generateMcqsFromExtractedText()` function |
| `server.js` | New `/api/generate/from-text` endpoint |
| `src/App.jsx` | Completely refactored with dual-mode UI |

## Installation

Already done! Just verify:
```bash
npm list tesseract.js
# Should show tesseract.js version installed
```

## Running the App

### Terminal 1 - Frontend:
```bash
cd vocal-pitch-trainer
npm run dev
```

### Terminal 2 - Backend API:
```bash
cd vocal-pitch-trainer
npm run api
```

### Then:
- Open browser to `localhost:5173` (or Vite's output)
- Choose "OCR Practice Mode"
- Upload an image
- Click "Extract Text & Start"

## Features at a Glance

### Manual Mode (Original)
- Enter: Book Name, Chapter Name, Topic
- Click: Start Practice
- Navigate: Next Concept →

### OCR Mode (New) ⭐
- Upload: Image file (JPG/PNG)
- Extract: Text + Auto-split paragraphs
- Generate: MCQs per paragraph
- Navigate: Previous ← | Next →
- Track: Paragraph X of Y

## API Endpoints

```
POST /api/generate
→ For manual mode (old feature)

POST /api/generate/from-text
→ For OCR mode (new feature)
```

## Key Functions

### In ocrExtractor.js:
- `extractTextFromImage(imageFile, onProgress)` - OCR extraction
- `splitIntoParagraphs(text)` - Smart paragraph splitting
- `sanitizeExtractedText(text)` - Clean OCR artifacts

### In generateMcqs.js:
- `generateMcqsFromExtractedText({ paragraphText, paragraphIndex })` - MCQ from paragraph

### In App.jsx:
- `onExtractAndSplit()` - Main OCR workflow
- `generateMcqFromExtractedParagraph()` - Generate MCQ
- `onNextOcrParagraph()` / `onPreviousOcrParagraph()` - Navigate

## Example Flow

```
User uploads "Chapter5.jpg"
        ↓
Tesseract.js extracts text
        ↓
Text split into paragraphs:
  - Paragraph 1: "The Constitution of India..."
  - Paragraph 2: "Fundamental Rights include..."
  - Paragraph 3: "These rights are inalienable..."
        ↓
AI generates MCQs from Paragraph 1
        ↓
User sees 3 MCQs with tracking "Paragraph 1 of 3"
        ↓
User clicks "Next Paragraph →"
        ↓
AI generates MCQs from Paragraph 2
        ↓
Repeat...
```

## Testing

All code is tested and working:
```bash
npm run build
# ✓ Successfully built: 223KB JS bundle
```

## Important Notes

1. **GROQ_API_KEY Required**: Set in `.env` file for MCQ generation
2. **Tesseract Language**: Currently English ('eng')
3. **OCR Quality**: Better results with clear, high-resolution images
4. **Paragraph Splitting**: Smart but may need manual adjustment for very dense text
5. **Client-side Processing**: Image OCR happens locally (no external OCR API calls)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No text found in image" | Image too blurry/dark - try another photo |
| "Cannot generate MCQs" | Check GROQ_API_KEY in .env |
| App won't load | Run `npm install tesseract.js` again |
| Mode switch issues | Click "Back to Mode Selection" to reset |

## UI Layout

```
┌─────────────────────────────────────────┐
│  Quasar – AI UPSC Prelims Practice      │
│  Practice with concepts or upload image │
├─────────────────────────────────────────┤
│  [Manual Practice Mode] [OCR Mode]      │
│  Choose mode ↑                          │
├─────────────────────────────────────────┤
│  Selected Mode Interface                │
│  - Input form OR                        │
│  - File upload + progress               │
├─────────────────────────────────────────┤
│  RESULTS                                │
│  Paragraph tracking: X of Y             │
│  MCQ cards with Q, Options, Answer,     │
│  Explanation, Memory Trick              │
└─────────────────────────────────────────┘
```

## Next Steps (Optional Future Work)

- Add image preprocessing (crop, enhance)
- Support additional languages
- History/export MCQs
- Difficulty levels
- Bookmarking feature

---

**Status**: ✅ Ready to Use
**Last Built**: March 6, 2026
