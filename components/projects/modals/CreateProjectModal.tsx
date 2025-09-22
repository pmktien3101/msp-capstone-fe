'use client';

import { useState } from 'react';
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
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderOpen, Calendar, PlayCircle, Pause, CheckCircle, Users, Search } from 'lucide-react';
import { mockMembers } from '@/constants/mockData';

const projectSchema = z.object({
  name: z.string().min(1, "Tên dự án là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  endDate: z.string().min(1, "Ngày kết thúc là bắt buộc"),
  status: z.enum(["planning", "active", "on-hold", "completed"]).describe("Trạng thái"),
  members: z.array(z.string()).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject?: (projectData: ProjectFormData) => void;
}

export function CreateProjectModal({ isOpen, onClose, onCreateProject }: CreateProjectModalProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: "planning",
      members: [],
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    console.log(data);
    // Handle project creation
    if (onCreateProject) {
      onCreateProject({
        ...data,
        members: selectedMembers
      });
    } else {
      onClose();
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Filter members based on search term
  const filteredMembers = mockMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={20} />
            Tạo Dự Án Mới
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
            <div>
              <Label htmlFor="name">Tên dự án *</Label>
              <Input
                id="name"
                placeholder="Nhập tên dự án"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Mô tả *</Label>
              <Textarea
                id="description"
                placeholder="Mô tả dự án"
                {...register("description")}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="endDate">Ngày kết thúc *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  className={errors.endDate ? "border-red-500" : ""}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Trạng thái *</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]" position="popper" side="bottom" align="start">
                      <SelectItem value="planning">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={16} />
                          Lập kế hoạch
                        </div>
                      </SelectItem>
                      <SelectItem value="active">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <PlayCircle size={16} />
                          Đang thực hiện
                        </div>
                      </SelectItem>
                      <SelectItem value="on-hold">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Pause size={16} />
                          Tạm dừng
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle size={16} />
                          Hoàn thành
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
              )}
            </div>

            <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Thành viên</Label>
                
                {/* Search input */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm thành viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  />
                </div>

                {/* Members list */}
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <div 
                        key={member.id} 
                        className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 hover:bg-white hover:shadow-sm cursor-pointer ${
                          selectedMembers.includes(member.id) 
                            ? 'bg-orange-50 border border-orange-200' 
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => handleMemberToggle(member.id)}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            id={member.id}
                            checked={selectedMembers.includes(member.id)}
                            onChange={() => handleMemberToggle(member.id)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                            selectedMembers.includes(member.id)
                              ? 'bg-orange-500 border-orange-500'
                              : 'border-gray-300 hover:border-orange-400'
                          }`}>
                            {selectedMembers.includes(member.id) && (
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                            selectedMembers.includes(member.id)
                              ? 'bg-orange-500 text-white shadow-md'
                              : 'bg-gradient-to-br from-blue-400 to-purple-500 text-white shadow-sm'
                          }`}>
                            {member.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{member.name}</div>
                            <div className="text-xs text-gray-500 truncate">{member.role}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-6">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Không tìm thấy thành viên</p>
                    </div>
                  )}
                </div>
                
                {selectedMembers.length > 0 && (
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <p className="text-sm text-gray-600 font-medium">
                        Đã chọn {selectedMembers.length} thành viên
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMembers([])}
                      className="text-xs text-gray-500 hover:text-red-500 transition-colors duration-200"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                )}
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 mt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              style={{
                background: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              Hủy
            </Button>
            <Button 
              type="submit"
              style={{
                background: 'transparent',
                color: '#FF5E13',
                border: '1px solid #FF5E13',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FF5E13';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#FF5E13';
              }}
            >
              Tạo dự án
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Dialog>
  );
}
