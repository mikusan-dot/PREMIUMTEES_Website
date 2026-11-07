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
      res.status(500).json({ error: `${err.message}${hint}` });
    }
  },
};
