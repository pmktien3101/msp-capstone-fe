import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { meetingService } from "@/services/meetingService";
import { todoService } from "@/services/todoService";

// ===== TYPES =====
interface VideoMetadata {
    duration: number;
    size: number;
    needsChunking: boolean;
    estimatedProcessingTime: number;
}

interface AIError {
    message: string;
    details?: string;
    timestamp: number;
    type?: 'VIDEO_TOO_LONG' | 'NEEDS_CHUNKING' | 'BACKGROUND_REQUIRED' | 'GENERAL_ERROR';
}

export function useMeetingAI() {
    const [improvedTranscript, setImprovedTranscript] = useState<any[]>([]);
    const [summary, setSummary] = useState<string>("");
    const [todoList, setTodoList] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<AIError | null>(null);

    const hasProcessedRef = useRef(false);

    // ===== HELPER: Lấy video duration từ Blob =====
    const getVideoDuration = async (videoBlob: Blob): Promise<number> => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                const duration = video.duration;

                if (isNaN(duration) || duration === 0) {
                    reject(new Error('Invalid video duration'));
                } else {
                    resolve(duration);
                }
            };

            video.onerror = () => {
                window.URL.revokeObjectURL(video.src);
                reject(new Error('Failed to load video metadata'));
            };

            video.src = URL.createObjectURL(videoBlob);
        });
    };

    // ===== HELPER: Lấy metadata video =====
    const getVideoMetadata = async (videoUrl: string): Promise<VideoMetadata> => {
        try {
            console.log('📊 Fetching video metadata...');

            // Fetch chỉ 5MB đầu tiên để lấy metadata
            const response = await fetch(videoUrl, {
                headers: {
                    'Range': 'bytes=0-5242880' // 5MB
                },
                signal: AbortSignal.timeout(30000) // 30s timeout
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const partialBlob = await response.blob();
            const duration = await getVideoDuration(partialBlob);

            // Lấy total size từ Content-Range header
            const contentRange = response.headers.get('Content-Range');
            const totalSize = contentRange
                ? parseInt(contentRange.split('/')[1])
                : partialBlob.size;

            const needsChunking = totalSize > 20 * 1024 * 1024 || duration > 600; // 20MB hoặc 10 phút
            const estimatedProcessingTime = Math.ceil(duration / 60) * 10 + 15; // 10s/phút + 15s overhead

            console.log('📊 Video metadata:', {
                duration: `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`,
                size: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
                bitrate: `${((totalSize / 1024 / 1024) / (duration / 60)).toFixed(2)} MB/phút`,
                needsChunking,
                estimatedProcessingTime: `${estimatedProcessingTime}s`
            });

            return {
                duration,
                size: totalSize,
                needsChunking,
                estimatedProcessingTime
            };
        } catch (error: any) {
            console.error('❌ Failed to get video metadata:', error.message);

            // Fallback: giả định video ngắn
            return {
                duration: 300, // 5 phút
                size: 20 * 1024 * 1024, // 20MB
                needsChunking: false,
                estimatedProcessingTime: 60
            };
        }
    };

    // ===== MAIN: Process Video =====
    const processVideo = async (
        meetingId: string,
        recording: any,
        transcriptions: any[],
        tasks: any[],
        meetingInfo: any,
        call?: any // ✅ Thêm call object (optional)
    ) => {
        setError(null);
        setIsProcessing(true);

        try {
            // 1️⃣ Xác định video URL (ưu tiên Cloudinary)
            let cloudRecordingUrl = meetingInfo?.recordUrl || null;
            let isUsingStreamUrl = false;

            if (!cloudRecordingUrl && recording?.url) {
                console.warn("⚠️ Using Stream URL as fallback");
                cloudRecordingUrl = recording.url;
                isUsingStreamUrl = true;
            }

            if (!cloudRecordingUrl) {
                throw new Error("No recording URL available");
            }

            console.log('🎥 Video URL:', cloudRecordingUrl);

            // 2️⃣ Lấy metadata video
            const videoMetadata = await getVideoMetadata(cloudRecordingUrl);

            // 3️⃣ Check nếu video quá dài (> 30 phút) → Reject
            if (videoMetadata.duration > 30 * 60) {
                const errorMsg = `Video is too long (${Math.ceil(videoMetadata.duration / 60)} minutes). ` +
                    `Videos longer than 30 minutes require background processing. Please contact support.`;

                setError({
                    message: errorMsg,
                    details: `Estimated time: ${Math.ceil(videoMetadata.estimatedProcessingTime / 60)} minutes`,
                    timestamp: Date.now(),
                    type: 'VIDEO_TOO_LONG'
                });

                toast.error(errorMsg, { autoClose: 8000 });
                return false;
            }

            // 4️⃣ Hiển thị thông báo theo độ dài video
            if (videoMetadata.duration >= 10 * 60 && videoMetadata.duration <= 30 * 60) {
                // Case 2: Video 10-30 phút
                toast.info(
                    `Video length: ${Math.ceil(videoMetadata.duration / 60)} minutes. ` +
                    `Processing may take around ${Math.ceil(videoMetadata.estimatedProcessingTime / 60)} minutes. ` +
                    `Please wait...`,
                    { autoClose: 8000 }
                );
            } else {
                // Case 1: Video < 10 phút
                // toast.info('Processing with AI...', { autoClose: 5000 });
                console.log('🤖 Processing with AI...');
            }

            // 5️⃣ Chuẩn bị transcript segments
            const transcriptSegments = transcriptions.map((t: any, index: number) => {
                let speakerId = t.speaker_id || t.speakerId || t.user_id || 'unknown';

                if (speakerId === 'unknown' && t.user) {
                    speakerId = t.user.id || t.user.user_id || 'unknown';
                }

                // ✅ DEBUG: Log first 10 segments
                if (index < 10) {
                    console.log(`🔍 Segment ${index}:`, {
                        speaker: speakerId,
                        text: t.text?.substring(0, 50)
                    });
                }

                return {
                    speakerId,
                    text: t.text || '',
                    startTs: t.start_time || 0,
                    stopTs: t.end_time || t.start_time + 3000,
                    type: 'speech'
                };
            });

            // ✅ DEBUG: Log full original transcript preview
            console.log('📝 Original transcript preview (first 5 lines):');
            transcriptSegments.slice(0, 5).forEach((seg: any) => {
                console.log(`  [${Math.floor(seg.startTs / 1000)}s] ${seg.speakerId}: ${seg.text}`);
            });


            // 6️⃣ Chuẩn bị stream metadata (FIX PARTICIPANTS MAPPING)
            const streamMetadata = {
                callId: call?.id,
                participants: (meetingInfo?.attendees || []).map((att: any) => {
                    // Map attendee ID với các variant có thể có
                    const userId = att.id || att.userId || att.user_id;

                    return {
                        user_id: userId,
                        user: {
                            id: userId,
                            name: att.fullName || att.name,
                            email: att.email
                        }
                    };
                })
            };

            console.log('👥 Stream metadata:', streamMetadata);

            // 7️⃣ Gọi API xử lý
            console.log('📤 Sending request to API...');
            console.log('📊 Request data:', {
                videoUrl: cloudRecordingUrl,
                videoMetadata,
                transcriptSegments: transcriptSegments.length,
                projectTasks: tasks.length,
                participants: streamMetadata.participants.length
            });

            const response = await fetch("/api/gemini/process-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    videoUrl: cloudRecordingUrl,
                    videoMetadata, // ✅ Gửi metadata
                    transcriptSegments,
                    tasks: tasks,
                    streamMetadata, // ✅ Gửi stream metadata
                    meetingId
                }),
            });

            const data = await response.json();

            // 8️⃣ Handle response errors
            if (!response.ok || !data.success) {
                // Case: Video cần chunking
                if (data.needsChunking) {
                    setError({
                        message: 'Video is long and requires chunked processing',
                        details: data.message,
                        timestamp: Date.now(),
                        type: 'NEEDS_CHUNKING'
                    });
                    toast.warning(data.message, { autoClose: 10000 });
                    return false;
                }

                // Case: Cần background processing
                if (data.needsBackgroundProcessing) {
                    setError({
                        message: 'Video is too long (> 30 minutes)',
                        details: data.message,
                        timestamp: Date.now(),
                        type: 'BACKGROUND_REQUIRED'
                    });
                    toast.error(data.message, { autoClose: 10000 });
                    return false;
                }

                // Lỗi từ API
                const errorMsg = data.userMessage || data.error || "Unable to process video";

                setError({
                    message: errorMsg,
                    details: data.error,
                    timestamp: Date.now(),
                    type: 'GENERAL_ERROR'
                });

                toast.error(errorMsg, { autoClose: 8000 });
                throw new Error(errorMsg);
            }


            // 9️⃣ Update state with AI results
            setImprovedTranscript(data.data.improvedTranscript);
            setSummary(data.data.summary);
            setTodoList(data.data.todoList);

            // 🔟 Update meeting on server
            const updatePayload: any = {
                meetingId,
                summary: data.data.summary,
                transcription: JSON.stringify(data.data.improvedTranscript),
            };

            if (!isUsingStreamUrl && cloudRecordingUrl) {
                updatePayload.recordUrl = cloudRecordingUrl;
            }

            await meetingService.updateMeeting(updatePayload);

            // 1️⃣1️⃣ Create todos from AI
            if (data.data.todoList?.length > 0) {
                const mappedTodos = mapTodosForCreation(data.data.todoList, meetingInfo);
                const createResult = await todoService.createTodosFromAI(meetingId, mappedTodos);

                if (createResult.success) {
                    toast.success(`Successfully created ${createResult.data?.length ?? 0} task(s) from AI!`);

                    // Refresh todos
                    const refreshResult = await todoService.getTodosByMeetingId(meetingId);
                    if (refreshResult.success && refreshResult.data) {
                        setTodoList(refreshResult.data);
                    }
                }
            }

            toast.success('Video processed successfully!');
            return true;

        } catch (err: any) {
            console.error("❌ processVideo error:", err);

            const errorMessage = err?.message || "Unknown error";

            setError({
                message: "Unable to process video",
                details: errorMessage,
                timestamp: Date.now(),
                type: 'GENERAL_ERROR'
            });

            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setIsProcessing(false);
        }
    };

    // ===== Regenerate =====
    const regenerate = async (
        meetingId: string,
        recordingUrl: string,
        transcriptions: any[],
        tasks: any[],
        meetingInfo: any,
        call?: any // ✅ Thêm call object
    ) => {
        setError(null);
        setIsProcessing(true);

        try {
            // Lấy metadata
            const videoMetadata = await getVideoMetadata(recordingUrl);

            // Check video length
            if (videoMetadata.duration > 30 * 60) {
                const errorMsg = `Video is too long (${Math.ceil(videoMetadata.duration / 60)} minutes). Unable to regenerate.`;

                setError({
                    message: errorMsg,
                    timestamp: Date.now(),
                    type: 'VIDEO_TOO_LONG'
                });

                toast.error(errorMsg);
                return;
            }

            // Notify user
            if (videoMetadata.duration >= 10 * 60) {
                toast.info(
                    `Regenerating (video ${Math.ceil(videoMetadata.duration / 60)} minutes). ` +
                    `This may take around ${Math.ceil(videoMetadata.estimatedProcessingTime / 60)} minutes...`,
                    { autoClose: 8000 }
                );
            } else {
                toast.info('Regenerating with AI...', { autoClose: 5000 });
            }

            // Prepare data
            const transcriptSegments = transcriptions.map((t: any) => ({
                speakerId: t.speaker_id || 'unknown',
                text: t.text || '',
                startTs: t.start_time || 0,
                stopTs: t.end_time || t.start_time + 3000,
                type: 'speech'
            }));

            const streamMetadata = {
                callId: call?.id,
                participants: (meetingInfo?.attendees || []).map((att: any) => ({
                    user_id: att.id,
                    user: {
                        id: att.id,
                        name: att.fullName,
                        email: att.email
                    }
                }))
            };

            // Call API
            const response = await fetch("/api/gemini/process-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    videoUrl: recordingUrl,
                    videoMetadata,
                    transcriptSegments,
                    tasks: tasks,
                    streamMetadata,
                    meetingId
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.userMessage || data.error || "Failed to regenerate");
            }

            // Update state
            setImprovedTranscript(data.data.improvedTranscript);
            setSummary(data.data.summary);

            const mappedTodos = mapTodosForCreation(data.data.todoList || [], meetingInfo);

            // Update server
            const result = await meetingService.regenerateMeetingAIData({
                meetingId,
                transcription: JSON.stringify(data.data.improvedTranscript),
                summary: data.data.summary,
                recordUrl: recordingUrl,
                todos: mappedTodos,
            });

            if (result.success) {
                const refreshResult = await todoService.getTodosByMeetingId(meetingId);
                if (refreshResult.success && refreshResult.data) {
                    setTodoList(refreshResult.data);
                }
                toast.success(`Regenerate successful! Created ${mappedTodos.length} task(s).`);
            }
        } catch (err: any) {
            console.error("❌ regenerate error:", err);
            console.error("❌ regenerate error message:", err?.message);

            setError({
                message: "Unable to regenerate",
                details: err?.message || "Unknown error",
                timestamp: Date.now(),
                type: 'GENERAL_ERROR'
            });

            toast.error(`Error: ${err?.message || "Unknown error"}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        improvedTranscript,
        summary,
        todoList,
        isProcessing,
        error,
        processVideo,
        regenerate,
        hasProcessedRef,
        setImprovedTranscript,
        setSummary,
        setTodoList,
        setError,
        getVideoMetadata,
    };
}

// ===== HELPER: Map todos =====
function mapTodosForCreation(todos: any[], meetingInfo: any) {
    return todos.map((todo: any) => {
        let validAssigneeId = todo.assigneeId;

        // Validate assignee
        if (todo.assigneeId && meetingInfo?.attendees) {
            const attendee = meetingInfo.attendees.find(
                (att: any) => att.id === todo.assigneeId
            );
            if (!attendee) {
                console.warn(`⚠️ Assignee ${todo.assigneeId} not found, using creator`);
                validAssigneeId = meetingInfo?.createdById;
            }
        } else {
            validAssigneeId = meetingInfo?.createdById;
        }

        // ✅ Parse dates với helper
        const parsedStartDate = parseDateString(todo.startDate);
        const parsedEndDate = parseDateString(todo.endDate);

        // ✅ Log để debug
        if (todo.startDate || todo.endDate) {
            console.log('📅 Date parsing:', {
                original: { start: todo.startDate, end: todo.endDate },
                parsed: { start: parsedStartDate, end: parsedEndDate }
            });
        }

        return {
            ...todo,
            assigneeId: validAssigneeId,
            startDate: parsedStartDate,
            endDate: parsedEndDate,
        };
    });
}

// ===== HELPER: Parse date từ DD-MM-YYYY sang YYYY-MM-DD =====
function parseDateString(dateStr: string | null): string | null {
    if (!dateStr) return null;

    // Nếu đã là ISO format (YYYY-MM-DD hoặc ISO string) → giữ nguyên
    if (dateStr.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        return new Date(dateStr).toISOString();
    }

    // Parse DD-MM-YYYY
    const ddMmYyyy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
    const match = dateStr.match(ddMmYyyy);

    if (match) {
        const [, day, month, year] = match;
        // Convert to YYYY-MM-DD
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        // Validate
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) {
            console.warn(`⚠️ Invalid date: ${dateStr}`);
            return null;
        }

        return date.toISOString();
    }

    // Fallback: thử parse trực tiếp
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            console.warn(`⚠️ Cannot parse date: ${dateStr}`);
            return null;
        }
        return date.toISOString();
    } catch (e) {
        console.warn(`⚠️ Error parsing date: ${dateStr}`, e);
        return null;
    }
}

