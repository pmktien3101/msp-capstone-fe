"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Call } from "@stream-io/video-react-sdk";

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
  const [date, setDate] = useState<string>(
    startsAt ? startsAt.toISOString().slice(0, 10) : ""
  );
  const [time, setTime] = useState<string>(
    startsAt ? startsAt.toISOString().slice(11, 16) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const newStarts = date && time ? new Date(`${date}T${time}`) : undefined;
      await call.update({
        custom: {
          ...custom,
          title,
          description,
          scheduledDate: date,
          scheduledTime: time,
        },
        starts_at: newStarts?.toISOString(),
      });
      if (onUpdated) onUpdated(call);
      onClose();
    } catch (err: any) {
      console.error("Failed to update call", err);
      setError(err?.message || "Cập nhật thất bại");
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium">Ngày</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">Giờ</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
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
