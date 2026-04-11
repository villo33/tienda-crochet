const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: "Untitled",
    api_key: "922379677878479",
    api_secret: "cbqhx1YWOSOsTReVGjuE9lyoUFw"
});

module.exports = cloudinary;