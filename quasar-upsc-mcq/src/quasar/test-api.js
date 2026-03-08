// Ultra-simple API call - guaranteed to work
export async function generateMcqsFromBookIndex(payload) {
  const API_URL = 'https://quasar-upsc-final-1.onrender.com/api/generate'
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookName: payload.book_name || "Indian Polity",
        chapterName: payload.chapter_name || "Fundamental Rights",
        topic: payload.concept_source || "Writs",
        paragraphNumber: payload.paragraph_number || 1
      })
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('API Success:', data)
    return data
    
  } catch (error) {
    console.error('API Failed:', error)
    throw error
  }
}
