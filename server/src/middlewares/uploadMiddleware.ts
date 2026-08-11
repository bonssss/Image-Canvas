import multer from 'multer';

// Use memory storage so we can upload a buffer directly to cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept image mimetypes or specific extensions (like HEIC which might not have an image/ mimetype on all OS)
    if (
      file.mimetype.startsWith('image/') || 
      file.mimetype === 'application/octet-stream' && file.originalname.match(/\.(heic|heif)$/i) ||
      file.originalname.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});
