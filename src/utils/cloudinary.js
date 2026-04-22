import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/config.service.js";

// Configuration
cloudinary.config({
	cloud_name: env.cloudinaryCloudName,
	api_key: env.cloudinaryApiKey,
	api_secret: env.cloudinaryApiSecret, // Click 'View API Keys' above to copy your API secret
});



export default cloudinary;