"use client";

import { GetTaskResponse } from '@/types/task';
import React, { useEffect, useState, useRef } from 'react';
import { X, Calendar, User, FileText, Tag } from 'lucide-react';
import { taskService } from '@/services/taskService';

type Props = {
    open: boolean;
    onClose: () => void;
    referenceTaskIds: string[];
    todoId?: string;
};

export const RelatedTasksSidebar: React.FC<Props> = ({
    open,
    onClose,
    referenceTaskIds,
    todoId,
}) => {
    const [tasks, setTasks] = useState<GetTaskResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (open && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (open) {
            // Add delay to prevent immediate closing when opening
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, onClose]);

    // Handle Escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && open) {
                onClose();
            }
        };

        if (open) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open, onClose]);

    useEffect(() => {
        if (open && todoId) {
            console.log('🔄 Fetching tasks for todoId:', todoId);
            setLoading(true);
            taskService.getTasksByTodoId(todoId)
                .then(response => {
                    console.log('✅ Fetched tasks response:', response);
                    setTasks(response.success && response.data ? response.data : []);
                })
                .catch(err => {
                    console.error('❌ Error fetching tasks:', err);
                    setTasks([]);
                })
                .finally(() => setLoading(false));
        } else {
            setTasks([]);
            setLoading(false);
        }
    }, [open, todoId]);

    const getStatusColor = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'ToDo': '#3b82f6',
            'InProgress': '#f59e0b',
            'Done': '#10b981',
            'Cancelled': '#ef4444',
        };
        return statusMap[status] || '#6b7280';
    };

    const getStatusLabel = (status: string) => {
        const labelMap: { [key: string]: string } = {
            'ToDo': 'Chưa bắt đầu',
            'InProgress': 'Đang thực hiện',
            'Done': 'Hoàn thành',
            'Cancelled': 'Đã hủy',
        };
        return labelMap[status] || status;
    };

    return (
        <>
            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'
                    }`}
                style={{ zIndex: 9999, borderLeft: '1px solid #e5e7eb' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-orange-50 to-white">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">Các công việc cũ liên quan</h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Tổng cộng: <span className="font-semibold text-orange-600">{tasks.length}</span> công việc
                        </p>
                    </div>
                    <button
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-orange-500"></div>
                            <span className="text-sm text-gray-600 mt-2">Đang tải...</span>
                        </div>
                    ) : tasks.length > 0 ? (
                        <div className="space-y-3">
                            {tasks.map((task, index) => (
                                <div
                                    key={task.id}
                                    className="bg-white border border-gray-200 rounded-lg p-3.5 hover:shadow-lg transition-all duration-200"
                                >
                                    {/* Header with number and status */}
                                    <div className="flex items-start justify-between mb-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="flex items-center justify-center w-5 h-5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">
                                                {index + 1}
                                            </span>
                                            <span
                                                className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                                                style={{ backgroundColor: getStatusColor(task.status) }}
                                            >
                                                {getStatusLabel(task.status)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div className="mb-2.5">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <Tag size={12} className="text-gray-400" />
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase">Tên công việc</label>
                                        </div>
                                        <h4 className="font-semibold text-sm text-gray-800 pl-4">{task.title}</h4>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-2.5">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <FileText size={12} className="text-gray-400" />
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase">Mô tả</label>
                                        </div>
                                        <p className="text-xs text-gray-600 pl-4 line-clamp-2">{task.description || 'Không có mô tả'}</p>
                                    </div>

                                    {/* Assignee */}
                                    <div className="mb-2.5">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <User size={12} className="text-gray-400" />
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase">Người phụ trách</label>
                                        </div>
                                        <p className="text-xs text-gray-700 pl-4 font-medium">
                                            {task.user?.fullName || 'Chưa phân công'}
                                        </p>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <Calendar size={12} className="text-gray-400" />
                                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Bắt đầu</label>
                                            </div>
                                            <p className="text-xs text-gray-700 pl-4">
                                                {task.startDate
                                                    ? new Date(task.startDate).toLocaleDateString('vi-VN')
                                                    : '--/--/----'}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <Calendar size={12} className="text-gray-400" />
                                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Kết thúc</label>
                                            </div>
                                            <p className="text-xs text-gray-700 pl-4">
                                                {task.endDate
                                                    ? new Date(task.endDate).toLocaleDateString('vi-VN')
                                                    : '--/--/----'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <FileText size={40} className="mb-2" />
                            <p className="text-base font-medium">Không tìm thấy công việc liên quan</p>
                            {referenceTaskIds.length > 0 && (
                                <p className="text-xs mt-1.5">IDs: {referenceTaskIds.join(', ')}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3.5 border-t bg-white">
                    <button
                        onClick={onClose}
                        className="w-full py-2 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg transition-all text-white text-sm font-semibold shadow-md hover:shadow-lg"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </>
    );
};
