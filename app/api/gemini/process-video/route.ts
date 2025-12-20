import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// ===== CONSTANTS =====
const SHORT_VIDEO_DURATION = 10 * 60; // 10 phút
const MEDIUM_VIDEO_DURATION = 30 * 60; // 30 phút
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 2000;

// ===== TYPES =====
interface VideoMetadata {
  duration: number;
  size: number;
  estimatedProcessingTime: number;
}

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
// Có nhiều case cần xử lý:
// Case 1: [0:00] Speaker ace28354-cfa1-4b37-ab49-3d1a145235ff: text (UUID)
// Case 2: [0:00] ace28354-cfa1-4b37-ab49-3d1a145235ff: text (UUID)
// Case 3: [0:00] Huỳnh Trần Vũ Đạt: text (Tên có space)
// Case 4: [0:00] DatHuynh: text (Tên không có space)
// Case 5: [0:00] Speaker Huỳnh Trần Vũ Đạt: text (Tên có space và có chữ speaker ở trước)
// Case 6: [0:00] Speaker DatHuynh: text (Tên không có space và có chữ speaker ở trước)
const parseImprovedTranscript = (improvedText: string, originalSegments: any[]) => {
  if (!improvedText || improvedText.trim().length === 0) {
    console.warn('⚠️ improvedText rỗng, fallback về original');
    return originalSegments.map((seg) => ({
      ...seg,
      duration: (seg.stopTs - seg.startTs) / 1000,
    }));
  }

  const lines = improvedText.split("\n").filter((line) => line.trim());
  const result: any[] = [];

  // ✅ UNIVERSAL REGEX - Match format: [MM:SS] <anything>: <text>
  const regex = /^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.+?):\s*(.+)$/;

  console.log(`🔍 Parsing ${lines.length} lines from Gemini...`);

  let successCount = 0;
  let failCount = 0;

  lines.forEach((line, index) => {
    const match = line.match(regex);

    if (match) {
      const [, timestamp, speakerRaw, text] = match;
      let speakerId = speakerRaw.trim();

      // ✅ EXTRACT SPEAKER ID - Xử lý tất cả cases:

      // Case 1, 5, 6: Remove "Speaker " prefix if exists
      // "Speaker ace28354..." → "ace28354..."
      // "Speaker Huỳnh Trần Vũ Đạt" → "Huỳnh Trần Vũ Đạt"
      // "Speaker DatHuynh" → "DatHuynh"
      const speakerPrefixMatch = speakerId.match(/^Speaker\s+(.+)$/i);
      if (speakerPrefixMatch) {
        speakerId = speakerPrefixMatch[1].trim();
      }

      // ✅ Sau khi remove "Speaker ", speakerId có thể là:
      // - UUID: "ace28354-cfa1-4b37-ab49-3d1a145235ff" (Case 1, 2)
      // - Tên có space: "Huỳnh Trần Vũ Đạt" (Case 3, 5)
      // - Tên không space: "DatHuynh" (Case 4, 6)
      // - unknown: "unknown" (Case unknown)

      // Parse timestamp
      const parts = timestamp.split(":").map(Number);
      let startMs = 0;

      if (parts.length === 3) {
        startMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
      } else {
        startMs = (parts[0] * 60 + parts[1]) * 1000;
      }

      // Calculate stopMs
      const nextMatch = lines[index + 1]?.match(regex);
      let stopMs = startMs + 3000;

      if (nextMatch) {
        const nextTimestamp = nextMatch[1];
        const nextParts = nextTimestamp.split(":").map(Number);
        if (nextParts.length === 3) {
          stopMs = (nextParts[0] * 3600 + nextParts[1] * 60 + nextParts[2]) * 1000;
        } else {
          stopMs = (nextParts[0] * 60 + nextParts[1]) * 1000;
        }
      }

      result.push({
        speakerId: speakerId, // UUID, tên (có/không space), hoặc "unknown"
        type: "speech",
        text: text.trim(),
        startTs: startMs,
        stopTs: stopMs,
        duration: (stopMs - startMs) / 1000,
      });

      successCount++;
    } else {
      failCount++;
      if (failCount <= 3) {
        console.warn(`⚠️ Line ${index + 1} không match format:`, line.substring(0, 80));
      }
    }
  });

  console.log(`📊 Parse result: ${successCount} success, ${failCount} failed`);

  // ✅ Validate
  if (result.length === 0) {
    console.error('❌ Parse thất bại hoàn toàn (0 segments). Fallback về original.');
    return originalSegments.map((seg) => ({
      ...seg,
      duration: (seg.stopTs - seg.startTs) / 1000,
    }));
  }

  // ✅ Log sample để verify
  console.log('📄 Parsed sample (first 3):');
  result.slice(0, 3).forEach((seg, i) => {
    const speakerPreview = seg.speakerId.length > 30
      ? seg.speakerId.substring(0, 30) + '...'
      : seg.speakerId;
    console.log(`  ${i + 1}. [${formatTimestamp(seg.startTs)}] "${speakerPreview}": ${seg.text.substring(0, 40)}...`);
  });
  // Result trả về có dạng:
  // {
  //   speakerId: '', // UUID hoặc tên
  //   type: 'speech',
  //   text: 'Nội dung đã được sửa/cải thiện',
  //   startTs: 5000, // Timestamp bắt đầu (milliseconds)
  //   stopTs: 6000,  // Timestamp kết thúc (milliseconds)
  //   duration: 1    // Duration in seconds
  // }
  return result;
};

// ===== HELPER: Normalize speaker IDs (TÊN/UNKNOWN → UUID) =====
// Dùng cho: TRANSCRIPT ARRAY
const normalizeSpeakerIds = (segments: any[], participants: any[]): any[] => {
  if (!participants || participants.length === 0) {
    console.log('⚠️ Không có participants, giữ nguyên speaker IDs');
    return segments;
  }

  console.log('🔄 Normalizing speaker IDs to UUIDs...');

  const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

  let uuidCount = 0;
  let nameCount = 0;
  let unknownCount = 0;
  let mappedCount = 0;

  return segments.map(seg => {
    const speakerId = seg.speakerId;

    // ✅ Đã là UUID → Giữ nguyên
    if (uuidRegex.test(speakerId)) {
      uuidCount++;
      return seg;
    }

    // ✅ "unknown" → Giữ nguyên
    if (speakerId.toLowerCase() === 'unknown') {
      unknownCount++;
      return seg;
    }

    // ✅ Tên người → Map sang UUID
    nameCount++;

    const participant = participants.find((p: any) => {
      const userName = p.user?.name || p.user?.email || '';
      return userName.toLowerCase().trim() === speakerId.toLowerCase().trim();
    });

    if (participant) {
      mappedCount++;
      if (mappedCount <= 5) {
        console.log(`  ✓ "${speakerId}" → ${participant.user_id}`);
      }
      return {
        ...seg,
        speakerId: participant.user_id
      };
    }

    console.warn(`  ⚠️Không tìm thấy UUID cho: "${speakerId}"`);
    return seg;
  });
};

// ===== HELPER: Map speaker IDs to names =====
const mapSpeakerIdsToNames = (text: string, participants: any[]): string => {
  if (!participants || participants.length === 0) return text;

  let result = text;

  participants.forEach((participant: any) => {
    const userId = participant.user_id;
    const userName = participant.user?.name || participant.user?.email || 'Unknown';

    // Replace UUID với tên
    const regex = new RegExp(userId, 'gi');
    result = result.replace(regex, userName);
  });

  return result;
};

// ===== HELPER: Create speaker mapping =====
const createSpeakerMapping = (participants: any[]): string => {
  if (!participants || participants.length === 0) {
    return 'Không có thông tin người tham gia.';
  }

  return participants.map((p: any, index: number) => {
    const userId = p.user_id;
    const userName = p.user?.name || p.user?.email || 'Unknown';
    return `${index + 1}. ${userName} (ID: ${userId})`;
  }).join('\n');
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

    console.log('📋 Request:', {
      hasVideoUrl: !!videoUrl,
      hasVideoMetadata: !!videoMetadata,
      transcriptCount: transcriptSegments?.length,
      taskCount: tasks?.length || 0,
      participantsCount: streamMetadata?.participants?.length || 0
    });

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
    console.log('📝 Transcript prepared, length:', transcriptText.length);

    // ===== BƯỚC 1: Xử lý Video =====
    let improvedText = "";
    let improvedTranscript = transcriptSegments;
    const uploadedFiles: string[] = [];

    if (videoUrl && videoMetadata) {
      try {
        // Check video length
        if (videoMetadata.duration > MEDIUM_VIDEO_DURATION) {
          console.log('🚫 Video quá dài (> 30 phút) - Reject');
          return NextResponse.json({
            success: false,
            needsBackgroundProcessing: true,
            message: `Video quá dài (${Math.ceil(videoMetadata.duration / 60)} phút). ` +
              `Video dài hơn 30 phút cần xử lý nền.`,
          }, { status: 202 });
        }

        // ✅ LUÔN DÙNG GEMINI 2.5 PRO cho việc enhance transcript
        const model = "gemini-2.5-pro";
        const timeout = videoMetadata.duration >= SHORT_VIDEO_DURATION ? 300000 : 180000;

        console.log(`📹 Video processing - Model: ${model}, Timeout: ${timeout / 1000}s`);

        // Optimize URL for long videos
        let processUrl = videoUrl;
        if (videoMetadata.duration >= SHORT_VIDEO_DURATION && videoUrl.includes('cloudinary')) {
          processUrl = videoUrl.replace('/upload/', '/upload/q_auto:low,w_640/');
          console.log('📊 Optimized URL for long video');
        }

        // ✅ Fetch video
        console.log('📥 Đang tải video...');
        const videoResponse = await fetch(processUrl, {
          signal: AbortSignal.timeout(timeout)
        });

        if (!videoResponse.ok) {
          throw new Error(`Failed to fetch video: ${videoResponse.status}`);
        }

        const videoBlob = await videoResponse.blob();
        const videoFile = new File([videoBlob], "meeting-recording.mp4", {
          type: "video/mp4"
        });

        console.log('📊 Video:', {
          size: (videoFile.size / 1024 / 1024).toFixed(2) + ' MB',
          duration: `${Math.floor(videoMetadata.duration / 60)}:${String(Math.floor(videoMetadata.duration % 60)).padStart(2, '0')}`
        });

        // ✅ Upload to Gemini
        console.log('📤 Đang upload video lên Gemini...');
        const uploadResult = await ai.files.upload({
          file: videoFile,
          config: { displayName: "Meeting Recording" }
        });

        const fileName = uploadResult.name || '';
        uploadedFiles.push(fileName);

        // Wait for ACTIVE
        console.log('⏳ Đợi video processing...');
        let attempts = 0;
        let fileReady = false;
        let fileMimeType = '';

        while (attempts < 60 && !fileReady) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 2000));

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

        // ✅ Process với Gemini 2.5 Pro (PROMPT TỪ CODE CŨ + CẢI TIẾN)
        console.log('🤖 Đang cải thiện transcript với Gemini 2.5 Pro...');

        const hasParticipants = streamMetadata?.participants?.length > 0;
        console.log(`👥 Có thông tin người tham gia: ${hasParticipants}`);

        const promptText = hasParticipants
          ? `
              Tôi có một đoạn transcript sơ bộ của video này. Hãy xem video và dựa vào transcript tôi cung cấp để tạo ra một transcript hoàn chỉnh, chính xác hơn bằng tiếng Việt.

              DANH SÁCH NGƯỜI THAM GIA:
              ${createSpeakerMapping(streamMetadata.participants)}

              TRANSCRIPT SƠ BỘ:
              ${transcriptText}

              YÊU CẦU:

              1. **XEM VIDEO VÀ NGHE GIỌNG** để:
                - Sửa lỗi chính tả, ngữ pháp
                - Thêm dấu câu chính xác
                - Chia đoạn văn hợp lý
                - Giữ nguyên ý nghĩa và ngữ cảnh

              2. **VỀ SPEAKER ID**:
                - Nếu transcript gốc đã có Speaker ID (không phải "unknown") → **GIỮ NGUYÊN**
                - Nếu transcript gốc là "unknown" → Cố gắng xác định dựa vào:
                  * Giọng nói (nam/nữ, cao/thấp)
                  * Nội dung phát biểu
                  * So khớp với danh sách người tham gia
                - Nếu THỰC SỰ không thể xác định → giữ "unknown"

              3. **FORMAT OUTPUT**:
                - [MM:SS] Speaker <UUID>: <nội dung đã sửa>
                - Timestamp trong [ ]
                - Từ "Speaker" + space + UUID
                - GIỮ NGUYÊN timestamp gốc
                - Nội dung tiếng Việt, chính tả đúng
                - Định dạng rõ ràng, dễ đọc

              VÍ DỤ OUTPUT:
              [0:02] Speaker ace28354-cfa1-4b37-ab49-3d1a145235ff: nội dung speech của speaker tương ứng.
              [0:05] Speaker 25935558-5583-4c0d-98c5-ef1d78663fd6: nội dung speech của speaker tương ứng.

              QUAN TRỌNG:
              - CHỈ trả về transcript (KHÔNG giải thích)
              - Ưu tiên GIỮ NGUYÊN speaker gốc nếu có
              - Phải trả về đúng format OUTPUT đã yêu cầu ở trên

              Transcript đã cải thiện:
            `
          : `
              Tôi có một đoạn transcript sơ bộ của video này. Hãy xem video và dựa vào transcript tôi cung cấp để tạo ra một transcript hoàn chỉnh, chính xác hơn bằng tiếng Việt.

              Transcript sơ bộ:
              ${transcriptText}

              Yêu cầu:
              - Sửa lại các từ sai, thiếu hoặc không rõ ràng
              - Thêm dấu câu chính xác
              - Chia đoạn văn hợp lý
              - Giữ nguyên ý nghĩa và ngữ cảnh
              - Định dạng rõ ràng, dễ đọc
              - **GIỮ NGUYÊN Speaker ID như trong transcript gốc** (kể cả "unknown")

              Trả về transcript đã cải thiện theo định dạng:
              [timestamp] Speaker X: <nội dung đã sửa>

              Transcript đã cải thiện:
          `;

        const improvedResponse = await callGeminiWithRetry(
          ai,
          {
            model: model,
            contents: [{
              role: "user",
              parts: [
                {
                  fileData: {
                    fileUri: uploadResult.uri || '',
                    mimeType: fileMimeType
                  }
                },
                {
                  text: promptText.trim()
                }
              ]
            }]
          },
          3
        );

        // console.log('✅ Gemini response received:', improvedResponse.candidates?.[0]?.content?.parts?.[0]?.text);
        improvedText = improvedResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        // ✅ LOG RAW OUTPUT ĐỂ DEBUG
        console.log('📄 RAW GEMINI OUTPUT (first 500 chars):');
        console.log(improvedText.substring(0, 500));
        console.log('---');

        // Parse
        // STEP 1: Parse (universal - hỗ trợ mọi format)
        improvedTranscript = parseImprovedTranscript(improvedText, transcriptSegments);
        console.log('✅ Đã parse:', improvedTranscript.slice(0, 5), '...');
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
        console.log(`📊 Final result: ${totalCount} segments, ${unknownCount} unknown (${unknownPercent.toFixed(1)}%)`);
        // ✅ STEP 4: Fallback nếu quá nhiều unknown
        if (unknownPercent > 80 && totalCount > 0) {
          console.warn('⚠️ Too many unknown speakers (>80%). Using original transcript.');
          improvedTranscript = transcriptSegments.map((seg: any) => ({
            ...seg,
            duration: (seg.stopTs - seg.startTs) / 1000,
          }));
        } else if (totalCount > 0) {
          console.log('✅ Transcript processing successful! Sample (first 5):');
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
        console.log('🗑️ Cleaning up...');
        for (const fileName of uploadedFiles) {
          try {
            await ai.files.delete({ name: fileName });
            console.log(`✅ Deleted ${fileName}`);
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
