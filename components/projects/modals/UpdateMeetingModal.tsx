"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Call } from "@stream-io/video-react-sdk";
import { toast } from "react-toastify";
import { Participant } from "@/types";
import { mockParticipants, mockMilestones, mockProjects } from "@/constants/mockData";

interface MockMeeting {
  id: string;
  projectId: string;
  milestoneId?: string;
  title: string;
  description?: string;
  startTime: string; // hoặc Date nếu đã parse
  endTime: string; // hoặc Date
  status: "Scheduled" | "Finished" | "Ongoing";
  meetingType: "online" | "offline";
  roomUrl?: string;
  location?: string;
  participants: string[];
}
interface UpdateMeetingModalProps {
  call?: Call;
  mockMeeting?: MockMeeting;
  onClose: () => void;
  onUpdated?: (updatedMeeting?: any) => void;
  requireProjectSelection?: boolean;
}

export const UpdateMeetingModal = ({
  call,
  mockMeeting,
  onClose,
  onUpdated,
  requireProjectSelection = false,
}: UpdateMeetingModalProps) => {
  const isStreamMeeting = !!call;

  const initialData = isStreamMeeting
    ? {
        title: call?.state?.custom?.title || "",
        description: call?.state?.custom?.description || "",
        meetingType: call?.state?.custom?.meetingType || "online",
        location: call?.state?.custom?.location || "",
        milestoneId: call?.state?.custom?.milestoneId || "",
        participants: call?.state?.custom?.participants || [],
        dateTime: call?.state?.startsAt ? new Date(call.state.startsAt) : null,
      }
    : {
        title: mockMeeting?.title || "",
        description: mockMeeting?.description || "",
        meetingType: mockMeeting?.meetingType || "offline",
        location: mockMeeting?.location || "",
        milestoneId: mockMeeting?.milestoneId || "",
        participants: mockMeeting?.participants || [],
        dateTime: mockMeeting?.startTime
          ? new Date(mockMeeting.startTime)
          : null,
      };

  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description);
  const [meetingType, setMeetingType] = useState<"online" | "offline">(
    initialData.meetingType
  );
  const [location, setLocation] = useState(initialData.location);
  const [milestoneId, setMilestoneId] = useState(initialData.milestoneId);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    initialData.participants
  );
  const [dateTime, setDateTime] = useState<Date | null>(initialData.dateTime);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [milestones, setMilestones] = useState(mockMilestones);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    mockMeeting?.projectId || ""
  );

  useEffect(() => {
    setParticipants(mockParticipants);
    
    if (requireProjectSelection) {
      setProjects(mockProjects);
    }
    
    // Filter milestones based on selected project
    if (selectedProjectId) {
      const projectMilestones = mockMilestones.filter(
        milestone => milestone.projectId === selectedProjectId
      );
      setMilestones(projectMilestones);
    } else {
      setMilestones(mockMilestones);
    }
  }, [selectedProjectId, requireProjectSelection]);

  // Sync state khi call hoặc mockMeeting thay đổi
  useEffect(() => {
    const data = isStreamMeeting
      ? {
          title: call?.state?.custom?.title || "",
          description: call?.state?.custom?.description || "",
          meetingType: call?.state?.custom?.meetingType || "online",
          location: call?.state?.custom?.location || "",
          milestoneId: call?.state?.custom?.milestoneId || "",
          participants: call?.state?.custom?.participants || [],
          dateTime: call?.state?.startsAt
            ? new Date(call.state.startsAt)
            : null,
        }
      : {
          title: mockMeeting?.title || "",
          description: mockMeeting?.description || "",
          meetingType: mockMeeting?.meetingType || "offline",
          location: mockMeeting?.location || "",
          milestoneId: mockMeeting?.milestoneId || "",
          participants: mockMeeting?.participants || [],
          dateTime: mockMeeting?.startTime
            ? new Date(mockMeeting.startTime)
            : null,
        };
    setTitle(data.title);
    setDescription(data.description);
    setMeetingType(data.meetingType);
    setLocation(data.location);
    setMilestoneId(data.milestoneId);
    setSelectedParticipants(data.participants);
    setDateTime(data.dateTime);
  }, [call, mockMeeting]);

  const handleParticipantChange = (id: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    // Reset milestone khi thay đổi project
    setMilestoneId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!title.trim()) throw new Error("Tiêu đề không được để trống");
      if (dateTime && dateTime.getTime() < Date.now() - 60_000)
        throw new Error("Thời gian bắt đầu phải ở tương lai");

      if (isStreamMeeting) {
        await call?.update({
          custom: {
            title: title.trim(),
            description: description.trim(),
            participants: selectedParticipants,
            meetingType,
            location: meetingType === "offline" ? location.trim() : "",
            milestoneId,
          },
          starts_at: dateTime?.toISOString(),
        });

        await call?.updateCallMembers({
          update_members: selectedParticipants.map((id) => ({
            user_id: id,
            role: "call_member",
          })),
        });
        toast.success("Đã cập nhật cuộc họp Stream");
        onUpdated?.();
      } else {
        // Tạo updated meeting object cho offline meeting
        const updatedMeeting = {
          ...mockMeeting,
          title: title.trim(),
          description: description.trim(),
          startTime: dateTime?.toISOString() || mockMeeting?.startTime,
          endTime: dateTime ? new Date(dateTime.getTime() + 60 * 60 * 1000).toISOString() : mockMeeting?.endTime,
          meetingType,
          location: meetingType === "offline" ? location.trim() : undefined,
          milestoneId: milestoneId || null,
          participants: selectedParticipants,
          projectId: requireProjectSelection ? selectedProjectId : mockMeeting?.projectId,
        };
        
        toast.success("Đã cập nhật cuộc họp Offline");
        onUpdated?.(updatedMeeting);
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Cập nhật thất bại");
      toast.error(err?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

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
        >
          ✕
        </button>
        <h3 className="text-lg font-semibold mb-4">Cập nhật cuộc họp</h3>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
        >
          <div className="space-y-1">
            <label className="block text-sm font-medium">Tiêu đề</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Mô tả</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">
              Thời gian bắt đầu
            </label>
            <DatePicker
              selected={dateTime}
              onChange={(date) => setDateTime(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={30}
              dateFormat="dd/MM/yyyy HH:mm"
              className="w-full border rounded-md p-2"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Loại cuộc họp</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="online"
                  checked={meetingType === "online"}
                  onChange={() => setMeetingType("online")}
                  className="mr-2"
                />
                Online
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="offline"
                  checked={meetingType === "offline"}
                  onChange={() => setMeetingType("offline")}
                  className="mr-2"
                />
                Offline
              </label>
            </div>
          </div>

          {meetingType === "offline" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Địa điểm</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Nhập địa điểm"
              />
            </div>
          )}

          {requireProjectSelection && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Dự án <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2"
                required
              >
                <option value="">-- Chọn dự án --</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Milestone</label>
            <select
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              disabled={requireProjectSelection && !selectedProjectId}
            >
              <option value="">-- Chọn milestone --</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            {requireProjectSelection && !selectedProjectId && (
              <p className="text-xs text-red-500">
                Vui lòng chọn dự án trước để xem milestones
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Người tham gia</label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2">
              {participants.map((p) => {
                const checked = selectedParticipants.includes(p.id);
                return (
                  <div key={p.id} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleParticipantChange(p.id)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <label className="text-sm text-gray-700">
                      {p.email} - {p.role}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
