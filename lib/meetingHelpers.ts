import { Call } from "@stream-io/video-react-sdk";

export const mapCallStatus = (call?: Call) => {
    if (!call) return "Unknown";
    const starts = call.state.startsAt;
    if (starts && new Date(starts) < new Date()) return "Finished";
    if (starts && new Date(starts) > new Date()) return "Scheduled";
    return "Ongoing";
};

export const formatDateTime = (
    date: Date | string | undefined,
    includeTime: boolean = false
) => {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;

    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();

    const dateStr = `${day}/${month}/${year}`;

    if (includeTime) {
        const hours = d.getHours().toString().padStart(2, "0");
        const minutes = d.getMinutes().toString().padStart(2, "0");
        return `${dateStr} - ${hours}:${minutes}`;
    }

    return dateStr;
};

export const formatDuration = (ms: number) => {
    if (ms < 0 || !Number.isFinite(ms)) return "-";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
};

export const formatTimestamp = (timestamp: number) => {
    const seconds = Math.floor(timestamp / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
};

export const getStatusColor = (status: string) => {
    switch (status) {
        case "Scheduled":
            return "#47D69D";
        case "Finished":
            return "#A41F39";
        case "Ongoing":
            return "#ebca25";
        default:
            return "#6b7280";
    }
};

export const getStatusLabel = (status: string) => {
    switch (status) {
        case "Scheduled":
            return "Scheduled";
        case "Finished":
            return "Finished";
        case "Ongoing":
            return "Ongoing";
        default:
            return status;
    }
};

export const parseTranscription = (transcriptionString?: string): any[] => {
    if (!transcriptionString) return [];
    try {
        return JSON.parse(transcriptionString);
    } catch (error) {
        return [];
    }
};

export const getSpeakerName = (speakerId: string, attendees: any[]) => {
    if (!attendees) return speakerId;
    const attendee = attendees.find((att: any) => att.id === speakerId);
    return attendee?.fullName || speakerId;
};

export const mapAssigneeIdToName = (assigneeId: string, attendees: any[]): string => {
    if (!assigneeId || !attendees) return assigneeId;
    const attendee = attendees.find((att: any) => att.id === assigneeId);
    return attendee?.fullName || attendee?.email || assigneeId;
};

export const getTodoAssigneeName = (todo: any): string => {
    if (todo.assignee?.fullName) return todo.assignee.fullName;
    if (todo.assignee?.email) return todo.assignee.email;
    if (todo.assigneeId) return todo.assigneeId;
    return "Unassigned";
};

export const getTodoAssigneeId = (todo: any): string | null => {
    if (todo.assigneeId) return todo.assigneeId;
    if (todo.assignee?.id) return todo.assignee.id;
    return null;
};

export const mapSummaryAssigneeIds = (summaryText: string, attendees: any[]): string => {
    if (!summaryText || !attendees) return summaryText;
    let processedSummary = summaryText;
    attendees.forEach((attendee: any) => {
        const regex = new RegExp(attendee.id, "g");
        processedSummary = processedSummary.replace(
            regex,
            attendee.fullName || attendee.email
        );
    });
    return processedSummary;
};

export const formatDate = (dateString?: string | Date): string => {
    if (!dateString) return "--/--/----";
    const dateObj = typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(dateObj.getTime())) return "--/--/----";
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const yyyy = dateObj.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

export const isValidTodo = (todo: any) => {
    return todo.status !== 2 && todo.status !== 3; // Not ConvertedToTask or Deleted
};

export const getTodoStatusStyle = (status: number) => {
    switch (status) {
        case 0: // Generated
            return {
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                color: "white",
            };
        case 1: // UnderReview
            return {
                background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                color: "white",
            };
        case 2: // ConvertedToTask
            return {
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
            };
        case 3: // Deleted
            return {
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "white",
            };
        default:
            return {
                background: "#f3f4f6",
                color: "#6b7280",
            };
    }
};

export const getTodoStatusLabel = (statusDisplay: string) => {
    switch (statusDisplay) {
        case "Generated":
            return "New";
        case "UnderReview":
            return "Edited";
        case "ConvertedToTask":
            return "Converted to task";
        case "Deleted":
            return "Deleted";
        default:
            return statusDisplay;
    }
};
