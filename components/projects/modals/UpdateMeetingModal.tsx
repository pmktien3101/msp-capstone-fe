"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Call } from "@stream-io/video-react-sdk";
import { toast } from "react-toastify";

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
      await call.update({
        custom: {
          ...custom,
          title: title.trim(),
          description: description.trim(),
        },
        starts_at: newStarts?.toISOString(),
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
