export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const BLOB_URL = 'https://5pqzjtksdbperly4.public.blob.vercel-storage.com/phoenix_sync.json';
  const BLOB_API = 'https://blob.vercel-storage.com/phoenix_sync.json';
  const token = process.env.BLOB_READ_WRITE_TOKEN || 'vercel_blob_rw_5PqzjTKSDbPeRly4_AtikctcAhGDWbp4U86UIQ8rCPFeblz';

  if (req.method === 'GET') {
    try {
      const response = await fetch(`${BLOB_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) {
        return res.status(200).json({ success: true, data: null });
      }
      const data = await response.json();
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(200).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const payload = req.body;
      const uploadRes = await fetch(BLOB_API, {
        method: 'PUT',
        headers: {
          'authorization': `Bearer ${token}`,
          'x-add-random-suffix': 'false',
          'x-content-type': 'application/json'
        },
        body: typeof payload === 'string' ? payload : JSON.stringify(payload)
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        return res.status(500).json({ success: false, message: 'Blob update failed', details: errText });
      }

      const result = await uploadRes.json();
      return res.status(200).json({ success: true, url: result.url });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
