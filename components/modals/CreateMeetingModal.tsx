"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Meeting, MeetingStatus } from "@/types/meeting";
import { Member } from "@/types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateMeetingModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (meeting: Meeting) => void;
  availableMembers: Member[];
  milestoneId: number;
}

interface MeetingForm {
  title: string;
  startTime: Date;
  description: string;
  participants: string[];
}

export function CreateMeetingModal({
  open,
  onClose,
  onSave,
  availableMembers,
  milestoneId,
}: CreateMeetingModalProps) {
  const [form, setForm] = useState<MeetingForm>({
    title: "",
    startTime: new Date(),
    description: "",
    participants: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const endTime = new Date(form.startTime);
    endTime.setHours(endTime.getHours() + 1);

    const newMeeting: Meeting = {
      id: `m${Date.now()}`,
      title: form.title,
      description: form.description,
      startTime: form.startTime.toISOString(),
      endTime: endTime.toISOString(),
      participants: form.participants.map((id) => {
        const member = availableMembers.find((m) => m.id === id);
        return member ? { id: member.id, name: member.name } : { id, name: "" };
      }),
      createdBy: "1",
      status: MeetingStatus.SCHEDULED,
    };

    onSave(newMeeting);
    setForm({
      title: "",
      startTime: new Date(),
      description: "",
      participants: [],
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo cuộc họp mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tiêu đề cuộc họp</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Nhập tiêu đề cuộc họp..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Ngày họp</Label>
              <DatePicker
                selected={form.startTime}
                onChange={(date: Date | null) =>
                  date && setForm({ ...form, startTime: date })
                }
                dateFormat="dd/MM/yyyy"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <Label>Thời gian</Label>
              <Input
                type="time"
                value={form.startTime.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(":");
                  const newDate = new Date(form.startTime);
                  newDate.setHours(parseInt(hours), parseInt(minutes));
                  setForm({ ...form, startTime: newDate });
                }}
                required
              />
            </div>
          </div>

          <div>
            <Label>Mô tả</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Nhập mô tả cuộc họp..."
            />
          </div>

          <div>
            <Label>Người tham gia</Label>
            <Select
              onValueChange={(value) => {
                setForm((prev) => ({
                  ...prev,
                  participants: [...prev.participants, value],
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn người tham gia..." />
              </SelectTrigger>
              <SelectContent>
                {availableMembers
                  .filter((member) => !form.participants.includes(member.id))
                  .map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="mt-2 flex flex-wrap gap-2">
              {availableMembers
                .filter((member) => form.participants.includes(member.id))
                .map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 rounded-md bg-secondary px-2 py-1"
                  >
                    <span>
                      {member.name} ({member.role})
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-sm"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          participants: prev.participants.filter(
                            (id) => id !== member.id
                          ),
                        }));
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Tạo cuộc họp</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
