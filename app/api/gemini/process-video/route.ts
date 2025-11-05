import { NextRequest, NextResponse } from 'next/server';
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
                throw new Error('Response từ Gemini rỗng');
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
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    throw new Error('Retry logic thất bại');
};

// ===== HELPER FUNCTIONS =====
/**
 * Convert video URL thành base64 string
 */
const videoUrlToBase64 = async (videoUrl: string): Promise<string> => {
    console.log('📥 Đang tải video từ URL');

    try {
        const response = await fetch(videoUrl, {
            method: 'GET',
            signal: AbortSignal.timeout(60000), // Timeout 60 giây
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Kiểm tra kích thước file
        const contentLength = response.headers.get('content-length');
        const fileSizeInMB = contentLength ? parseInt(contentLength) / (1024 * 1024) : 0;

        // if (fileSizeInMB > 20) {
        //     throw new Error(`Video quá lớn: ${fileSizeInMB.toFixed(2)}MB. Tối đa 20MB.`);
        // }

        if (fileSizeInMB > 0) {
            console.log(`📊 Kích thước video: ${fileSizeInMB.toFixed(2)}MB`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64 = btoa(
            new Uint8Array(arrayBuffer).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ''
            )
        );

        console.log('✅ Video đã được convert sang base64');
        return base64;
    } catch (error: any) {
        console.error('❌ Lỗi videoUrlToBase64:', error.message);
        throw new Error(`Không thể tải video: ${error.message}`);
    }
};

/**
 * Format timestamp từ milliseconds sang MM:SS hoặc HH:MM:SS
 */
const formatTimestamp = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
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
        .join('\n');
};

/**
 * Parse improved transcript text thành array format
 */
const parseImprovedTranscript = (improvedText: string, originalSegments: any[]) => {
    const lines = improvedText.split('\n').filter(line => line.trim());
    const result: any[] = [];
    const regex = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*Speaker\s*([^\s:]+):\s*(.+)/i;

    lines.forEach((line, index) => {
        const match = line.match(regex);
        if (match) {
            const [, timestamp, speakerId, text] = match;
            const parts = timestamp.split(':').map(Number);
            let startMs = 0;

            if (parts.length === 3) {
                startMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
            } else {
                startMs = (parts[0] * 60 + parts[1]) * 1000;
            }

            const nextMatch = lines[index + 1]?.match(regex);
            let stopMs = startMs + 3000;

            if (nextMatch) {
                const nextParts = nextMatch[1].split(':').map(Number);
                if (nextParts.length === 3) {
                    stopMs = (nextParts[0] * 3600 + nextParts[1] * 60 + nextParts[2]) * 1000;
                } else {
                    stopMs = (nextParts[0] * 60 + nextParts[1]) * 1000;
                }
            }

            result.push({
                speakerId,
                type: 'speech',
                text: text.trim(),
                startTs: startMs,
                stopTs: stopMs,
                duration: (stopMs - startMs) / 1000,
            });
        }
    });

    return result.length > 0 ? result : originalSegments.map(seg => ({
        ...seg,
        duration: (seg.stopTs - seg.startTs) / 1000,
    }));
};

// Hàm để cập nhật speakerIds trong improvedTranscript dựa trên originalTranscriptions
function updateSpeakerIds(originalTrans: any[], improvedTrans: any[]) {
    // 1. Lấy unique speakerId theo thứ tự xuất hiện
    const speakerMap: string[] = [];
    const seen = new Set();
    for (const seg of originalTrans) {
        if (!seen.has(seg.speakerId)) {
            speakerMap.push(seg.speakerId);
            seen.add(seg.speakerId);
        }
    }
    // 2. Gán lại speakerId cho improved transcript (cứ lặp lại đúng thứ tự speakerMap)
    return improvedTrans.map((seg, i) => ({
        ...seg,
        speakerId: speakerMap[i % speakerMap.length]
    }));
}

// ===== API ROUTE HANDLER =====
export async function POST(request: NextRequest) {
    console.log('🚀 API Route: process-video bắt đầu');

    try {
        const { videoUrl, transcriptSegments, tasks } = await request.json();

        console.log('📋 Request:', {
            hasVideoUrl: !!videoUrl,
            transcriptCount: transcriptSegments?.length,
            taskCount: tasks?.length || 0,
        });

        // Validate input
        if (!videoUrl || !transcriptSegments) {
            return NextResponse.json(
                { success: false, error: 'Thiếu videoUrl hoặc transcriptSegments' },
                { status: 400 }
            );
        }

        // Kiểm tra API key
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ Không tìm thấy GEMINI_API_KEY');
            return NextResponse.json(
                { success: false, error: 'GEMINI_API_KEY chưa được cấu hình' },
                { status: 500 }
            );
        }

        console.log('✅ GEMINI_API_KEY tồn tại');

        // Khởi tạo AI client
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        // Convert video sang base64
        console.log('📹 Bước 1: Đang convert video sang base64...');
        const base64 = await videoUrlToBase64(videoUrl);

        const transcriptText = transcriptArrayToText(transcriptSegments);
        console.log('📝 Transcript đã chuẩn bị, độ dài:', transcriptText.length);

        // ===== BƯỚC 2: Cải thiện Transcript với RETRY =====
        console.log('🤖 Bước 2: Đang cải thiện transcript với Gemini 2.5 Pro (có video)...');

        let improvedText = "";
        let improvedTranscript = transcriptSegments;

        try {
            const improvedResponse = await callGeminiWithRetry(
                ai,
                {
                    model: "gemini-2.5-pro",
                    contents: [{
                        role: "user",
                        parts: [
                            {
                                text: `
                                    Tôi có một đoạn transcript sơ bộ của video này. Hãy xem video và dựa vào transcript tôi cung cấp để tạo ra một transcript hoàn chỉnh, chính xác hơn bằng tiếng Việt.

                                    Transcript sơ bộ:
                                    ${transcriptText}

                                    Yêu cầu:
                                    - Sửa lại các từ sai, thiếu hoặc không rõ ràng
                                    - Thêm dấu câu chính xác
                                    - Chia đoạn văn hợp lý
                                    - Giữ nguyên ý nghĩa và ngữ cảnh
                                    - Định dạng rõ ràng, dễ đọc
                                    - Giữ nguyên Speaker ID như trong transcript gốc
                                    
                                    Trả về transcript đã cải thiện theo định dạng:
                                    [timestamp] Speaker X: <nội dung đã sửa>

                                    Transcript đã cải thiện:
                                `
                            },
                            {
                                inlineData: {
                                    mimeType: "video/mp4",
                                    data: base64,
                                },
                            },
                        ],
                    }],
                },
                3 // Retry tối đa 3 lần
            );

            improvedText = improvedResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            console.log('✅ Đã nhận được improved transcript, độ dài:', improvedText.length);
            console.log('📄 Improved Transcript Preview:', improvedText);
            improvedTranscript = parseImprovedTranscript(improvedText, transcriptSegments);
            // improvedTranscript = updateSpeakerIds(transcriptSegments, improvedTranscript);
            console.log('✅ Đã parse improved transcript thành array: ', improvedTranscript.length, 'segments');
            console.log('📄 Improved Transcript Array Preview:', improvedTranscript.slice(0, 3));
            improvedText = transcriptArrayToText(improvedTranscript);

        } catch (error: any) {
            console.warn('⚠️ Bước 2 thất bại sau khi retry, sử dụng transcript gốc:', error.message);
            // Fallback: Sử dụng transcript gốc nếu improve failed
            improvedText = transcriptText;
            improvedTranscript = transcriptSegments.map((seg: { stopTs: number; startTs: number; }) => ({
                ...seg,
                duration: (seg.stopTs - seg.startTs) / 1000,
            }));
        }

        console.log('✅ Đã parse improved transcript:', improvedTranscript.length, 'segments');

        // ===== BƯỚC 3: Tạo Summary + Todo List với RETRY (parallel) =====
        console.log('🤖 Bước 3: Đang tạo summary và todo list với Gemini 2.0 Flash (parallel, chỉ text)...');

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
                        contents: [{
                            role: "user",
                            parts: [{
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
                                `
                            }],
                        }],
                    },
                    2 // Retry tối đa 2 lần cho summary
                ),

                // Todo List với retry
                callGeminiWithRetry(
                    ai,
                    {
                        model: "gemini-2.0-flash",
                        contents: [{
                            role: "user",
                            parts: [{
                                text: `
                                    Dựa trên transcript cuộc họp sau, hãy tạo một danh sách todo/action items chi tiết bằng tiếng Việt.
                                    Các task đã có trong project (ProjectTasks):
                                    ${projectTasksJson}
                                    Yêu cầu:
                                    - Xác định tất cả các nhiệm vụ/công việc cần làm được đề cập
                                    - Gán người chịu trách nhiệm cho từng task (dựa vào Speaker ID trong transcript)
                                    - Ước lượng deadline nếu được nhắc đến (format: DD-MM-YYYY)
                                    - Nếu không có deadline rõ ràng, để null
                                    - startDate mặc định null nếu không được nhắc
                                    - endDate mặc định null nếu không được nhắc
                                    - assigneeId lấy từ Speaker ID trong transcript, mặc định là null nếu không rõ
                                    - Mỗi task nên ngắn gọn, rõ ràng
                                    - Khi sinh todo mới, kiểm tra nó có liên quan/tiếp nối task cũ nào không. Nếu có, ghi rõ "[Việc cũ liên quan: <task title> - Ngày: <task startDate DD/MM/YYYY>]" vào trường description của todo.
                                    - Nếu còn bổ sung, hoàn thành, chia nhỏ từ task cũ thì ghi rõ.
                                    - Nếu không liên quan task nào, chỉ ghi mô tả todo như bình thường.

                                    **BẮT BUỘC: Trả về ONLY JSON array, KHÔNG có markdown, KHÔNG có text thừa.**

                                    Format JSON:
                                    [
                                      {
                                        "id": "todo-1",
                                        "title": "Tên task ngắn gọn",
                                        "description": "Mô tả. Nếu liên quan task cũ thì ghi rõ ở đầu description.",
                                        "assigneeId": "1",
                                        "startDate": "13-10-2025",
                                        "endDate": "20-10-2025"
                                      }
                                    ]

                                    CHÚ Ý:
                                    - id: tự động tăng "todo-1", "todo-2", ...
                                    - assigneeId: lấy từ Speaker ID trong transcript (ví dụ: "1", "4", "male-voice")
                                    - Nếu không rõ ai làm, để null
                                    - startDate/endDate: format DD-MM-YYYY hoặc null
                                    - Chỉ trả về JSON array, không có text giải thích

                                    Transcript:
                                    ${improvedText}

                                    JSON:
                                `
                            }],
                        }],
                    },
                    2 // Retry tối đa 2 lần cho todo
                ),
            ]);

            summary = summaryResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "Không có kết quả.";
            const todoRawText = todoResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";

            // Clean và parse todo list JSON
            try {
                let cleanedTodo = todoRawText.trim();
                // Xóa markdown code blocks nếu có
                if (cleanedTodo.startsWith('```json')) {
                    cleanedTodo = cleanedTodo.replace(/```json\n?/g, '').replace(/```/g, '');
                } else if (cleanedTodo.startsWith('```')) {
                    cleanedTodo = cleanedTodo.replace(/```/g, '');
                }

                todoList = JSON.parse(cleanedTodo.trim());
                console.log('✅ Todo list parsed thành công:', todoList.length, 'items');
            } catch (parseError) {
                console.error('❌ Không thể parse todo JSON:', parseError);
                todoList = [];
            }

        } catch (error: any) {
            console.warn('⚠️ Bước 3 thất bại một phần sau khi retry:', error.message);
            // Tiếp tục với kết quả partial (có thể có summary nhưng không có todo)
        }

        console.log('✅ Bước 3 hoàn thành: Summary và Todo list đã được tạo');

        // Trả về kết quả (ngay cả khi chỉ có partial results)
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
        console.error('❌ Lỗi API Route:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Không thể xử lý video'
            },
            { status: 500 }
        );
    }
}
