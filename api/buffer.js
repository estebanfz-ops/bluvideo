// Vercel serverless proxy for Buffer API v1.
// Buffer blocks direct browser calls (CORS), so the frontend posts here
// and this function calls Buffer server-side.

const BUFFER_BASE = 'https://api.bufferapp.com/1';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, token, profile_ids, text } = req.body;

  if (!token) return res.status(400).json({ error: 'Missing token' });
  if (!action) return res.status(400).json({ error: 'Missing action' });

  try {
    if (action === 'profiles') {
      const r = await fetch(
        `${BUFFER_BASE}/profiles.json?access_token=${encodeURIComponent(token)}`
      );
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    if (action === 'push') {
      if (!text)        return res.status(400).json({ error: 'Missing text' });
      if (!profile_ids?.length) return res.status(400).json({ error: 'Missing profile_ids' });

      const params = new URLSearchParams({ access_token: token, text });
      profile_ids.forEach(id => params.append('profile_ids[]', id));

      const r = await fetch(`${BUFFER_BASE}/updates/create.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    return res.status(502).json({ error: 'Proxy error: ' + err.message });
  }
}
