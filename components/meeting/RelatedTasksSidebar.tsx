"use client";

import { GetTaskResponse } from '@/types/task';
import React, { useEffect, useState, useRef } from 'react';
import { X, Calendar, FileText, ExternalLink } from 'lucide-react';
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
            setLoading(true);
            taskService.getTasksByTodoId(todoId)
                .then(response => {
                    setTasks(response.success && response.data ? response.data : []);
                })
                .catch(() => {
                    setTasks([]);
                })
                .finally(() => setLoading(false));
        } else {
            setTasks([]);
            setLoading(false);
        }
    }, [open, todoId]);

    const getStatusStyle = (status: string) => {
        const statusMap: { [key: string]: { bg: string; text: string } } = {
            'Todo': { bg: '#eff6ff', text: '#3b82f6' },
            'InProgress': { bg: '#fef9c3', text: '#ca8a04' },
            'ReadyToReview': { bg: '#f3e8ff', text: '#9333ea' },
            'ReOpened': { bg: '#ffedd5', text: '#ea580c' },
            'Cancelled': { bg: '#fee2e2', text: '#dc2626' },
            'Done': { bg: '#dcfce7', text: '#16a34a' },
        };
        return statusMap[status] || { bg: '#f3f4f6', text: '#6b7280' };
    };

    const getStatusLabel = (status: string) => {
        const labelMap: { [key: string]: string } = {
            'Todo': 'To Do',
            'InProgress': 'In Progress',
            'ReadyToReview': 'Ready To Review',
            'ReOpened': 'Re-Opened',
            'Cancelled': 'Cancelled',
            'Done': 'Done',
        };
        return labelMap[status] || status;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '--/--/----';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <>
            {/* Backdrop */}
            {open && (
                <div 
                    className="fixed inset-0 bg-black/10 transition-opacity duration-300"
                    style={{ zIndex: 9998 }}
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed right-0 top-0 h-full w-[480px] bg-white flex flex-col transition-transform duration-300 ease-in-out ${
                    open ? 'translate-x-0' : 'translate-x-full'
                }`}
                style={{ 
                    zIndex: 9999, 
                    boxShadow: open ? '-4px 0 20px rgba(0, 0, 0, 0.08)' : 'none',
                }}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                <ExternalLink size={20} className="text-orange-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-gray-800">Related Tasks</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Found <span className="font-medium text-orange-600">{tasks.length}</span> linked {tasks.length === 1 ? 'task' : 'tasks'}
                                </p>
                            </div>
                        </div>
                        <button
                            className="p-2 rounded-lg hover:bg-orange-100 transition-colors"
                            onClick={onClose}
                        >
                            <X size={18} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40">
                            <div className="w-8 h-8 rounded-full border-3 border-gray-200 border-t-orange-400 animate-spin" />
                            <span className="text-sm text-gray-500 mt-3">Loading...</span>
                        </div>
                    ) : tasks.length > 0 ? (
                        <div className="space-y-3">
                            {tasks.map((task, index) => {
                                const statusStyle = getStatusStyle(task.status);
                                return (
                                    <div
                                        key={task.id}
                                        className="group bg-white rounded-xl p-4 border border-gray-100 hover:border-orange-200 transition-all duration-200 hover:shadow-md"
                                    >
                                        {/* Card Header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2.5">
                                                <span 
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                                                    style={{ background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' }}
                                                >
                                                    {index + 1}
                                                </span>
                                                <span
                                                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                                                    style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                                                >
                                                    {getStatusLabel(task.status)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Task Title */}
                                        <div className="mb-2.5">
                                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Task Name</label>
                                            <h4 className="font-semibold text-sm text-gray-800 mt-0.5 group-hover:text-orange-600 transition-colors">
                                                {task.title}
                                            </h4>
                                        </div>

                                        {/* Description */}
                                        {task.description && (
                                            <div className="mb-2.5">
                                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Description</label>
                                                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                                    {task.description}
                                                </p>
                                            </div>
                                        )}

                                        {/* Assignee */}
                                        <div className="mb-2.5">
                                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Assignee</label>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div 
                                                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-white bg-gray-400"
                                                >
                                                    {task.user?.fullName?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <span className="text-xs text-gray-700">
                                                    {task.user?.fullName || 'Not assigned'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Dates */}
                                        <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-gray-100">
                                            <div>
                                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Start Date</label>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Calendar size={11} className="text-gray-400" />
                                                    <span className="text-xs text-gray-700">{formatDate(task.startDate)}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">End Date</label>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Calendar size={11} className="text-gray-400" />
                                                    <span className="text-xs text-gray-700">{formatDate(task.endDate)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-56 text-center">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <FileText size={24} className="text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">No related tasks</p>
                            <p className="text-xs text-gray-400 mt-1">This to-do is not linked to any tasks</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-white">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 px-4 rounded-lg bg-orange-400 hover:bg-orange-500 transition-colors text-white text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </>
    );
};
