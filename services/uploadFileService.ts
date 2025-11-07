import axios from "axios";

const CLOUDINARY_NAME = "dgzn2ix8w";
const CLOUDINARY_UPLOAD_PRESET = "MSP_Capstone";

export const uploadFileToCloudinary = async (file: File) => {
  try {
    const isVideo = file.type.startsWith("video");
    const resourceType = isVideo ? "video" : "image";
    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await axios.post(CLOUDINARY_URL, formData);

    // Cloudinary returns secure_url for uploads
    return response.data?.secure_url || response.data?.url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    // If Axios has a response body with details, include it in the thrown error
    const resp = (error as any)?.response;
    if (resp && resp.data) {
      throw new Error(`Upload failed: ${JSON.stringify(resp.data)}`);
    }
    throw new Error("Upload failed");
  }
};
