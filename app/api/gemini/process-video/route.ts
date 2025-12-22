import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// ===== CONSTANTS =====
const MAX_VIDEO_DURATION = 30 * 60;
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200 MB
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 2000;

// ===== RETRY HELPER =====
const callGeminiWithRetry = async (
  ai: GoogleGenAI,
  requestConfig: any,
  maxRetries: number = MAX_RETRIES
): Promise<any> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Lần thử ${attempt}/${maxRetries}...`);
      const response = await ai.models.generateContent(requestConfig);

      if (!response.candidates?.[0]?.content) {
        throw new Error("Response từ Gemini rỗng");
      }

      console.log(`✅ Thành công ở lần thử ${attempt}`);
      return response;
    } catch (error: any) {
      const isLastAttempt = attempt === maxRetries;
      const statusCode = error?.status || 500;

      console.error(`❌ Lần thử ${attempt} thất bại:`, error.message);

      // Không retry với lỗi client (4xx) trừ 429
      if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
        throw error;
      }

      if (isLastAttempt) {
        throw error;
      }

      // Exponential backoff
      const waitTime = Math.pow(2, attempt) * BASE_RETRY_DELAY;
      console.log(`⏳ Đợi ${waitTime}ms trước khi thử lại...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw new Error("Retry logic thất bại");
};

// ===== HELPER: Format timestamp =====
const formatTimestamp = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

// ===== HELPER: Convert transcript array to text =====
const transcriptArrayToText = (transcripts: any[]): string => {
  return transcripts
    .map((segment) => `[${formatTimestamp(segment.startTs)}] Speaker ${segment.speakerId}: ${segment.text}`)
    .join("\n");
};

// ===== HELPER: Parse improved transcript from Gemini =====
const parseImprovedTranscript = (improvedText: string, originalSegments: any[]) => {
  try {
    // 1. Làm sạch chuỗi trước khi parse
    const cleaned = cleanJsonString(improvedText);
    const parsedData = JSON.parse(cleaned);

    if (!Array.isArray(parsedData)) throw new Error("Not an array");

    return parsedData.map((item, index, array) => {
      // 2. Chấp nhận đa dạng các loại Key mà AI có thể trả về nhầm
      const startMs = Number(item.startTs || item.start || 0);

      // Tính stopTs: Lấy startTs của câu sau, nếu không có thì cộng 3s
      const nextStartMs = array[index + 1]
        ? Number(array[index + 1].startTs || array[index + 1].start)
        : startMs + 3000;

      return {
        speakerId: item.speakerId || item.speaker_id || "unknown",
        type: "speech",
        text: (item.text || item.transcript || "").trim(),
        startTs: startMs,
        stopTs: nextStartMs,
        duration: (nextStartMs - startMs) / 1000,
      };
    });
  } catch (error) {
    console.error('❌ Parse JSON thất bại, dùng fallback segments:', error);
    return originalSegments.map(seg => ({
      ...seg,
      duration: (seg.stopTs - seg.startTs) / 1000
    }));
  }
};
// ===== HELPER: Normalize speaker IDs (TÊN/UNKNOWN → UUID) =====
const normalizeSpeakerIds = (segments: any[], participants: any[]): any[] => {
  if (!participants?.length) return segments;
  const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

  return segments.map(seg => {
    if (uuidRegex.test(seg.speakerId) || seg.speakerId.toLowerCase() === 'unknown') return seg;
    const participant = participants.find(p =>
      (p.user?.name || p.user?.email || '').toLowerCase().trim() === seg.speakerId.toLowerCase().trim()
    );
    return participant ? { ...seg, speakerId: participant.user_id } : seg;
  });
};

// ===== HELPER: Map speaker IDs to names =====
const mapSpeakerIdsToNames = (text: string, participants: any[]): string => {
  if (!participants?.length) return text;
  let result = text;
  participants.forEach((p) => {
    result = result.replace(new RegExp(p.user_id, 'gi'), p.user?.name || p.user?.email || 'Unknown');
  });
  return result;
};

// ===== HELPER: Create speaker mapping =====
const createSpeakerMapping = (participants: any[]): string => {
  if (!participants?.length) return 'Không có thông tin người tham gia.';
  return participants.map((p, i) => `${i + 1}. ${p.user?.name || p.user?.email} (ID: ${p.user_id})`).join('\n');
};

const cleanJsonString = (rawText: string): string => {
  return rawText
    .replace(/^```json\n?/, "") // Xóa thẻ mở ```json
    .replace(/\n?```$/, "")     // Xóa thẻ đóng ```
    .trim();
};


// ===== MAIN API HANDLER =====
export async function POST(request: NextRequest) {
  console.log('🚀 API Route: process-video bắt đầu');

  try {
    const {
      videoUrl,
      videoMetadata,
      transcriptSegments,
      tasks,
      streamMetadata,
      meetingId
    } = await request.json();

    // console.log('📋 Request:', {
    //   hasVideoUrl: !!videoUrl,
    //   hasVideoMetadata: !!videoMetadata,
    //   transcriptCount: transcriptSegments?.length,
    //   taskCount: tasks?.length || 0,
    //   participantsCount: streamMetadata?.participants?.length || 0
    // });

    // Validate
    if (!videoUrl || !transcriptSegments) {
      return NextResponse.json(
        {
          success: false,
          error: "Thiếu videoUrl hoặc transcriptSegments",
          userMessage: "Không tìm thấy dữ liệu video hoặc transcript."
        },
        { status: 400 }
      );
    }

    // Check API key
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY not found");
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY not configured",
          userMessage: "Hệ thống chưa được cấu hình đúng."
        },
        { status: 500 }
      );
    }

    // Init AI
    const ai = new GoogleGenAI({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    });

    const transcriptText = transcriptArrayToText(transcriptSegments);
    // console.log('📝 Transcript prepared, length:', transcriptText.length);

    // ===== BƯỚC 1: Xử lý Video =====
    let improvedTranscript = transcriptSegments;
    const uploadedFiles: string[] = [];

    if (videoUrl && videoMetadata) {
      try {
        // 1. CHẶN VIDEO QUÁ TẢI (> 30p hoặc > 200MB)
        if (videoMetadata.duration > MAX_VIDEO_DURATION || videoMetadata.size > MAX_VIDEO_SIZE) {
          console.log('🚫 Video vượt ngưỡng cho phép - Reject');
          return NextResponse.json({
            success: false,
            error: "The video is too large or too long.",
            userMessage: `The system rejects videos longer than 60 minutes or larger than 200MB.`,
          }, { status: 400 });
        }
        // 2. TẢI VÀ UPLOAD FILE
        const model = "gemini-2.5-flash";
        // Optimize URL for long videos
        let processUrl = videoUrl;
        if (videoUrl.includes('cloudinary')) {
          processUrl = videoUrl.replace('/upload/', '/upload/q_auto:low,w_640/');
        }
        console.log('📥 Đang tải video...');
        const videoResponse = await fetch(processUrl, { signal: AbortSignal.timeout(300000) });

        if (!videoResponse.ok) {
          throw new Error(`Failed to fetch video: ${videoResponse.status}`);
        }

        const videoBlob = await videoResponse.blob();

        console.log("📊 Video:", {
          size: (videoBlob.size / 1024 / 1024).toFixed(2) + " MB",
          duration: `${Math.floor(videoMetadata.duration / 60)}:${String(
            Math.floor(videoMetadata.duration % 60)
          ).padStart(2, "0")}`,
        });

        // Dùng Blob trực tiếp
        const uploadResult = await ai.files.upload({
          file: videoBlob,
          config: { displayName: "Meeting Recording" },
        });

        const fileName = uploadResult.name || '';
        uploadedFiles.push(fileName);

        // Đợi file ACTIVE (Timeout 5 phút cho video 60p)
        console.log('⏳ Đợi video processing...');
        let waitAttempts = 0;
        let fileReady = false;
        let fileMimeType = '';

        while (waitAttempts < 150 && !fileReady) {
          waitAttempts++;
          await new Promise(r => setTimeout(r, 2000));
          const fileInfo = await ai.files.get({ name: fileName });
          if (fileInfo.state === 'ACTIVE') {
            fileReady = true;
            fileMimeType = fileInfo.mimeType || 'video/mp4';
            console.log('✅ Video đã sẵn sàng');
          } else if (fileInfo.state === 'FAILED') {
            throw new Error('Video processing failed');
          }
        }
        if (!fileReady) {
          throw new Error('Video processing timeout');
        }
        // 3. LOGIC CHUNKING & GENERATION

        // Cấu hình Schema để Gemini hiểu rõ cấu trúc dữ liệu mong muốn
        const transcriptSchema = {
          type: "array",
          items: {
            type: "object",
            properties: {
              startTs: { type: "number", description: "Timestamp bắt đầu tính bằng miliseconds" },
              speakerId: { type: "string", description: "UUID hoặc tên người nói" },
              text: { type: "string", description: "Nội dung thoại đã được sửa lỗi" }
            },
            required: ["startTs", "speakerId", "text"]
          }
        };
        // Quyết định số lần gọi dựa theo duration
        const durationSeconds = videoMetadata.duration;
        let combinedResults: any[] = [];

        // if (durationSeconds <= 20 * 60) {
        // Video ngắn dưới 20 phút - Gửi toàn bộ transcript trong 1 lần
        const singlePrompt =
          `
          1) Video cuộc họp.
          2) Một bản transcript sơ bộ rất không chính xác (có thể sai tới 90% hoặc hơn).
          Transcript này chỉ dùng để:
          - Gợi ý vị trí thời gian tương đối của câu.
          - Gợi ý Speaker ID ban đầu (nếu có). 
          Nhiệm vụ:
          - NGHE video để ghi lại nội dung thoại CHÍNH XÁC bằng tiếng Việt.
          - Sửa lỗi chính tả, ngữ pháp, dấu câu.
          - Cố gắng giữ Speaker ID giống transcript sơ bộ nếu hợp lý.
          - Nếu không thể xác định được người nói, dùng "unknown" nhưng hạn chế unknown nhất có thể.
          - Chỉ trả về tối đa 200 đoạn thoại.
          - Không thêm bất kỳ trường nào khác ngoài: startTs, speakerId, text.
          - Không thêm comment, không thêm ghi chú bên trong JSON.
          - Mỗi phần tử trong JSON phải có:
            - "startTs": thời điểm bắt đầu câu nói (miliseconds, ước lượng tương đối).
            - "speakerId": UUID, tên, hoặc "unknown".
            - "text": nội dung câu đã được sửa.
            DANH SÁCH NGƯỜI THAM GIA (để hiểu ngữ cảnh, không bắt buộc phải khớp):
            ${createSpeakerMapping(streamMetadata.participants)}

            TRANSCRIPT SƠ BỘ (RẤT NHIỀU LỖI, KHÔNG ĐẦY ĐỦ):
            ${transcriptText.slice(0, 3000)}
            BẮT BUỘC: 
            - Chỉ trả về JSON array, KHÔNG thêm giải thích.
            - Phải tuân theo schema đã mô tả.
          `.trim();

        const response = await callGeminiWithRetry(ai, {
          model,
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: transcriptSchema,
          },
          contents: [
            {
              role: "user",
              parts: [
                { fileData: { fileUri: uploadResult.uri || "", mimeType: fileMimeType } },
                { text: singlePrompt },
              ],
            },
          ],
        });

        const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
        combinedResults = parseImprovedTranscript(rawText, transcriptSegments);
        // } else {
        //   // ===== CASE 2: > 20p → chia làm 2 call =====
        //   const mid = Math.floor(transcriptSegments.length / 2);
        //   const firstHalf = transcriptSegments.slice(0, mid);
        //   const secondHalf = transcriptSegments.slice(mid);
        //   const makePromptForPart = (segmentsPart: any[], label: string) => {
        //     const partText = transcriptArrayToText(segmentsPart);
        //     return `
        //     1) Video cuộc họp.
        //     2) MỘT PHẦN transcript sơ bộ (${label}) rất không chính xác (có thể sai tới 90% hoặc hơn).
        //     Transcript này chỉ dùng để: 
        //     - Gợi ý vị trí thời gian tương đối của câu.
        //     - Gợi ý Speaker ID ban đầu (nếu có).
        //     Nhiệm vụ:
        //     - NGHE video để ghi lại nội dung thoại CHÍNH XÁC bằng tiếng Việt cho PHẦN NÀY.
        //     - Sửa lỗi chính tả, ngữ pháp, dấu câu.
        //     - Cố gắng giữ Speaker ID giống transcript sơ bộ nếu hợp lý.
        //     - Nếu không thể xác định được người nói, dùng "unknown" nhưng hạn chế unknown nhất có thể.
        //     - Mỗi phần tử trong JSON phải có:
        //       - "startTs": thời điểm bắt đầu câu nói (miliseconds, ước lượng tương đối).
        //       - "speakerId": UUID, tên, hoặc "unknown".
        //       - "text": nội dung câu đã được sửa.
        //     DANH SÁCH NGƯỜI THAM GIA (để hiểu ngữ cảnh, không bắt buộc phải khớp):
        //     ${createSpeakerMapping(streamMetadata.participants)}

        //     TRANSCRIPT SƠ BỘ PHẦN ${label} (RẤT NHIỀU LỖI):
        //     ${partText}

        //     BẮT BUỘC: 
        //     - Chỉ trả về JSON array, KHÔNG thêm giải thích.
        //     - Chỉ xử lý PHẦN ${label}, không tóm tắt toàn bộ cuộc họp.  
        //     - Phải tuân theo schema đã mô tả.
        //     `.trim();
        //   };

        //   // Gọi tuần tự 2 lần để tránh áp lực rate limit
        //   const firstResponse = await callGeminiWithRetry(ai, {
        //     model,
        //     generationConfig: {
        //       temperature: 0.1,
        //       responseMimeType: "application/json",
        //       responseSchema: transcriptSchema,
        //       maxOutputTokens: 8192,
        //     },
        //     contents: [
        //       {
        //         role: "user",
        //         parts: [
        //           { fileData: { fileUri: uploadResult.uri || "", mimeType: fileMimeType } },
        //           { text: makePromptForPart(firstHalf, "1") },
        //         ],
        //       },
        //     ],
        //   });

        //   const secondResponse = await callGeminiWithRetry(ai, {
        //     model,
        //     generationConfig: {
        //       temperature: 0.1,
        //       responseMimeType: "application/json",
        //       responseSchema: transcriptSchema,
        //       maxOutputTokens: 8192,
        //     },
        //     contents: [
        //       {
        //         role: "user",
        //         parts: [
        //           { fileData: { fileUri: uploadResult.uri || "", mimeType: fileMimeType } },
        //           { text: makePromptForPart(secondHalf, "2") },
        //         ],
        //       },
        //     ],
        //   });
        //   const rawText1 = firstResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
        //   const rawText2 = secondResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";

        //   const parsed1 = parseImprovedTranscript(rawText1, firstHalf);
        //   const parsed2 = parseImprovedTranscript(rawText2, secondHalf);

        //   combinedResults = [...parsed1, ...parsed2];
        // }
        improvedTranscript = combinedResults;
        // console.log("✅ Hoàn tất cải thiện transcript với", improvedTranscript.length, "segments");
        // STEP 2: Normalize speaker IDs (tên → UUID)
        if (streamMetadata?.participants?.length > 0) {
          improvedTranscript = normalizeSpeakerIds(
            improvedTranscript,
            streamMetadata.participants
          );
          console.log('📊 Speaker IDs normalized to UUIDs');
        } else {
          console.log('⚠️ Không có participants data, giữ nguyên speaker IDs');
        }

        // ✅ STEP 3: Validation
        const unknownCount = improvedTranscript.filter((s: any) => s.speakerId === 'unknown').length;
        const totalCount = improvedTranscript.length;
        const unknownPercent = totalCount > 0 ? (unknownCount / totalCount) * 100 : 0;
        // console.log(`📊 Final result: ${totalCount} segments, ${unknownCount} unknown (${unknownPercent.toFixed(1)}%)`);
        // ✅ STEP 4: Fallback nếu quá nhiều unknown
        if (unknownPercent > 80 && totalCount > 0) {
          console.warn('⚠️ Too many unknown speakers (>80%). Using original transcript.');
          improvedTranscript = transcriptSegments.map((seg: any) => ({
            ...seg,
            duration: (seg.stopTs - seg.startTs) / 1000,
          }));
        } else if (totalCount > 0) {
          // console.log('✅ Transcript processing successful! Sample (first 5):');
          improvedTranscript.slice(0, 5).forEach((seg: any, i: number) => {
            const speakerPreview = seg.speakerId.length > 30
              ? seg.speakerId.substring(0, 30) + '...'
              : seg.speakerId;
            const textPreview = seg.text.substring(0, 40);
            console.log(`  ${i + 1}. [${formatTimestamp(seg.startTs)}] ${speakerPreview}: ${textPreview}...`);
          });
        }

      } catch (videoError: any) {
        console.error('❌ Video processing failed:', videoError.message);

        // Cleanup
        for (const fileName of uploadedFiles) {
          try {
            await ai.files.delete({ name: fileName });
          } catch (e) {
            console.warn('Failed to cleanup:', fileName);
          }
        }

        // Fallback: dùng transcript gốc
        console.warn('Fallback: sử dụng transcript gốc');
        improvedTranscript = transcriptSegments.map((seg: any) => ({
          ...seg,
          duration: (seg.stopTs - seg.startTs) / 1000,
        }));
      } finally {
        // Cleanup all files
        // console.log('🗑️ Cleaning up...');
        for (const fileName of uploadedFiles) {
          try {
            await ai.files.delete({ name: fileName });
            // console.log(`✅ Deleted ${fileName}`);
          } catch (e) {
            console.warn(`⚠️ Failed to delete ${fileName}`);
          }
        }
      }
    } else {
      // No video
      improvedTranscript = transcriptSegments.map((seg: any) => ({
        ...seg,
        duration: (seg.stopTs - seg.startTs) / 1000,
      }));
    }

    // ===== BƯỚC 2: Generate Summary + Todo =====
    console.log('🤖 Bước 2: Tạo summary và todo...');

    const finalTranscriptText = transcriptArrayToText(improvedTranscript);
    const projectTasksJson = JSON.stringify(tasks);
    console.log(`🗂️ Project tasks count : ${tasks?.length || 0}`);
    let summary = "Không có kết quả.";
    let todoList: any[] = [];

    try {
      const [summaryResponse, todoResponse] = await Promise.all([
        callGeminiWithRetry(
          ai,
          {
            model: "gemini-2.0-flash-exp",
            generationConfig: { temperature: 0.3 },
            contents: [{
              role: "user",
              parts: [{
                text: `
Hãy phân tích transcript cuộc họp sau và tạo một bản tóm tắt chi tiết bằng tiếng Việt.

NGƯỜI THAM GIA:
${createSpeakerMapping(streamMetadata?.participants || [])}

Yêu cầu:
- Tóm tắt nội dung chính của cuộc họp (3-5 câu)
- **KHÔNG sử dụng Speaker ID trong tóm tắt** (dùng tên người)
- Liệt kê các chủ đề được thảo luận
- Định dạng rõ ràng với các mục bullet point

Transcript:
${finalTranscriptText}

Hãy trả về summary hoàn chỉnh:
                `.trim()
              }]
            }]
          },
          2
        ),

        callGeminiWithRetry(
          ai,
          {
            model: "gemini-2.0-flash-exp",
            generationConfig: { temperature: 0.1 },
            contents: [{
              role: "user",
              parts: [{
                text: `
Dựa trên transcript cuộc họp, hãy tạo danh sách todo/action items bằng tiếng Việt.

TASKS ĐÃ CÓ:
${projectTasksJson}

MAPPING NGƯỜI:
${createSpeakerMapping(streamMetadata?.participants || [])}

Yêu cầu:
- Xác định các nhiệm vụ/công việc được đề cập
- assigneeId = UUID (Speaker ID từ transcript)
- Thời gian DD-MM-YYYY (không có → null)
- referenceTaskIds từ tasks đã có (không liên quan → [])
- Mỗi todo chỉ mô tả 1 hành động cụ thể, KHÔNG gộp nhiều việc trong 1 todo
- Tự động tách các câu/liệt kê có nhiều hành động thành nhiều todo nhỏ..

**BẮT BUỘC: Trả về ONLY JSON array, KHÔNG markdown.**

Format:
[
  {
    "id": "todo-1",
    "title": "...",
    "description": "...",
    "assigneeId": "uuid",
    "startDate": null,
    "endDate": null,
    "referenceTaskIds": []
  }
]

CHÚ Ý:
- id: tự động tăng "todo-1", "todo-2", ...
- assigneeId: lấy từ Speaker ID trong transcript
- Nếu không rõ ai làm, để null
- startDate/endDate: format DD-MM-YYYY hoặc null
- Chỉ trả về JSON array, không text giải thích

Transcript:
${finalTranscriptText}

JSON:
                `.trim()
              }]
            }]
          },
          2
        ),
      ]);

      // Process summary
      const rawSummary = summaryResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "Không có kết quả.";
      summary = mapSpeakerIdsToNames(rawSummary, streamMetadata?.participants || []);

      // Process todo
      const todoRawText = todoResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
      try {
        let cleanedTodo = todoRawText.trim();

        // Remove markdown if exists
        if (cleanedTodo.startsWith("```json")) {
          cleanedTodo = cleanedTodo.replace(/```json\n?/g, "").replace(/```$/, "");
        } else if (cleanedTodo.startsWith("```")) {
          cleanedTodo = cleanedTodo.replace(/```$/, "");
        }

        // Tìm JSON array
        const firstBracket = cleanedTodo.indexOf('[');
        const lastBracket = cleanedTodo.lastIndexOf(']');

        if (firstBracket !== -1 && lastBracket !== -1) {
          cleanedTodo = cleanedTodo.substring(firstBracket, lastBracket + 1);
          todoList = JSON.parse(cleanedTodo);
          console.log('✅ Todo parsed:', todoList.length, 'items');
        }
      } catch (parseError) {
        console.error("❌ Parse todo failed:", parseError);
        todoList = [];
      }
    } catch (error: any) {
      console.warn("⚠️ Bước 2 failed:", error.message);
    }

    console.log('🎉 Xử lý hoàn tất!');

    return NextResponse.json({
      success: true,
      data: {
        improvedTranscript,
        summary,
        todoList,
      },
    });

  } catch (error: any) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Không thể xử lý yêu cầu",
        userMessage: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại."
      },
      { status: 500 }
    );
  }
}
