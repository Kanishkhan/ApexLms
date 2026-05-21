import { v2 as cloudinary } from 'cloudinary';

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
  async uploadFile(fileBuffer: Buffer, mimetype: string): Promise<string> {
    if (!isCloudinaryConfigured) {
      // Mock uploads with high quality stock images, PDFs, and video links
      if (mimetype.startsWith('image/')) {
        return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600';
      }
      if (mimetype === 'application/pdf') {
        return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      }
      if (mimetype.startsWith('video/')) {
        return 'https://res.cloudinary.com/demo/video/upload/dpg_sample.mp4';
      }
      return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600';
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
