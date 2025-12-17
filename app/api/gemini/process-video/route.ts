import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// ===== RETRY HELPER WITH EXPONENTIAL BACKOFF =====
/**
 * Gọi Gemini API với cơ chế retry tự động khi gặp lỗi
 * @param ai - GoogleGenAI client instance
 * @param requestConfig - Config cho generateContent request
 * @param maxRetries - Số lần retry tối đa (mặc định 3)
 * @returns Response từ Gemini API
 */
const callGeminiWithRetry = async (
  ai: GoogleGenAI,
  requestConfig: any,
  maxRetries: number = 3
): Promise<any> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Lần thử ${attempt}/${maxRetries}...`);

      const response = await ai.models.generateContent(requestConfig);

      // Kiểm tra response có hợp lệ không
      if (!response.candidates?.[0]?.content) {
        throw new Error("Response từ Gemini rỗng");
      }

      console.log(`✅ Thành công ở lần thử ${attempt}`);
      return response;
    } catch (error: any) {
      const isLastAttempt = attempt === maxRetries;
      const statusCode = error?.status || error?.response?.status || 500;

      console.error(`❌ Lần thử ${attempt} thất bại:`, error.message || error);

      // Không retry với lỗi client (4xx) trừ 429 (rate limit)
      if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
        console.error(`❌ Lỗi client ${statusCode}, không retry`);
        throw error;
      }

      // Nếu là lần thử cuối cùng, throw error
      if (isLastAttempt) {
        console.error(`❌ Tất cả ${maxRetries} lần thử đều thất bại`);
        throw error;
      }

      // Exponential backoff: 2s, 4s, 8s, ...
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Đợi ${waitTime}ms trước khi thử lại...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw new Error("Retry logic thất bại");
};

// ===== HELPER FUNCTIONS =====
/**
 * Format timestamp từ milliseconds sang MM:SS hoặc HH:MM:SS
 */
const formatTimestamp = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

/**
 * Convert array transcript thành text format
 */
const transcriptArrayToText = (transcripts: any[]): string => {
  return transcripts
    .map((segment) => {
      const timestamp = formatTimestamp(segment.startTs);
      return `[${timestamp}] Speaker ${segment.speakerId}: ${segment.text}`;
    })
    .join("\n");
};

/**
 * Parse improved transcript text thành array format
 */
const parseImprovedTranscript = (
  improvedText: string,
  originalSegments: any[]
) => {
  const lines = improvedText.split("\n").filter((line) => line.trim());
  const result: any[] = [];
  const regex = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*Speaker\s*([^\s:]+):\s*(.+)/i;

  lines.forEach((line, index) => {
    const match = line.match(regex);
    if (match) {
      const [, timestamp, speakerId, text] = match;
      const parts = timestamp.split(":").map(Number);
      let startMs = 0;

      if (parts.length === 3) {
        startMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
      } else {
        startMs = (parts[0] * 60 + parts[1]) * 1000;
      }

      const nextMatch = lines[index + 1]?.match(regex);
      let stopMs = startMs + 3000;

      if (nextMatch) {
        const nextParts = nextMatch[1].split(":").map(Number);
        if (nextParts.length === 3) {
          stopMs =
            (nextParts[0] * 3600 + nextParts[1] * 60 + nextParts[2]) * 1000;
        } else {
          stopMs = (nextParts[0] * 60 + nextParts[1]) * 1000;
        }
      }

      result.push({
        speakerId,
        type: "speech",
        text: text.trim(),
        startTs: startMs,
        stopTs: stopMs,
        duration: (stopMs - startMs) / 1000,
      });
    }
  });

  return result.length > 0
    ? result
    : originalSegments.map((seg) => ({
        ...seg,
        duration: (seg.stopTs - seg.startTs) / 1000,
      }));
};

// ===== API ROUTE HANDLER =====
export async function POST(request: NextRequest) {
  console.log('🚀 API Route: process-video bắt đầu (text-only mode)');

  try {
    const { videoUrl, transcriptSegments, tasks } = await request.json();

    console.log('📋 Request:', {
      hasVideoUrl: !!videoUrl,
      transcriptCount: transcriptSegments?.length,
      taskCount: tasks?.length || 0,
    });

    // Validate input
    if (!transcriptSegments) {
      return NextResponse.json(
        { success: false, error: "Thiếu transcriptSegments" },
        { status: 400 }
      );
    }

    // Kiểm tra API key
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.error("❌ Không tìm thấy GEMINI_API_KEY");
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY chưa được cấu hình" },
        { status: 500 }
      );
    }

    console.log('✅ GEMINI_API_KEY tồn tại');

    // Khởi tạo AI client
    const ai = new GoogleGenAI({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    });

    // 🧹 Cleanup: Xóa tất cả files cũ trong Gemini storage (optional)
    try {
      console.log('🧹 Cleaning up old files in Gemini storage...');
      const listPager = await ai.files.list();
      const files: any[] = [];
      
      // Iterate through pager to get all files
      for await (const file of listPager) {
        files.push(file);
      }
      
      if (files.length > 0) {
        console.log(`   Found ${files.length} file(s) to delete`);
        const deletePromises = files.map((file: any) => 
          ai.files.delete({ name: file.name }).catch((e: any) => {
            console.warn(`   Failed to delete ${file.name}:`, e.message);
          })
        );
        await Promise.all(deletePromises);
        console.log('✅ Storage cleanup completed');
      } else {
        console.log('   No old files to clean');
      }
    } catch (cleanupError) {
      console.warn('⚠️ Storage cleanup failed (non-critical):', cleanupError);
      // Continue execution even if cleanup fails
    }

    // Prepare transcript text
    const transcriptText = transcriptArrayToText(transcriptSegments);
    console.log('📝 Transcript đã chuẩn bị, độ dài:', transcriptText.length);

    // ⚡ VIDEO URL MODE - Gửi URL trực tiếp cho Gemini (không cần base64)
    const hasVideoUrl = !!videoUrl;
    console.log('🎥 Video processing mode:', {
      hasVideoUrl,
      videoSource: hasVideoUrl 
        ? (videoUrl.includes('cloudinary') ? 'Cloudinary' : 
           videoUrl.includes('stream-io') ? 'Stream' : 'Other')
        : 'None',
      willUseVideo: hasVideoUrl
    });

    // ===== BƯỚC 1: Cải thiện Transcript với Video URL =====
    console.log(
      hasVideoUrl 
        ? '🤖 Bước 1: Đang cải thiện transcript với Gemini 2.0 Flash (video URL mode - NHANH)...'
        : '🤖 Bước 1: Đang cải thiện transcript với Gemini 2.0 Flash (text-only)...'
    );

    let improvedText = "";
    let improvedTranscript = transcriptSegments;
    
    // Declare outside try block for cleanup access
    let geminiFileUri: string | null = null;
    let geminiFileName: string | null = null;
    let geminiFileMimeType: string | null = null;

    try {
      // Upload video to Gemini File API nếu có URL
      
      if (hasVideoUrl) {
        try {
          console.log('📤 Uploading video URL to Gemini File API...');
          
          // Tải video trực tiếp từ URL
          const videoResponse = await fetch(videoUrl, {
            signal: AbortSignal.timeout(60000), // 60s timeout
          });
          
          if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video: ${videoResponse.status}`);
          }

          const videoBlob = await videoResponse.blob();
          const videoFile = new File([videoBlob], "meeting-recording.mp4", {
            type: "video/mp4",
          });

          console.log('📊 Video info:', {
            size: (videoFile.size / 1024 / 1024).toFixed(2) + ' MB',
            type: videoFile.type,
            name: videoFile.name
          });

          // Upload to Gemini File API (để Gemini tự detect codec)
          const uploadResult = await ai.files.upload({
            file: videoFile,
            config: {
              displayName: "Meeting Recording",
            },
          });

          geminiFileUri = uploadResult.uri || null;
          geminiFileName = uploadResult.name || null;
          console.log('✅ Video uploaded to Gemini File API:', geminiFileUri);

          // ⏳ Đợi file chuyển sang trạng thái ACTIVE (bắt buộc!)
          if (geminiFileName) {
            console.log('⏳ Waiting for file to become ACTIVE...');
            let fileReady = false;
            let attempts = 0;
            const maxAttempts = 30; // Tối đa 30 lần (30 giây)

            while (!fileReady && attempts < maxAttempts) {
              attempts++;
              
              // Đợi 1 giây trước khi check
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Lấy thông tin file
              const fileInfo = await ai.files.get({ name: geminiFileName });
              
              console.log(`  → Attempt ${attempts}/${maxAttempts}: File state = ${fileInfo.state}, mimeType = ${fileInfo.mimeType}`);
              
              if (fileInfo.state === 'ACTIVE') {
                fileReady = true;
                geminiFileMimeType = fileInfo.mimeType || null; // Lưu mime type từ Gemini
                console.log('✅ File is ACTIVE and ready to use!');
                console.log('✅ Detected mime type:', geminiFileMimeType);
              } else if (fileInfo.state === 'FAILED') {
                throw new Error('File processing failed on Gemini side');
              }
              // If still PROCESSING, continue loop
            }

            if (!fileReady) {
              throw new Error('File did not become ACTIVE within timeout');
            }
          }
        } catch (videoError: any) {
          console.error('❌ Failed to upload video to Gemini:', videoError.message);
          // Cleanup on error
          if (geminiFileName) {
            try {
              await ai.files.delete({ name: geminiFileName });
              console.log('🗑️ Cleaned up failed upload');
            } catch (e) {
              // Ignore cleanup errors
            }
          }
          
          // ❌ THROW ERROR thay vì fallback - không cho phép xử lý với text-only
          throw new Error(
            `Video processing failed: ${videoError.message}. ` +
            `Please check your internet connection and try again. ` +
            `Video URL processing is required for accurate AI results.`
          );
        }
      }

      // Build request parts
      const requestParts: any[] = [
        {
          text: geminiFileUri 
            ? `
                Tôi có một đoạn transcript sơ bộ của video cuộc họp. Hãy xem video và dựa vào transcript để tạo ra một transcript hoàn chỉnh, chính xác hơn bằng tiếng Việt.

                Transcript sơ bộ:
                ${transcriptText}

                Yêu cầu:
                - Xem video để hiểu ngữ cảnh, cảm xúc, ngữ điệu
                - Sửa lỗi chính tả, ngữ pháp, từ sai hoặc thiếu dựa trên video
                - Thêm dấu câu chính xác
                - Chia đoạn văn hợp lý
                - QUAN TRỌNG: Giữ NGUYÊN Speaker ID như trong transcript gốc
                - QUAN TRỌNG: Giữ NGUYÊN timestamp format [MM:SS]
                
                Trả về transcript đã cải thiện theo ĐÚNG định dạng:
                [timestamp] Speaker X: <nội dung đã sửa>

                Transcript đã cải thiện:
              `
            : `
                Hãy cải thiện transcript cuộc họp sau bằng tiếng Việt.

                Transcript gốc:
                ${transcriptText}

                Yêu cầu:
                - Sửa lỗi chính tả, ngữ pháp
                - Thêm dấu câu chính xác
                - Chia đoạn văn hợp lý
                - Giữ nguyên ý nghĩa và ngữ cảnh
                - QUAN TRỌNG: Giữ NGUYÊN Speaker ID như trong transcript gốc
                - QUAN TRỌNG: Giữ NGUYÊN timestamp format [MM:SS]
                
                Trả về transcript đã cải thiện theo ĐÚNG định dạng:
                [timestamp] Speaker X: <nội dung đã sửa>

                Transcript đã cải thiện:
              `,
        },
      ];

      // Add file reference if uploaded
      if (geminiFileUri) {
        requestParts.push({
          fileData: {
            // ⚠️ KHÔNG chỉ định mimeType ở đây - để Gemini tự detect từ file
            fileUri: geminiFileUri,
          },
        });
      }

      const improvedResponse = await callGeminiWithRetry(
        ai,
        {
          model: "gemini-2.0-flash",
          contents: [
            {
              role: "user",
              parts: requestParts,
            },
          ],
        },
        2 // Retry tối đa 2 lần
      );

      improvedText =
        improvedResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      console.log('✅ Đã nhận được improved transcript, độ dài:', improvedText.length);
      
      improvedTranscript = parseImprovedTranscript(
        improvedText,
        transcriptSegments
      );
      console.log('✅ Đã parse improved transcript thành array:', improvedTranscript.length, 'segments');
      
      improvedText = transcriptArrayToText(improvedTranscript);

      // 🗑️ Xóa file ngay sau khi xử lý xong (cleanup)
      if (geminiFileName) {
        try {
          console.log('🗑️ Deleting video file from Gemini storage...');
          await ai.files.delete({ name: geminiFileName });
          console.log('✅ Video file deleted successfully');
        } catch (deleteError) {
          console.warn('⚠️ Failed to delete file (non-critical):', deleteError);
          // Non-critical error, continue
        }
      }
    } catch (error: any) {
      console.warn(
        "⚠️ Bước 1 thất bại sau khi retry, sử dụng transcript gốc:",
        error.message
      );
      
      // Cleanup file on error
      if (geminiFileName) {
        try {
          await ai.files.delete({ name: geminiFileName });
          console.log('🗑️ Cleaned up file after error');
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      // Fallback: Sử dụng transcript gốc nếu improve failed
      improvedText = transcriptText;
      improvedTranscript = transcriptSegments.map(
        (seg: { stopTs: number; startTs: number }) => ({
          ...seg,
          duration: (seg.stopTs - seg.startTs) / 1000,
        })
      );
    }

    // ===== BƯỚC 2: Tạo Summary + Todo List với RETRY (parallel) =====
    console.log(
      "🤖 Bước 2: Đang tạo summary và todo list với Gemini 2.0 Flash (parallel, text-only)..."
    );

    let summary = "Không có kết quả.";
    let todoList: any[] = [];
    const projectTasksJson = JSON.stringify(tasks);
    try {
      const [summaryResponse, todoResponse] = await Promise.all([
        // Summary với retry
        callGeminiWithRetry(
          ai,
          {
            model: "gemini-2.0-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `
                                    Hãy phân tích transcript cuộc họp sau và tạo một bản tóm tắt chi tiết bằng tiếng Việt.

                                    Yêu cầu:
                                    - Tóm tắt nội dung chính của cuộc họp (3-5 câu)
                                    - Không sử dụng Speakder ID trong tóm tắt.
                                    - Liệt kê các chủ đề được thảo luận
                                    - Định dạng rõ ràng với các mục bullet point

                                    Transcript:
                                    ${improvedText}

                                    Hãy trả về summary hoàn chỉnh:
                                `,
                  },
                ],
              },
            ],
          },
          2 // Retry tối đa 2 lần cho summary
        ),

        // Todo List với retry
        callGeminiWithRetry(
          ai,
          {
            model: "gemini-2.0-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `
                                    Dựa trên transcript cuộc họp sau, hãy tạo một danh sách todo/action items chi tiết bằng tiếng Việt.
                                    Các task đã có trong project (ProjectTasks):
                                    ${projectTasksJson}
                                    Yêu cầu:
                                    - Xác định tất cả các nhiệm vụ/công việc cần làm được đề cập
                                    - Gán người chịu trách nhiệm cho từng task (dựa vào Speaker ID trong transcript)
                                    - Ước lượng thời gian bắt đầu và kết thúc nếu được nhắc đến (format: DD-MM-YYYY)
                                    - Nếu không có thời gian rõ ràng, để null
                                    - Mỗi task nên ngắn gọn, rõ ràng
                                    - Xác định các task cũ liên quan (nếu có) và ghi ID vào mảng referenceTaskIds
                                    - Khi sinh todo mới, kiểm tra nó có liên quan/tiếp nối task cũ nào không
                                    - Nếu có liên quan, thêm task ID vào referenceTaskIds
                                    - Nếu không liên quan task nào, chỉ ghi mô tả todo như bình thường.

                                    **BẮT BUỘC: Trả về ONLY JSON array, KHÔNG có markdown, KHÔNG có text thừa.**

                                    Format JSON:
                                    [
                                      {
                                        "id": "todo-1",
                                        "title": "Tên task ngắn gọn",
                                        "description": "Mô tả chi tiết task. Nếu liên quan task cũ thì ghi rõ trong description này.",
                                        "assigneeId": "1",
                                        "startDate": "13-10-2025",
                                        "endDate": "20-10-2025",
                                        "referenceTaskIds": ["task-123", "task-456"]
                                      }
                                    ]

                                    CHÚ Ý:
                                    - id: tự động tăng "todo-1", "todo-2", ...
                                    - assigneeId: lấy từ Speaker ID trong transcript (ví dụ: "1", "4", "male-voice")
                                    - Nếu không rõ ai làm, để null
                                    - startDate/endDate: format DD-MM-YYYY hoặc null
                                    - referenceTaskIds: array các task ID liên quan, có thể rỗng []
                                    - Chỉ trả về JSON array, không có text giải thích

                                    Transcript:
                                    ${improvedText}

                                    JSON:
                                `,
                  },
                ],
              },
            ],
          },
          2 // Retry tối đa 2 lần cho todo
        ),
      ]);

      summary =
        summaryResponse.candidates?.[0]?.content?.parts?.[0]?.text ??
        "Không có kết quả.";
      const todoRawText =
        todoResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";

      // Clean và parse todo list JSON
      try {
        let cleanedTodo = todoRawText.trim();
        // Xóa markdown code blocks nếu có
        if (cleanedTodo.startsWith("```json")) {
          cleanedTodo = cleanedTodo
            .replace(/```json\n?/g, "")
            .replace(/```/g, "");
        } else if (cleanedTodo.startsWith("```")) {
          cleanedTodo = cleanedTodo.replace(/```/g, "");
        }

        todoList = JSON.parse(cleanedTodo.trim());
        // console.log('✅ Todo list parsed thành công:', todoList.length, 'items');
        // console.log('📄 Todo List Preview:', todoList);
      } catch (parseError) {
        console.error("❌ Không thể parse todo JSON:", parseError);
        todoList = [];
      }
    } catch (error: any) {
      console.warn("⚠️ Bước 2 thất bại một phần sau khi retry:", error.message);
      // Tiếp tục với kết quả partial (có thể có summary nhưng không có todo)
    }

    console.log("✅ Bước 2 hoàn thành: Summary và Todo list đã được tạo");

    // Trả về kết quả (ngay cả khi chỉ có partial results)
    console.log("🎉 Xử lý hoàn tất! (text-only mode - NHANH HƠN)");
    return NextResponse.json({
      success: true,
      data: {
        improvedTranscript,
        summary,
        todoList,
      },
    });
  } catch (error: any) {
    console.error("❌ Lỗi API Route:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Không thể xử lý video",
      },
      { status: 500 }
    );
  }
}
