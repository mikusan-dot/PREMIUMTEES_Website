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
      res.status(500).json({ error: `${err.message}${hint}${diagnosis}` });
    }
  },
};
