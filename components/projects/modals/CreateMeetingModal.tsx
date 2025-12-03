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
import { useMemberInMeetingLimitationCheck } from "@/hooks/useLimitationCheck";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/app/styles/meeting-modals.scss";

const formSchema = z.object({
  title: z.string().min(1, "Please enter a meeting title"),
  description: z.string(),
  datetime: z
    .date({
      message: "Please select a date and time",
    })
    .refine((date) => date > new Date(), {
      message: "Meeting time must be in the future",
    }),
  participants: z
    .array(z.string())
    .min(1, "Please select at least 1 participant"),
  milestoneId: z.string().optional(),
});

interface MeetingFormProps {
  onClose?: () => void;
  onCreated?: (call: Call | any) => void;
  projectId?: string;
  requireProjectSelection?: boolean;
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
  projectId: initialProjectId,
  requireProjectSelection = false,
}: MeetingFormProps) {
  const { userId } = useUser();
  const client = useStreamVideoClient();
  const { checkMemberInMeetingLimit } = useMemberInMeetingLimitationCheck();
  const [callDetails, setCallDetails] = useState<Call>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjectId || ""
  );
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

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

  // Fetch projects list if requireProjectSelection is true
  useEffect(() => {
    async function fetchProjects() {
      if (!requireProjectSelection) return;

      setIsLoadingProjects(true);
      try {
        const projectsResult = await projectService.getAllProjects();
        if (projectsResult.success && projectsResult.data) {
          setProjects(projectsResult.data.items || []);
        }
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setIsLoadingProjects(false);
      }
    }
    fetchProjects();
  }, [requireProjectSelection]);

  // Fetch project members and milestones when project is selected
  useEffect(() => {
    const loadData = async () => {
      if (!selectedProjectId) {
        setParticipants([]);
        setMilestones([]);
        return;
      }
      setIsLoadingParticipants(true);
      setIsLoadingMilestones(true);
      try {
        const membersResult = await projectService.getProjectMembers(
          selectedProjectId
        );
        if (membersResult.success && membersResult.data) {
          setParticipants(convertToParticipants(membersResult.data as any));
        } else setParticipants([]);
      } catch {
        toast.error("Không thể tải danh sách thành viên");
        setParticipants([]);
      } finally {
        setIsLoadingParticipants(false);
      }

      try {
        const milestonesResult =
          await milestoneService.getMilestonesByProjectId(selectedProjectId);
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
  }, [selectedProjectId]);

  const handleParticipantChange = (participantId: string) => {
    // Check if adding or removing
    const isAdding = !selectedParticipants.includes(participantId);

    if (isAdding) {
      // Check limitation before adding participant
      const newCount = selectedParticipants.length + 1;
      if (!checkMemberInMeetingLimit(newCount)) {
        // Limit exceeded, don't add
        return;
      }
    }

    // Update state
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

    // Final check: verify participant count doesn't exceed limit
    if (!checkMemberInMeetingLimit(selectedParticipants.length)) {
      return; // Limit exceeded, don't submit
    }

    setIsCreating(true);

    try {
      const meetingId = crypto.randomUUID();
      const allParticipants = [...new Set([userId, ...selectedParticipants])];

      if (!selectedProjectId) {
        toast.error("Vui lòng chọn một dự án");
        return;
      }

      const meetingData = {
        meetingId,
        createdById: userId,
        projectId: selectedProjectId,
        milestoneId: values.milestoneId || null,
        title: values.title,
        description: values.description,
        startTime: values.datetime.toISOString(),
        attendeeIds: values.participants,
      };

      const dbResult = await meetingService.createMeeting(meetingData);
      if (!dbResult.success)
        throw new Error(
          dbResult.error || "Unable to create meeting in database"
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
    process.env.NEXT_PUBLIC_FE_URL ||
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
          <h3 style={styles.title}>Create New Meeting</h3>
          <p style={styles.subtitle}>
            Please fill in the information to schedule a meeting for the project
          </p>
        </div>

        {callDetails ? (
          <div style={styles.successContainer}>
            <h2 style={styles.successTitle}>Cuộc họp đã được tạo!</h2>
            <p>Cuộc họp đã được lên lịch thành công.</p>
            <div style={styles.buttonGroup}>
              <Button
                onClick={() => {
                  if (meetingLink) {
                    navigator.clipboard.writeText(meetingLink);
                    toast.success("Đã sao chép liên kết!");
                  }
                }}
                style={styles.primaryButton}
              >
                Sao chép liên kết
              </Button>
              <Button
                onClick={() =>
                  window.open(`/meeting/${callDetails?.id}`, "_blank")
                }
                style={styles.primaryButton}
              >
                Join Meeting Room
              </Button>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={form.handleSubmit(onSubmit)} style={styles.form}>
              {/* Project Selection (only if requireProjectSelection is true) */}
              {requireProjectSelection && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Project *</label>
                  {isLoadingProjects ? (
                    <div style={styles.loadingText}>Loading projects...</div>
                  ) : (
                    <select
                      value={selectedProjectId}
                      onChange={(e) => {
                        setSelectedProjectId(e.target.value);
                        setSelectedParticipants([]);
                        form.setValue("participants", []);
                        form.setValue("milestoneId", "");
                      }}
                      style={styles.select}
                      required
                    >
                      <option value="">-- Select a project --</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Title */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Meeting Title <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <Input
                  placeholder="Enter meeting title"
                  {...form.register("title")}
                  style={
                    form.formState.errors.title
                      ? { borderColor: "#ef4444" }
                      : {}
                  }
                />
                {form.formState.errors.title && (
                  <p style={styles.error}>
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <Textarea
                  placeholder="Enter meeting description (optional)"
                  {...form.register("description")}
                />
              </div>

              {/* Date & Time */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Meeting Date & Time{" "}
                  <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div
                  style={{
                    ...styles.dateWrapper,
                    position: "relative",
                    zIndex: 9999,
                  }}
                >
                  <DatePicker
                    selected={form.watch("datetime")}
                    onChange={(date) =>
                      form.setValue("datetime", date as Date, {
                        shouldValidate: true,
                      })
                    }
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    dateFormat="dd/MM/yyyy HH:mm"
                    minDate={new Date()}
                    placeholderText="Select date and time"
                    customInput={
                      <Input
                        style={
                          form.formState.errors.datetime
                            ? { ...styles.dateInput, borderColor: "#ef4444" }
                            : styles.dateInput
                        }
                      />
                    }
                    popperClassName="datepicker-popper"
                    popperPlacement="bottom-start"
                    popperProps={{
                      strategy: "fixed",
                    }}
                  />
                </div>
                {form.formState.errors.datetime && (
                  <p style={styles.error}>
                    {form.formState.errors.datetime.message as string}
                  </p>
                )}
              </div>

              {/* Milestone */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Milestone (optional)</label>
                {isLoadingMilestones ? (
                  <div style={styles.loadingText}>Loading milestones...</div>
                ) : (
                  <select
                    {...form.register("milestoneId")}
                    style={styles.select}
                  >
                    <option value="">-- Select milestone --</option>
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
                <label style={styles.label}>
                  Participants <span style={{ color: "#ef4444" }}>*</span>
                </label>
                {isLoadingParticipants ? (
                  <div style={styles.loadingText}>Loading members...</div>
                ) : participants.length === 0 ? (
                  <div style={styles.loadingText}>
                    No members in the project
                  </div>
                ) : (
                  <div
                    style={{
                      ...styles.participantList,
                      borderColor: form.formState.errors.participants
                        ? "#ef4444"
                        : "#e5e7eb",
                    }}
                  >
                    {participants.map((p) => (
                      <div key={p.id} style={styles.participantItem}>
                        <input
                          type="checkbox"
                          id={`participant-${p.id}`}
                          checked={selectedParticipants.includes(p.id)}
                          onChange={() => handleParticipantChange(p.id)}
                          style={{
                            width: 16,
                            height: 16,
                            accentColor: "#FF5E13",
                            cursor: "pointer",
                          }}
                        />
                        <label
                          htmlFor={`participant-${p.id}`}
                          style={styles.participantLabel}
                        >
                          {p.name}{" "}
                          <span style={{ color: "#9ca3af" }}>({p.email})</span>
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
            </form>

            <div style={styles.footer}>
              {onClose && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={onClose}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                form="meeting-form"
                style={styles.primaryButton}
                disabled={isCreating}
                onClick={form.handleSubmit(onSubmit)}
              >
                {isCreating ? "Creating..." : "Create Meeting"}
              </Button>
            </div>
          </>
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
    padding: "20px",
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
  },
  modal: {
    position: "relative",
    background: "#fff",
    borderRadius: 16,
    border: "none",
    padding: 0,
    maxWidth: 560,
    width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    zIndex: 10,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    fontSize: 18,
    color: "#9ca3af",
    cursor: "pointer",
    background: "#f3f4f6",
    border: "none",
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  header: {
    padding: "24px 28px 16px",
    borderBottom: "1px solid #f3f4f6",
    background: "#fafbfc",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    margin: 0,
  },
  successContainer: {
    textAlign: "center",
    padding: "48px 28px",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#FF5E13",
    marginBottom: 8,
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: "#FF5E13",
    color: "white",
    cursor: "pointer",
    padding: "10px 20px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    border: "none",
    transition: "all 0.2s ease",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    padding: "24px 28px",
    maxHeight: "60vh",
    overflowY: "auto",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
  },
  error: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  loadingText: {
    fontSize: 13,
    color: "#9ca3af",
    padding: "12px",
    background: "#f9fafb",
    borderRadius: 8,
    textAlign: "center",
  },
  select: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    color: "#374151",
    background: "white",
    cursor: "pointer",
    transition: "border-color 0.2s ease",
    outline: "none",
  },
  dateWrapper: {
    marginBottom: 0,
  },
  dateInput: {
    width: "100%",
    borderRadius: 8,
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    fontSize: 14,
    color: "#374151",
  },
  participantList: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 12,
    maxHeight: 180,
    overflowY: "auto",
    background: "#fafbfc",
  },
  participantItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    borderRadius: 6,
    transition: "background 0.15s ease",
    cursor: "pointer",
  },
  participantLabel: {
    fontSize: 13,
    color: "#374151",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    color: "#6b7280",
    padding: "10px 20px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
    transition: "all 0.2s ease",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    padding: "20px 28px",
    borderTop: "1px solid #f3f4f6",
    background: "#fafbfc",
  },
};
