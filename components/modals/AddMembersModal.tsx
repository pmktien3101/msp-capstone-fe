"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Member } from "@/types";

interface AddMembersModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (selectedMembers: Member[]) => void;
  availableMembers: Member[];
  currentMembers: Member[];
}

export function AddMembersModal({ open, onClose, onSave, availableMembers, currentMembers }: AddMembersModalProps) {
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = availableMembers.filter(member => 
    !currentMembers.find(m => m.id === member.id) &&
    (member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     member.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleMemberSelect = (member: Member, isChecked: boolean) => {
    if (isChecked) {
      setSelectedMembers([...selectedMembers, member]);
    } else {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    }
  };

  const handleSave = () => {
    onSave(selectedMembers);
    setSelectedMembers([]);
    setSearchQuery("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm thành viên mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Tìm kiếm thành viên</Label>
            <Input
              type="text"
              placeholder="Nhập tên hoặc vai trò..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
            {filteredMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                <Checkbox
                  id={`member-${member.id}`}
                  checked={selectedMembers.some(m => m.id === member.id)}
                  onCheckedChange={(checked) => handleMemberSelect(member, checked as boolean)}
                />
                <Label htmlFor={`member-${member.id}`} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.role}</div>
                    </div>
                  </div>
                </Label>
              </div>
            ))}

            {filteredMembers.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                Không tìm thấy thành viên phù hợp
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={selectedMembers.length === 0}>
            Thêm ({selectedMembers.length}) thành viên
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
