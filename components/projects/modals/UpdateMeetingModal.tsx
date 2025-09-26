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
import {
  mockParticipants,
  mockMilestones,
  mockProjects,
} from "@/constants/mockData";

interface UpdateMeetingModalProps {
  call: Call; // Now required since we only handle Stream meetings
  onClose: () => void;
  onUpdated?: () => void;
  requireProjectSelection?: boolean;
}

export const UpdateMeetingModal = ({
  call,
  onClose,
  onUpdated,
  requireProjectSelection = false,
}: UpdateMeetingModalProps) => {
  const initialData = {
    title: call?.state?.custom?.title || "",
    description: call?.state?.custom?.description || "",
    milestoneId: call?.state?.custom?.milestoneId || "",
    participants: call?.state?.custom?.participants || [],
    dateTime: call?.state?.startsAt ? new Date(call.state.startsAt) : null,
  };

  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description);
  const [milestoneId, setMilestoneId] = useState(initialData.milestoneId);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    initialData.participants
  );
  const [dateTime, setDateTime] = useState<Date | null>(initialData.dateTime);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [milestones, setMilestones] = useState(mockMilestones);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    call?.state?.custom?.projectId || ""
  );

  useEffect(() => {
    setParticipants(mockParticipants);

    if (requireProjectSelection) {
      setProjects(mockProjects);
    }

    if (selectedProjectId) {
      const projectMilestones = mockMilestones.filter(
        (milestone) => milestone.projectId === selectedProjectId
      );
      setMilestones(projectMilestones);
    } else {
      setMilestones(mockMilestones);
    }
  }, [selectedProjectId, requireProjectSelection]);

  const handleParticipantChange = (id: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
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

      await call?.update({
        custom: {
          title: title.trim(),
          description: description.trim(),
          participants: selectedParticipants,
          milestoneId,
          projectId: requireProjectSelection
            ? selectedProjectId
            : call?.state?.custom?.projectId,
        },
        starts_at: dateTime?.toISOString(),
      });

      await call?.updateCallMembers({
        update_members: selectedParticipants.map((id) => ({
          user_id: id,
          role: "call_member",
        })),
      });

      toast.success("Đã cập nhật cuộc họp");
      onUpdated?.();
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
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
        >
          {/* Title field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium">Tiêu đề</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium">Mô tả</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* DateTime field */}
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

          {/* Project selection if required */}
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

          {/* Milestone field */}
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
          </div>

          {/* Participants field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Người tham gia</label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(p.id)}
                    onChange={() => handleParticipantChange(p.id)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <label className="text-sm text-gray-700">
                    {p.email} - {p.role}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Submit buttons */}
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
