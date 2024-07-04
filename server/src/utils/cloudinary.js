import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
// import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const cloudinaryFile = cloudinary;

export const fileUploadCloud = async (filePathName) => {
  try {
    if (!filePathName) return null;

    const fileResponse = await cloudinary.uploader.upload(filePathName, {
      resource_type: "auto",
    });

    console.log("File uploaded successfully", fileResponse);
    fs.unlinkSync(filePathName);
    return fileResponse;
  } catch (error) {
    fs.unlinkSync(filePathName);
    console.log("Clouinary file Error", error);
  }
};

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
