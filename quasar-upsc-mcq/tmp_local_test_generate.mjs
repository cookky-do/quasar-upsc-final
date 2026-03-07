const url = 'http://localhost:8787/api/generate'

const payload = {
  bookName: 'Test Book',
  chapterName: 'Test Chapter',
  topic: 'Polity',
  paragraphNumber: 1,
}

try {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  console.log('STATUS', res.status)
  console.log(text)
} catch (e) {
  console.error('REQUEST FAILED:', e)
  process.exitCode = 1
}

