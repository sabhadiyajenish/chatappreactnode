import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

export const fileUploadCloud = async (filePathName) => {

    try {

        if (!filePathName) return null;

        const fileResponse = await cloudinary.uploader.upload(filePathName,
            { resource_type: "auto" });

        console.log("File uploaded successfully", fileResponse);
        return fileResponse;
    } catch (error) {
        fs.unlinkSync(filePathName);
        console.log("Clouinary file Error", error);
    }
}