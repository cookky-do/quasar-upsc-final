module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method === 'GET') {
    return res.json({ status: 'ok', message: 'API is working' })
  }
  
  if (req.method === 'POST') {
    return res.json({ 
      status: 'received',
      body: req.body,
      timestamp: new Date().toISOString()
    })
  }
  
  res.status(405).json({ error: 'Method not allowed' })
}
