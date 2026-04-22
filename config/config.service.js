import { config } from "dotenv";
import path from 'node:path'

config({path:path.resolve("./config/.env")})

export const env = {
	port:process.env.PORT,
	clientId:process.env.CLIENTID,
	cloudinaryCloudName:process.env.CLOUDINARY_CLOUD_NAME,
	cloudinaryApiKey:process.env.CLOUDINARY_API_KEY,
	cloudinaryApiSecret:process.env.CLOUDINARY_API_SECRET
}

