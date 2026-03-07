export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  if (req.method === 'POST') {
    return res.json({ 
      message: 'Test API working!',
      body: req.body,
      env: process.env.GROQ_API_KEY ? 'API key present' : 'API key missing'
    })
  }
  
  res.status(405).json({ error: 'Method not allowed' })
}
