const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// variables name used in cloudinary.config has fixed name i.e.,  cloud_name, api_key...
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req, file) => 'wanderlust_DEV',
    allowedFormat: ["png","jpg","jpeg"],

  },
});

module.exports={
    cloudinary,
    storage
}