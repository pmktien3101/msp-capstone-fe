"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useUser } from "@/hooks/useUser";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Member, Participant } from "@/types";
import { projectService } from "@/services/projectService";
import { milestoneService } from "@/services/milestoneService";
import { meetingService } from "@/services/meetingService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const formSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  description: z.string().min(1, "Vui lòng nhập mô tả"),
  datetime: z.date().min(new Date(), "Vui lòng chọn ngày giờ hợp lệ"),
  participants: z
    .array(z.string())
    .min(1, "Vui lòng chọn ít nhất 1 người tham gia"),
  milestoneId: z.string().optional(),
});

interface MeetingFormProps {
  onClose?: () => void;
  onCreated?: (call: Call | any) => void;
  projectId: string;
}

interface ProjectMemberResponse {
  id: string;
  projectId: string;
  userId: string;
  member: {
    id: string;
    userName: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    avatarUrl: string | null;
    role: string;
    createdAt: string;
  };
  joinedAt: string;
  leftAt: string | null;
}

interface Milestone {
  id: string;
  name: string;
  projectId: string;
}

export default function MeetingForm({
  onClose,
  onCreated,
  projectId,
}: MeetingFormProps) {
  const { userId } = useUser();
  const client = useStreamVideoClient();
  const [callDetails, setCallDetails] = useState<Call>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      datetime: undefined,
      participants: [],
      milestoneId: "",
    },
  });

  const convertToParticipants = (
    members: ProjectMemberResponse[]
  ): Participant[] => {
    return members
      .filter((member) => member.member.role !== "ProjectManager")
      .map((member) => ({
        id: member.member.id,
        role: member.member.role,
        image: member.member.avatarUrl || "",
        email: member.member.email,
        name: member.member.fullName,
      }));
  };

  const convertToMilestones = (milestones: any[]): Milestone[] => {
    return milestones.map((milestone) => ({
      id: milestone.id,
      name: milestone.name,
      projectId: milestone.projectId,
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      if (!projectId) {
        toast.error("Không có projectId");
        return;
      }
      setIsLoadingParticipants(true);
      setIsLoadingMilestones(true);
      try {
        const membersResult = await projectService.getProjectMembers(projectId);
        if (membersResult.success && membersResult.data) {
          setParticipants(convertToParticipants(membersResult.data as any));
        } else setParticipants([]);
      } catch {
        toast.error("Không thể tải danh sách thành viên dự án");
        setParticipants([]);
      } finally {
        setIsLoadingParticipants(false);
      }

      try {
        const milestonesResult =
          await milestoneService.getMilestonesByProjectId(projectId);
        if (milestonesResult.success && milestonesResult.data) {
          setMilestones(convertToMilestones(milestonesResult.data));
        } else setMilestones([]);
      } catch {
        setMilestones([]);
      } finally {
        setIsLoadingMilestones(false);
      }
    };
    loadData();
  }, [projectId]);

  const handleParticipantChange = (participantId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId]
    );
  };

  useEffect(() => {
    form.setValue("participants", selectedParticipants, {
      shouldValidate: true,
    });
  }, [selectedParticipants, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!client || !userId) {
      toast.error("Stream client chưa được khởi tạo");
      return;
    }

    setIsCreating(true);

    try {
      const meetingId = crypto.randomUUID();
      const allParticipants = [...new Set([userId, ...selectedParticipants])];

      const meetingData = {
        meetingId,
        createdById: userId,
        projectId,
        milestoneId: values.milestoneId || null,
        title: values.title,
        description: values.description,
        startTime: values.datetime.toISOString(),
        attendeeIds: allParticipants,
      };

      const dbResult = await meetingService.createMeeting(meetingData);
      if (!dbResult.success)
        throw new Error(
          dbResult.error || "Không thể tạo meeting trong database"
        );

      const call = client.call("default", meetingId);
      if (!call) throw new Error("Failed to create call");

      await call.getOrCreate({
        data: {
          custom: meetingData,
          starts_at: values.datetime.toISOString(),
          members: allParticipants.map((id) => ({ user_id: id })),
        },
      });

      setCallDetails(call);
      onCreated?.(call);
      toast.success("Tạo cuộc họp thành công!");
    } catch (error: any) {
      toast.error(error.message || "Không thể tạo cuộc họp");
    } finally {
      setIsCreating(false);
    }
  }

  const baseUrl =
    (typeof window !== "undefined" && window.location.origin) ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "";
  const meetingLink = callDetails ? `${baseUrl}/meeting/${callDetails.id}` : "";

  return (
    <div style={styles.overlay}>
      <div style={styles.backdrop} onClick={onClose} />
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeButton} aria-label="Close">
          ✕
        </button>
        <div style={styles.header}>
          <h3 style={styles.title}>Tạo cuộc họp mới</h3>
          <p style={styles.subtitle}>
            Vui lòng điền thông tin để lên lịch cuộc họp cho dự án
          </p>
        </div>

        {callDetails ? (
          <div style={styles.successContainer}>
            <h2 style={styles.successTitle}>Đã tạo cuộc họp!</h2>
            <p>Cuộc họp đã được lên lịch thành công.</p>
            <div style={styles.buttonGroup}>
              <Button
                onClick={() => {
                  if (meetingLink) {
                    navigator.clipboard.writeText(meetingLink);
                    toast.success("Đã sao chép link!");
                  }
                }}
                style={styles.primaryButton}
              >
                Sao chép link cuộc họp
              </Button>
              <Button
                onClick={() =>
                  window.open(`/meeting/${callDetails?.id}`, "_blank")
                }
                style={styles.primaryButton}
              >
                Vào phòng họp
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} style={styles.form}>
            {/* Tiêu đề */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Tiêu đề cuộc họp</label>
              <Input
                placeholder="Nhập tiêu đề cuộc họp"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p style={styles.error}>
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* Mô tả */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Mô tả</label>
              <Textarea
                placeholder="Nhập mô tả nội dung cuộc họp"
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p style={styles.error}>
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Ngày giờ */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Ngày & giờ họp</label>
              <div style={styles.dateWrapper}>
                <DatePicker
                  selected={form.watch("datetime")}
                  onChange={(date) => form.setValue("datetime", date as Date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="dd/MM/yyyy HH:mm"
                  // use the project's Input so the date input matches other inputs
                  customInput={<Input style={styles.dateInput} />}
                />
              </div>
              {form.formState.errors.datetime && (
                <p style={styles.error}>
                  {form.formState.errors.datetime.message as string}
                </p>
              )}
            </div>

            {/* Cột mốc */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Cột mốc (không bắt buộc)</label>
              {isLoadingMilestones ? (
                <div style={styles.loadingText}>
                  Đang tải danh sách cột mốc...
                </div>
              ) : (
                <select {...form.register("milestoneId")} style={styles.select}>
                  <option value="">-- Chọn cột mốc --</option>
                  {milestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Participants */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Người tham gia</label>
              {isLoadingParticipants ? (
                <div style={styles.loadingText}>
                  Đang tải danh sách thành viên...
                </div>
              ) : participants.length === 0 ? (
                <div style={styles.loadingText}>
                  Không có thành viên nào trong dự án
                </div>
              ) : (
                <div style={styles.participantList}>
                  {participants.map((p) => (
                    <div key={p.id} style={styles.participantItem}>
                      <input
                        type="checkbox"
                        id={`participant-${p.id}`}
                        checked={selectedParticipants.includes(p.id)}
                        onChange={() => handleParticipantChange(p.id)}
                      />
                      <label
                        htmlFor={`participant-${p.id}`}
                        style={styles.participantLabel}
                      >
                        {p.email} - {p.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {form.formState.errors.participants && (
                <p style={styles.error}>
                  {form.formState.errors.participants.message}
                </p>
              )}
            </div>

            <div style={styles.footer}>
              {onClose && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={onClose}
                  style={styles.cancelButton}
                >
                  Hủy
                </Button>
              )}
              <Button
                type="submit"
                style={styles.primaryButton}
                disabled={isCreating}
              >
                {isCreating ? "Đang tạo..." : "Tạo cuộc họp"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export const CreateMeetingModal = MeetingForm;

// 🎨 STYLE OBJECTS
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(1px)",
  },
  modal: {
    position: "relative",
    background: "#fff",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    padding: 24,
    maxWidth: 600,
    width: "100%",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    zIndex: 10,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    fontSize: 14,
    color: "#6b7280",
    cursor: "pointer",
    background: "none",
    border: "none",
  },
  header: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 600 },
  subtitle: { fontSize: 12, color: "#6b7280" },
  successContainer: { textAlign: "center" },
  successTitle: { fontSize: 22, fontWeight: 600, color: "#9a3412" },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: "#f97316",
    color: "white",
    cursor: "pointer",
    padding: "8px 14px",
    borderRadius: 8,
    fontWeight: 600,
    minWidth: 140,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    maxHeight: "60vh",
    overflowY: "auto",
  },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 14, fontWeight: 500 },
  error: { fontSize: 13, color: "#ef4444" },
  loadingText: { fontSize: 13, color: "#6b7280" },
  select: { border: "1px solid #d1d5db", borderRadius: 6, padding: 8 },
  dateWrapper: { marginBottom: 8 },
  dateInput: {
    width: "100%",
    borderRadius: 6,
    padding: "8px 10px",
    border: "1px solid #d1d5db",
    fontSize: 14,
    color: "#111827",
  },
  participantList: {
    border: "1px solid #d1d5db",
    borderRadius: 6,
    padding: 8,
    maxHeight: 160,
    overflowY: "auto",
  },
  participantItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 0",
  },
  participantLabel: { fontSize: 14, color: "#374151" },
  cancelButton: {
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    color: "#374151",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },
  footer: { display: "flex", justifyContent: "flex-end", gap: 12 },
};
