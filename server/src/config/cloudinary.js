import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  // trim: a stray space or newline pasted into Render breaks the signature
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
});

export const uploadToCloudinary = (buffer, folder = 'premium-tees/products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        // Plain image upload: no incoming transformation and no 'auto' type, which
        // some Cloudinary accounts block. Resize/optimise at delivery time instead
        // (add /c_limit,w_1000,q_auto,f_auto/ to the image URL).
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};
