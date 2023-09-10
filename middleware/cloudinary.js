const cloudinary = require('cloudinary');

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
  });

const uploadToCloudinary = (async(file, folder) => {
    const res = await cloudinary.v2.uploader.upload(file, {folder,
    resource_type: "image" }, 
    function(error, res) {console.log(res); });
    return res;
})

module.exports = uploadToCloudinary