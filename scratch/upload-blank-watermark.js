const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// A 1x1 transparent PNG in base64
const blankImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

cloudinary.uploader.upload(blankImage, {
  public_id: 'steav_news_watermark',
  overwrite: true
}, function(error, result) {
  if (error) {
    console.error("Error uploading blank watermark:", error);
  } else {
    console.log("Successfully uploaded blank watermark!", result);
  }
});
