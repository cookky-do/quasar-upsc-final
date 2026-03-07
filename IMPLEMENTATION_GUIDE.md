# Quasar MCQ Generator - IMAGE → TEXT → PARAGRAPH → MCQ Feature

## Overview
Your UPSC MCQ generator has been upgraded with a complete IMAGE → TEXT → PARAGRAPH → MCQ workflow. Users can now upload book page screenshots and get instant paragraph-wise MCQ practice.

## ✨ New Features Implemented

### 1. **Image Upload Section**
- Users can upload JPG/PNG images of book pages
- File validation (only JPG/PNG accepted)
- Image preview feedback

### 2. **OCR Text Extraction (Tesseract.js)**
- **Client-side processing** for privacy (no data sent to external servers except Groq)
- Real-time progress tracking (0-100%)
- Automatic text sanitization (removes OCR artifacts)
- Error handling for low-quality images

### 3. **Intelligent Paragraph Splitting**
- Splits extracted text into logical paragraphs
- Smart algorithms handle:
  - Double newlines (natural paragraph breaks)
  - Dense single-line text (splits by sentences)
  - Very long blocks (groups sentences into chunks)
- Returns minimum context per paragraph (~50+ characters)

### 4. **Paragraph-wise MCQ Generation**
- Each paragraph gets its own set of 3 MCQs
- Uses the new `/api/generate/from-text` endpoint
- AI follows UPSC examiner guidelines:
  - Questions are conceptual (not trivial)
  - Focus on exam-oriented content
  - Use only paragraph context

### 5. **Paragraph Tracking & Navigation**
- Real-time display: "Question from Paragraph 1 of X"
- Forward navigation: "Next Paragraph →"
- Backward navigation: "← Previous" (go back to practice earlier paragraphs)
- Prevents navigation beyond available paragraphs

### 6. **Dual-Mode UI**
- **Manual Mode**: Original feature (Book Name → Chapter → Topic → MCQs)
- **OCR Mode**: New feature (Image Upload → Extract Text → Practice)
- Clean mode selection and reset functionality
- Users can switch between modes without App reload

---

## 🛠 Technical Implementation

### New Files Created:
1. **`src/quasar/ocrExtractor.js`** - OCR utility functions
   - `extractTextFromImage(imageFile, onProgress)` - Extracts text from image with progress tracking
   - `splitIntoParagraphs(text)` - Intelligently splits text into paragraphs
   - `sanitizeExtractedText(text)` - Cleans OCR artifacts from text

### Modified Files:

#### `server.js`
- ✅ New endpoint: `POST /api/generate/from-text`
- ✅ Accepts: `{ paragraphText, paragraphIndex }`
- ✅ Returns: JSON with 3 MCQs from extracted paragraph
- ✅ Maintains UPSC examiner prompt guidelines

#### `src/quasar/generateMcqs.js`
- ✅ New function: `generateMcqsFromExtractedText({ paragraphText, paragraphIndex })`
- ✅ Calls the new `/api/generate/from-text` endpoint
- ✅ Validates response with existing validation logic

#### `src/App.jsx`
- ✅ Complete refactor with dual-mode system
- ✅ OCR mode state management:
  - `selectedImage` - File object
  - `extractedParagraphs` - Array of paragraph strings
  - `currentParagraphIndex` - Current paragraph being practiced
  - `ocrProgress` - OCR extraction progress (0-100)
- ✅ Mode tracking: `null` (selection) | `'manual'` | `'ocr'`
- ✅ New functions:
  - `onImageSelected()` - Handles file selection
  - `onExtractAndSplit()` - Orchestrates OCR + paragraph splitting
  - `generateMcqFromExtractedParagraph()` - Generates MCQ for specific paragraph
  - `onNextOcrParagraph()` - Move to next paragraph
  - `onPreviousOcrParagraph()` - Move to previous paragraph
  - `onReset()` - Reset everything

### Dependencies Added:
```json
{
  "tesseract.js": "^5.x.x"
}
```

---

## 🎯 User Guide

### Mode: Manual Practice (Existing Feature)
1. Click "Choose This Mode" under "Manual Practice Mode"
2. Enter Book Name (required)
3. Enter Chapter Name (required)
4. Enter Topic (optional)
5. Click "Start Practice"
6. Click "Next Concept →" to move to next paragraph

### Mode: OCR Practice (New Feature) ⭐
1. Click "Choose This Mode" under "OCR Practice Mode"
2. Click file input to select a UPSC book page screenshot (JPG/PNG)
3. Click "Extract Text & Start" button
4. Wait for OCR processing (progress bar shows %)
5. View first MCQ from Paragraph 1
6. Use "Next Paragraph →" to move forward
7. Use "← Previous" to go back
8. Click "Back to Mode Selection" to reset

---

## 📋 API Endpoints

### 1. Manual Mode (Existing)
```bash
POST /api/generate
Content-Type: application/json

{
  "bookName": "Indian Polity",
  "chapterName": "Fundamental Rights",
  "topic": "Writs",
  "paragraphNumber": 1
}
```

### 2. OCR Mode (New) ⭐
```bash
POST /api/generate/from-text
Content-Type: application/json

{
  "paragraphText": "The text extracted from the image...",
  "paragraphIndex": 0
}
```

**Response** (same format for both):
```json
{
  "book_name": "UPSC Study Material",
  "chapter_name": "Extracted from Image",
  "concept_source": "Paragraph 1",
  "paragraph_number": 1,
  "questions": [
    {
      "question": "Which of the following...",
      "options": [
        "A. Option A",
        "B. Option B",
        "C. Option C",
        "D. Option D"
      ],
      "answer": "C",
      "explanation": "Detailed explanation...",
      "memory_trick": "Mnemonic or memory aid..."
    }
  ]
}
```

---

## 🚀 How to Run

### Development:
```bash
# Terminal 1: Start Vite dev server
cd vocal-pitch-trainer
npm run dev

# Terminal 2: Start Express API server
cd vocal-pitch-trainer
npm run api

# Access: http://localhost:5173 (or shown by Vite)
```

### Production:
```bash
npm run build
# dist/ folder ready for deployment
```

---

## ⚙️ Configuration

### Environment Variables (`.env`)
```
GROQ_API_KEY=your_groq_api_key_here
PORT=8787
```

### Tesseract.js Options
- **Language**: Currently set to `'eng'` (English)
- **Progress Tracking**: Enabled with callback function
- To modify, update `src/quasar/ocrExtractor.js`

---

## 🧪 Testing Checklist

- [x] Image upload accepts JPG/PNG only
- [x] OCR extraction shows progress bar
- [x] Text sanitization removes OCR artifacts
- [x] Paragraph splitting works for various text formats
- [x] MCQ generation works for each paragraph
- [x] Previous/Next navigation functions correctly
- [x] Manual mode still works as before
- [x] Mode switching doesn't lose state
- [x] Reset button clears everything
- [x] Error handling for bad images/failed generation
- [x] Build succeeds without errors

---

## 🎨 UI/UX Highlights

### OCR Mode Features:
- **Progress Indication**: Real-time OCR extraction percentage
- **Paragraph Counter**: Shows "Paragraph X of Y"
- **Bidirectional Navigation**: Previous/Next buttons
- **Visual Feedback**: "✓ Selected" indicator on file input
- **Error Messages**: Clear feedback on failures
- **Mode Selection**: Easy switching between Manual and OCR modes

### MCQ Display:
- Question text
- 4 options (A, B, C, D)
- Correct answer highlighted in green
- Detailed explanation
- Memory trick/mnemonic

---

## 📝 Example Workflow

1. **User Action**: Uploads photo of "Indian Polity - Fundamental Rights" page
2. **System Process**:
   - OCR extracts text from image
   - Text is split into 3 paragraphs
3. **Display**: "Paragraph 1 of 3"
4. **Generate**: 3 MCQs from Paragraph 1
5. **User Action**: Clicks "Next Paragraph →"
6. **Generate**: 3 MCQs from Paragraph 2
7. **User Action**: Clicks "← Previous"
8. **Display**: Back to Paragraph 1 MCQs
9. **User Action**: Clicks "Back to Mode Selection"
10. **Reset**: Ready to upload a new image or switch modes

---

## ⚠️ Limitations & Future Enhancements

### Current Limitations:
- OCR quality depends on image clarity (4MP+ recommended)
- Dense text may require manual paragraph splitting
- No built-in image preprocessing (crop, enhance contrast)
- Only English text supported

### Future Enhancements:
- [ ] Image preprocessing (auto-crop, contrast enhancement)
- [ ] Multiple language support (Hindi, etc.)
- [ ] Save/export MCQ history
- [ ] Difficulty level filtering
- [ ] User notes and bookmarking
- [ ] Analytics dashboard
- [ ] Server-side OCR option (async processing)

---

## 🐛 Troubleshooting

### OCR not extracting text?
- Ensure image is clear and high-quality
- Try different image formats (JPG vs PNG)
- Check browser console for errors

### MCQs not generating?
- Verify `GROQ_API_KEY` is set
- Check that extracted paragraph is substantial (50+ chars)
- Ensure Groq API has quota remaining

### Paragraph splitting looks odd?
- This is expected for OCR output
- Manual review may be needed for optimal results
- Very dense pages may need manual paragraph breaks

---

## 📞 Support

For issues or feature requests:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify Groq API status
4. Check `.env` configuration

---

**Version**: 1.0.0 - IMAGE → TEXT → PARAGRAPH → MCQ
**Status**: ✅ Production Ready
**Last Updated**: March 6, 2026
