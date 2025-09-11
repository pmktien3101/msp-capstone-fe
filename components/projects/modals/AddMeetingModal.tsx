'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project } from "@/types/project";

interface AddMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export function AddMeetingModal({ isOpen, onClose, project }: AddMeetingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    participants: [] as number[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    // Handle meeting creation
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleParticipant = (id: number) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(id)
        ? prev.participants.filter(p => p !== id)
        : [...prev.participants, id]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <span>📅</span>
              <div>
                <h3 className="text-lg font-semibold">Tạo Meeting Mới</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tạo meeting cho dự án {project.name}
                </p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">
                <span className="flex items-center gap-2">
                  📝 Tiêu đề Meeting <span className="text-red-500">*</span>
                </span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nhập tiêu đề meeting"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">
                <span className="flex items-center gap-2">
                  📄 Mô tả Meeting
                </span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả nội dung meeting..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">
                  <span className="flex items-center gap-2">
                    📅 Ngày Meeting <span className="text-red-500">*</span>
                  </span>
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">
                  <span className="flex items-center gap-2">
                    ⏰ Giờ Meeting <span className="text-red-500">*</span>
                  </span>
                </Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration">
                <span className="flex items-center gap-2">
                  ⏱️ Thời lượng <span className="text-red-500">*</span>
                </span>
              </Label>
              <Select name="duration" value={formData.duration} onValueChange={(value) => handleChange({ target: { name: 'duration', value } } as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thời lượng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 phút</SelectItem>
                  <SelectItem value="60">1 giờ</SelectItem>
                  <SelectItem value="90">1.5 giờ</SelectItem>
                  <SelectItem value="120">2 giờ</SelectItem>
                  <SelectItem value="180">3 giờ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                <span className="flex items-center gap-2 mb-2">
                  👥 Người tham gia
                </span>
              </Label>
              <div className="border rounded-lg p-2 max-h-48 overflow-y-auto space-y-2">
                {project.members.map(member => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.participants.includes(Number(member.id))}
                      onChange={() => toggleParticipant(Number(member.id))}
                      className="rounded border-gray-300"
                    />
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.role}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              ❌ Hủy bỏ
            </Button>
            <Button type="submit">
              📅 Tạo Meeting
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
