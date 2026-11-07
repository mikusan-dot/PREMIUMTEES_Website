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
        ? ` (Cloudinary refused the request. Check CLOUDINARY_CLOUD_NAME "${cloud}" has the right letters, and that the API key and secret belong to that same account.)`
        : '';
      res.status(500).json({ error: `${err.message}${hint}` });
    }
  },
};
