"use client";

import { GetTaskResponse } from '@/types/task';
import React, { useEffect, useState } from 'react';

type Props = {
    open: boolean;
    onClose: () => void;
    referenceTaskIds: string[];
};

export const RelatedTasksSidebar: React.FC<Props> = ({
    open,
    onClose,
    referenceTaskIds,
}) => {
    console.log('Sidebar props:', { open, referenceTaskIds });
    if (!open) return null;
    const [tasks, setTasks] = useState<GetTaskResponse[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // if (open && referenceTaskIds.length > 0) {
        //     setLoading(true);
        //     // Call API để lấy chi tiết các task cũ
        //     fetch(`/api/tasks/by-ids?ids=${referenceTaskIds.join(',')}`)
        //         .then((res) => res.json())
        //         .then((response) => {
        //             setTasks(response.data || []);
        //         })
        //         .finally(() => setLoading(false));
        // }
        console.log("fetch data");
        setTasks([]);
    }, [open, referenceTaskIds]);

    if (!open) return null;

    return (
        <div className="related-tasks-sidebar">
            <div className="sidebar-header">
                <span>Các công việc cũ liên quan</span>
                <button className="close-btn" onClick={onClose}>
                    &times;
                </button>
            </div>
            {loading ? (
                <div className="sidebar-loading">⏳ Đang tải...</div>
            ) : (
                <div className="sidebar-list">
                    {tasks.map((task) => (
                        <div key={task.id} className="related-task-card">
                            <div className="task-title">{task.title}</div>
                            <div className="task-status">Trạng thái: {task.status}</div>
                            <div className="task-assignee">
                                Người phụ trách: {task.user?.fullName || '-'}
                            </div>
                            <div className="task-dates">
                                <span>Ngày bắt đầu: {task.startDate ? new Date(task.startDate).toLocaleDateString() : '--'}</span>
                                <span>Ngày kết thúc: {task.endDate ? new Date(task.endDate).toLocaleDateString() : '--'}</span>
                            </div>
                            <div className="task-desc">{task.description}</div>
                        </div>
                    ))}
                    {!tasks.length && <div className="no-related-task">Không có công việc nào.</div>}
                </div>
            )}
        </div>
    );
};
