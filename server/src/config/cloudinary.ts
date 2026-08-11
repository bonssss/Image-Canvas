import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { config } from './env';

// Configuration
cloudinary.config({
  secure: true,
});

// Since the user is setting CLOUDINARY_URL in .env, cloudinary automatically picks it up from process.env.CLOUDINARY_URL

export const uploadToCloudinary = (fileBuffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If Cloudinary isn't configured, we'll throw a helpful error
    if (!process.env.CLOUDINARY_URL) {
      return reject(new Error('CLOUDINARY_URL environment variable is not set'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        if (result) return resolve(result.secure_url);
        reject(new Error('Unknown upload error'));
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};
