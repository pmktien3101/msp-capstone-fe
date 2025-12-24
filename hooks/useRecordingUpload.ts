import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { uploadFileToCloudinary } from "@/services/uploadFileService";
import { meetingService } from "@/services/meetingService";

export const useRecordingUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const uploadRecordingToCloud = useCallback(
        async (call: any, meetingId: string) => {
            setIsUploading(true);
            setUploadProgress(0);

            try {
                // Helper: poll Stream recordings until ready (max ~60s)
                const pollRecordings = async (maxWaitMs = 60000, intervalMs = 3000) => {
                    const start = Date.now();

                    while (Date.now() - start < maxWaitMs) {
                        const recordingsResponse = await call?.queryRecordings();
                        const recordings = recordingsResponse?.recordings || [];

                        console.log("🎥 Polling recordings...", {
                            count: recordings.length,
                            hasUrl: recordings[0]?.url ? true : false,
                        });

                        if (recordings.length > 0 && recordings[0]?.url) {
                            return recordings[0];
                        }

                        await new Promise((r) => setTimeout(r, intervalMs));
                        setUploadProgress((prev) => Math.min(prev + 10, 40));
                    }

                    return null;
                };

                console.log("🔄 Fetching recording from Stream...", { meetingId });

                const recording = await pollRecordings();
                if (!recording) {
                    console.warn("⚠️ Recording not available yet after waiting");
                    return null;
                }

                setUploadProgress(50);

                console.log("📥 Downloading recording from Stream...", {
                    url: recording.url,
                });

                const response = await fetch(recording.url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch recording: ${response.status}`);
                }

                const blob = await response.blob();
                const contentType = blob.type || "video/mp4";
                const ext = contentType.includes("webm") ? "webm" : "mp4";

                setUploadProgress(60);

                const filename = `meeting-${meetingId}-${Date.now()}.${ext}`;
                const file = new File([blob], filename, { type: contentType });

                console.log("☁️ Uploading to Cloudinary...", {
                    filename,
                    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                });

                const cloudinaryUrl = await uploadFileToCloudinary(file);

                setUploadProgress(90);

                console.log("✅ Upload successful!", { cloudinaryUrl });

                // Update meeting with recording URL
                const updateResult = await meetingService.finishMeeting(
                    meetingId,
                    new Date(),
                    cloudinaryUrl
                );

                if (updateResult.success) {
                    console.log("✅ Meeting updated with recording URL");
                    setUploadProgress(100);
                    toast.success("Recording uploaded successfully!");
                }

                return cloudinaryUrl;
            } catch (error) {
                console.error("❌ Error uploading recording:", error);
                toast.error("Failed to upload recording");
                return null;
            } finally {
                setIsUploading(false);
                setUploadProgress(0);
            }
        },
        []
    );

    return {
        uploadRecordingToCloud,
        isUploading,
        uploadProgress,
    };
};
