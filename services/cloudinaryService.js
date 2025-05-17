const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Validate Cloudinary configuration
const validateConfig = () => {
  const required = ['cloud_name', 'api_key', 'api_secret'];
  const missing = required.filter(key => !process.env[`CLOUDINARY_${key.toUpperCase()}`]);
  
  if (missing.length > 0) {
    throw new Error(`Missing Cloudinary configuration: ${missing.join(', ')}`);
  }
};

/**
 * Upload an image to Cloudinary
 * @param {Buffer} buffer - The image buffer to upload
 * @returns {Promise<Object>} - The Cloudinary upload result
 */
exports.uploadImage = async (buffer) => {
  try {
    // Validate configuration
    validateConfig();

    // Validate buffer
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error('Invalid image buffer provided');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'gym-members',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
          transformation: [
            { width: 500, height: 500, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error(`Failed to upload image: ${error.message}`));
          } else if (!result || !result.secure_url) {
            console.error('Invalid Cloudinary response:', result);
            reject(new Error('Invalid response from image upload service'));
          } else {
            console.log('Image uploaded successfully:', result.secure_url);
            resolve(result);
          }
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const stream = require('stream');
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);
      bufferStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - The Cloudinary deletion result
 */
exports.deleteImage = async (publicId) => {
  try {
    // Validate configuration
    validateConfig();

    if (!publicId) {
      throw new Error('Public ID is required for image deletion');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok') {
      throw new Error(`Failed to delete image: ${result.result}`);
    }
    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}; 