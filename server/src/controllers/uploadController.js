import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import { uploadToCloudinary } from '../config/cloudinary.js';

export const uploadController = {
  uploadImage: async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const result = await uploadToCloudinary(req.file.buffer);
      res.json({ url: result.secure_url, publicId: result.public_id });
    } catch (err) {
      console.error('[upload] Cloudinary error:', { message: err.message, http_code: err.http_code, name: err.name });
      const cloud = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
      const hint = err.http_code === 403 || /status code - 40[13]/.test(err.message || '')
        ? ` (Cloudinary refused the request. Using cloud "${cloud}", API key ending ${(process.env.CLOUDINARY_API_KEY || '').trim().slice(-4) || 'MISSING'}, secret length ${(process.env.CLOUDINARY_API_SECRET || '').trim().length}. The key must be Active in Cloudinary and the secret must belong to that key.)`
        : '';
      // Ask Cloudinary's Admin API why: its error bodies are readable JSON.
      let diagnosis = '';
      try {
        await cloudinary.api.ping();
        diagnosis = ' Diagnosis: credentials are valid for the Admin API, so the upload itself is being blocked (check Settings -> Upload / Security in Cloudinary).';
      } catch (pingErr) {
        const detail = pingErr?.error?.message || pingErr?.message || 'unknown';
        diagnosis = ` Diagnosis from Cloudinary: ${detail}`;
      }
      // Raw test upload of a 1x1 pixel so we can read Cloudinary's actual response.
      let rawTest = '';
      try {
        const key = (process.env.CLOUDINARY_API_KEY || '').trim();
        const secret = (process.env.CLOUDINARY_API_SECRET || '').trim();
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = crypto.createHash('sha1').update(`timestamp=${timestamp}${secret}`).digest('hex');
        const body = new URLSearchParams({
          file: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
          api_key: key, timestamp: String(timestamp), signature,
        });
        const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body });
        const text = (await r.text()).replace(/\s+/g, ' ').slice(0, 200);
        rawTest = ` Raw test upload: HTTP ${r.status} ${text}`;
      } catch (rawErr) {
        rawTest = ` Raw test upload failed to run: ${rawErr.message}`;
      }
      res.status(500).json({ error: `${err.message}${hint}${diagnosis}${rawTest}` });
    }
  },
};
