
export default async function handler(req, res) {
  // 1. Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. Parse target URL
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing "url" query parameter' });
  }

  try {
    const targetUrl = new URL(url);

    // 3. Security: Only allow requests to Replicate APIs
    const allowedHosts = ['api.replicate.com', 'replicate.com'];
    if (!allowedHosts.includes(targetUrl.hostname)) {
      return res.status(403).json({ error: 'Forbidden: Only Replicate API URLs are allowed.' });
    }

    // 4. Forward the request
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Authorization': req.headers.authorization, // Pass the client's API Key
        'Content-Type': req.headers['content-type'] || 'application/json',
        'User-Agent': 'Gemini-Music-Agent-Proxy'
      },
      // Only include body for non-GET/HEAD requests
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? JSON.stringify(req.body) : undefined,
    });

    // 5. Return the response
    const data = await response.text();
    
    // Propagate the status code and content type
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
