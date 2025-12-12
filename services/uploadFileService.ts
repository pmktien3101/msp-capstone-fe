import axios from "axios";

const CLOUDINARY_NAME = "dgzn2ix8w";
const CLOUDINARY_UPLOAD_PRESET = "MSP_Capstone";

export const uploadFileToCloudinary = async (file: File) => {
  try {
    console.log("[Cloudinary] Uploading file:", file.name, "Type:", file.type, "Size:", file.size);

    // Determine resource type based on file type
    let resourceType = "image"; // default
    if (file.type.startsWith("video")) {
      resourceType = "video";
    } else if (
      file.type === "application/pdf" ||
      file.type === "application/msword" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type.startsWith("application/")
    ) {
      resourceType = "raw"; // For PDFs, documents, and other non-image/video files
    }

    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/${resourceType}/upload`;
    console.log("[Cloudinary] Using resource type:", resourceType);
    console.log("[Cloudinary] Upload URL:", CLOUDINARY_URL);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // Add timeout (30 seconds for large files)
      timeout: 30000,
      // Track upload progress
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`[Cloudinary] Upload progress: ${percentCompleted}%`);
        }
      },
    });

    console.log("[Cloudinary] Upload successful:", response.data?.secure_url);

    // Cloudinary returns secure_url for uploads
    return response.data?.secure_url || response.data?.url;
  } catch (error) {
    console.error("[Cloudinary] Error uploading to Cloudinary:", error);
    // If Axios has a response body with details, include it in the thrown error
    const resp = (error as any)?.response;
    if (resp && resp.data) {
      console.error("[Cloudinary] Error details:", resp.data);
      throw new Error(`Cloudinary upload failed: ${JSON.stringify(resp.data)}`);
    }
    throw new Error("Upload to Cloudinary failed");
  }
};
