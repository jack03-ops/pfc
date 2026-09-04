import express from 'express';

const router = express.Router();

const BLOB_URL = 'https://5pqzjtksdbperly4.public.blob.vercel-storage.com/phoenix_sync.json';
const BLOB_API = 'https://blob.vercel-storage.com/phoenix_sync.json';

// GET /api/sync - Fetch centralized cloud database
router.get('/', async (req, res) => {
  try {
    const response = await fetch(`${BLOB_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      return res.status(200).json({ success: true, data: null });
    }
    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[Cloud Sync GET Error]', err.message);
    return res.status(200).json({ success: true, data: null, error: err.message });
  }
});

// POST /api/sync - Save centralized cloud database across all devices
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    const token = process.env.BLOB_READ_WRITE_TOKEN || 'vercel_blob_rw_5PqzjTKSDbPeRly4_AtikctcAhGDWbp4U86UIQ8rCPFeblz';
    
    const uploadRes = await fetch(BLOB_API, {
      method: 'PUT',
      headers: {
        'authorization': `Bearer ${token}`,
        'x-add-random-suffix': 'false',
        'x-content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('[Cloud Sync PUT Error]', errText);
      return res.status(500).json({ success: false, message: 'Cloud storage update failed', details: errText });
    }

    const result = await uploadRes.json();
    return res.status(200).json({ success: true, message: 'Cloud database synchronized successfully', url: result.url });
  } catch (err) {
    console.error('[Cloud Sync Save Error]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
