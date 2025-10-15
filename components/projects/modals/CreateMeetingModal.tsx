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

// Định nghĩa interface dựa trên API response
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

// Định nghĩa interface cho milestone
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

  // Hàm convert ProjectMemberResponse sang Participant
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

  // Hàm convert MilestoneBackend sang Milestone
  const convertToMilestones = (milestones: any[]): Milestone[] => {
    return milestones.map((milestone) => ({
      id: milestone.id,
      name: milestone.name,
      projectId: milestone.projectId,
    }));
  };

  useEffect(() => {
    const loadParticipantsAndMilestones = async () => {
      if (!projectId) {
        toast.error("Không có projectId");
        return;
      }

      setIsLoadingParticipants(true);
      setIsLoadingMilestones(true);

      try {
        // 1. Fetch project members từ API
        const projectMembersResult = await projectService.getProjectMembers(
          projectId
        );

        if (projectMembersResult.success && projectMembersResult.data) {
          const convertedParticipants = convertToParticipants(
            projectMembersResult.data as unknown as ProjectMemberResponse[]
          );
          setParticipants(convertedParticipants);
        } else {
          // Xử lý trường hợp không có members (trả về empty array theo logic service)
          setParticipants([]);
        }
      } catch (error: any) {
        console.error("Error loading participants:", error);
        toast.error("Không thể tải danh sách thành viên dự án");
        setParticipants([]);
      } finally {
        setIsLoadingParticipants(false);
      }

      try {
        // 2. Fetch milestones từ API
        const milestonesResult =
          await milestoneService.getMilestonesByProjectId(projectId);

        if (milestonesResult.success && milestonesResult.data) {
          const convertedMilestones = convertToMilestones(
            milestonesResult.data
          );
          setMilestones(convertedMilestones);
        } else {
          // Không throw error vì milestones là optional
          console.warn("Could not load milestones:", milestonesResult.error);
          setMilestones([]);
        }
      } catch (error: any) {
        console.error("Error loading milestones:", error);
        // Không hiển thị toast vì milestones là optional
        setMilestones([]);
      } finally {
        setIsLoadingMilestones(false);
      }
    };

    loadParticipantsAndMilestones();
  }, [projectId]);

  const handleParticipantChange = (participantId: string) => {
    setSelectedParticipants((prev) => {
      if (prev.includes(participantId)) {
        return prev.filter((id) => id !== participantId);
      }
      return [...prev, participantId];
    });
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

      // 1. Tạo meeting trong database
      const meetingData = {
        meetingId: meetingId,
        createdById: userId,
        projectId: projectId,
        milestoneId: values.milestoneId || null,
        title: values.title,
        description: values.description,
        startTime: values.datetime.toISOString(),
        attendeeIds: allParticipants,
      };

      // Gọi API tạo meeting trong database
      const dbResponse = await fetch("https://localhost:7129/api/v1/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(meetingData),
      });

      let dbResult;
      try {
        dbResult = await dbResponse.json();
      } catch {
        // Nếu không parse được JSON, có thể là lỗi server trả về HTML
        throw new Error("API trả về dữ liệu không hợp lệ (không phải JSON)");
      }

      if (!dbResponse.ok || !dbResult.success) {
        throw new Error(
          dbResult?.message || "Không thể tạo meeting trong database"
        );
      }

      // 2. Tạo call trong Stream
      const call = client.call("default", meetingId);
      if (!call) {
        throw new Error("Failed to create call");
      }

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
      console.error("Error creating meeting:", error);
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
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl rounded-lg border bg-white shadow-xl p-6 animate-in fade-in zoom-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-sm"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Tạo cuộc họp mới</h3>
          <p className="text-xs text-muted-foreground">
            Vui lòng điền thông tin để lên lịch cuộc họp cho dự án
          </p>
        </div>
        <div className="max-w-2xl mx-auto w-full">
          {callDetails ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4 text-orange-800">
                Đã tạo cuộc họp!
              </h2>
              <p className="mb-4">Cuộc họp đã được lên lịch thành công.</p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => {
                    if (meetingLink) {
                      navigator.clipboard.writeText(meetingLink);
                      toast.success("Đã sao chép link!");
                    }
                  }}
                  className="flex items-center gap-2 bg-orange-500 text-white cursor-pointer"
                >
                  Sao chép link cuộc họp
                </Button>
                <Button
                  onClick={() =>
                    window.open(`/meeting/${callDetails?.id}`, "_blank")
                  }
                  className="bg-orange-500 text-white cursor-pointer"
                >
                  Vào phòng họp
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 max-h-[60vh] overflow-y-auto pr-6 pl-6"
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Tiêu đề cuộc họp
                </label>
                <Input
                  placeholder="Nhập tiêu đề cuộc họp"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Mô tả</label>
                <Textarea
                  placeholder="Nhập mô tả nội dung cuộc họp"
                  className="resize-none"
                  {...form.register("description")}
                />
                <p className="text-xs text-muted-foreground">
                  Mô tả ngắn về nội dung, mục tiêu cuộc họp
                </p>
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Ngày & giờ họp
                  </label>
                  <DatePicker
                    selected={form.watch("datetime")}
                    onChange={(date) => form.setValue("datetime", date as Date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    dateFormat="dd/MM/yyyy HH:mm"
                    className="w-full border rounded-md p-2 text-sm"
                  />
                  {form.formState.errors.datetime && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.datetime.message as string}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Milestone (không bắt buộc)
                </label>
                {isLoadingMilestones ? (
                  <div className="text-sm text-gray-500">
                    Đang tải danh sách milestones...
                  </div>
                ) : (
                  <select
                    {...form.register("milestoneId")}
                    className="w-full rounded-md border border-gray-300 p-2"
                  >
                    <option value="">-- Chọn milestone --</option>
                    {milestones.map((milestone) => (
                      <option key={milestone.id} value={milestone.id}>
                        {milestone.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Người tham gia
                </label>
                {isLoadingParticipants ? (
                  <div className="text-sm text-gray-500">
                    Đang tải danh sách thành viên...
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    Không có thành viên nào trong dự án
                  </div>
                ) : (
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center space-x-2 py-1"
                      >
                        <input
                          type="checkbox"
                          id={`participant-${participant.id}`}
                          checked={selectedParticipants.includes(
                            participant.id
                          )}
                          onChange={() =>
                            handleParticipantChange(participant.id)
                          }
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <label
                          htmlFor={`participant-${participant.id}`}
                          className="text-sm text-gray-700"
                        >
                          {participant.email} - {participant.role}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {form.formState.errors.participants && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.participants.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-4">
                {onClose && (
                  <Button variant="outline" type="button" onClick={onClose}>
                    Hủy
                  </Button>
                )}
                <Button
                  type="submit"
                  className="bg-orange-500 text-white cursor-pointer"
                  disabled={isCreating || isLoadingParticipants}
                >
                  {isCreating ? "Đang tạo..." : "Tạo cuộc họp"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export const CreateMeetingModal = MeetingForm;
