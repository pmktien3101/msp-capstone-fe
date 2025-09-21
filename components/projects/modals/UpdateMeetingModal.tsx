"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Call } from "@stream-io/video-react-sdk";
import { toast } from "react-toastify";
import { Participant } from "@/types";
import { mockParticipants } from "@/constants/mockData";

interface UpdateMeetingModalProps {
  call: Call;
  onClose: () => void;
  onUpdated?: (call: Call) => void;
}

export const UpdateMeetingModal = ({
  call,
  onClose,
  onUpdated,
}: UpdateMeetingModalProps) => {
  const custom = call.state?.custom as any;
  const startsAt = call.state?.startsAt ? new Date(call.state.startsAt) : null;
  const [title, setTitle] = useState<string>(custom?.title || "");
  const [description, setDescription] = useState<string>(
    custom?.description || ""
  );
  const initialDateTime = startsAt
    ? new Date(startsAt.getTime() - startsAt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    : "";
  const [dateTime, setDateTime] = useState<string>(initialDateTime);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Thêm state cho participants
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    () => {
      // Đảm bảo luôn trả về một mảng, ngay cả khi custom.participants là undefined
      const participants = custom?.participants || [];
      return Array.isArray(participants) ? participants : [];
    }
  );

  // Load participants khi component mount
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setParticipants(mockParticipants);
      } catch (error) {
        console.error("Error fetching participants:", error);
        toast.error("Không thể tải danh sách người tham gia");
      }
    };

    fetchParticipants();
  }, []);

  const handleParticipantChange = (participantId: string) => {
    setSelectedParticipants((prev) => {
      if (prev.includes(participantId)) {
        return prev.filter((id) => id !== participantId);
      }
      return [...prev, participantId];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const newStarts = dateTime ? new Date(dateTime) : undefined;
      if (!title.trim()) throw new Error("Tiêu đề không được để trống");
      if (newStarts && newStarts.getTime() < Date.now() - 60_000) {
        throw new Error("Thời gian bắt đầu phải ở tương lai");
      }
      // Cập nhật thông tin cuộc họp
      await call.update({
        custom: {
          ...custom,
          title: title.trim(),
          description: description.trim(),
          participants: selectedParticipants,
        },
        starts_at: newStarts?.toISOString(),
      });

      // Cập nhật members với đầy đủ thông tin
      await call.updateCallMembers({
        update_members: selectedParticipants.map((id) => ({
          user_id: id,
          role: "call_member",
        })),
      });

      toast.success("Đã cập nhật cuộc họp");
      if (onUpdated) onUpdated(call);
      onClose();
    } catch (err: any) {
      console.error("Failed to update call", err);
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
          aria-label="Close"
        >
          ✕
        </button>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Cập nhật cuộc họp</h3>
          <p className="text-xs text-muted-foreground">
            Chỉnh sửa thông tin cuộc họp
          </p>
        </div>
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
              className="resize-none"
              rows={4}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium">
              Thời gian bắt đầu
            </label>
            <Input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => {
                setDateTime(e.target.value);
                setTouched(true);
              }}
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Chỉnh thời gian để cập nhật lịch bắt đầu cuộc họp.
            </p>
          </div>

          {/* Thêm phần chọn participants */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Người tham gia</label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2">
              {participants.map((participant) => {
                const isSelected = selectedParticipants.includes(
                  participant.id
                );
                console.log(
                  `Participant ${participant.id} selected:`,
                  isSelected
                );
                return (
                  <div
                    key={participant.id}
                    className="flex items-center space-x-2 py-1"
                  >
                    <input
                      type="checkbox"
                      id={`participant-${participant.id}`}
                      checked={isSelected}
                      onChange={() => handleParticipantChange(participant.id)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <label
                      htmlFor={`participant-${participant.id}`}
                      className="text-sm text-gray-700"
                    >
                      ({participant.email}) - {participant.role}
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
