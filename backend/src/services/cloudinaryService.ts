import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'mock_cloud';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export class CloudinaryService {
  async uploadFile(fileBuffer: Buffer, mimetype: string, originalname?: string): Promise<string> {
    if (!isCloudinaryConfigured) {
      try {
        const uploadDir = path.join(__dirname, '../../public/uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Determine extension
        let ext = '';
        if (originalname) {
          ext = path.extname(originalname);
        } else {
          if (mimetype.startsWith('image/')) {
            ext = mimetype.split('/')[1] === 'jpeg' ? '.jpg' : '.' + mimetype.split('/')[1];
          } else if (mimetype === 'application/pdf') {
            ext = '.pdf';
          } else if (mimetype.startsWith('video/')) {
            ext = '.' + mimetype.split('/')[1];
          }
        }

        const cleanName = originalname 
          ? path.basename(originalname, ext).replace(/[^a-zA-Z0-9]/g, '_')
          : `file_${Math.round(Math.random() * 1e9)}`;
          
        const fileName = `${Date.now()}_${cleanName}${ext}`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, fileBuffer);

        const port = process.env.PORT || 5000;
        return `http://localhost:${port}/uploads/${fileName}`;
      } catch (err) {
        console.error('Local upload failed, falling back to mock link: ', err);
        // Fallback to mock assets if file writing fails
        if (mimetype.startsWith('image/')) {
          return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600';
        }
        if (mimetype === 'application/pdf') {
          return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        }
        if (mimetype.startsWith('video/')) {
          return 'https://res.cloudinary.com/demo/video/upload/sample.mp4';
        }
        return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600';
      }
    }

    return new Promise((resolve, reject) => {
      let folder = 'lms_assets';
      let resource_type: 'auto' | 'image' | 'video' | 'raw' = 'auto';

      if (mimetype.startsWith('video/')) {
        resource_type = 'video';
      } else if (mimetype === 'application/pdf') {
        resource_type = 'raw';
      }

      cloudinary.uploader.upload_stream(
        { folder, resource_type },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Upload failed'));
          } else {
            resolve(result.secure_url);
          }
        }
      ).end(fileBuffer);
    });
  }
}

export const cloudinaryService = new CloudinaryService();
