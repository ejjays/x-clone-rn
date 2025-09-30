import { v2 as cloudinary } from 'cloudinary';
import { ENV } from './env.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

/**
 * Deletes a file from Cloudinary using its URL.
 * @param {string} fileUrl - The full URL of the file to delete.
 */
export const deleteFromCloudinary = async (fileUrl) => {
  try {
    const publicIdMatch = fileUrl.match(/\/v\d+\/(.+)\.\w{3,4}$/);
    if (!publicIdMatch || !publicIdMatch[1]) {
      console.warn(`Could not parse Cloudinary public_id from URL: ${fileUrl}`);
      return;
    }
    const publicId = publicIdMatch[1];
    const resourceType = fileUrl.includes('/video/upload') ? 'video' : 'image';
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error.message);
  }
};

/**
 * Deletes a file from ImageKit using its URL.
 * @param {string} fileUrl - The full URL of the file to delete.
 */
export const deleteFromImageKit = async (fileUrl) => {
  try {
    // Extract the filename from the URL.
    const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
    if (!fileName) {
      console.warn(`Could not extract filename from ImageKit URL: ${fileUrl}`);
      return;
    }

    // Search for the file by name to get its fileId.
    const searchResponse = await fetch(`https://api.imagekit.io/v1/files?searchQuery=name="${fileName}"`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(ENV.IMAGEKIT_PRIVATE_KEY + ':').toString('base64')}`
      }
    });

    const searchResult = await searchResponse.json();
    if (!searchResult || searchResult.length === 0) {
      console.warn(`ImageKit file not found for name: ${fileName}`);
      return;
    }
    const fileId = searchResult[0].fileId;

    // Delete the file using the fileId.
    await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${Buffer.from(ENV.IMAGEKIT_PRIVATE_KEY + ':').toString('base64')}`
      }
    });
  } catch (error) {
    console.error('Error deleting from ImageKit:', error.message);
  }
};
