import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, User, Edit, Trash2, Check, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Assignee = {
    id: string;
    fullName?: string;
    email?: string;
    [key: string]: any;
};

type Todo = {
    id: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    assignee?: Assignee;
    assigneeId?: string;
    referencedTasks?: string[];
    status: number;
    statusDisplay: string;
    [key: string]: any;
};

interface Props {
    todo: Todo;
    index: number;
    selectedTasks: string[];
    editMode: boolean;
    attendees: any[];
    onShowRelatedTasks: (taskIds: string[]) => void;
    onSelectTask: (taskId: string) => void;
    onEditStart: (todoId: string, originalTodo: Todo) => void;
    onEditSave: (todo: Todo) => Promise<void>;
    onEditCancel: (todoId: string) => void;
    onDelete: (todoId: string) => void;
    onTodoChange: (todoId: string, updates: Partial<Todo>) => void;
    isValidTodo: (todo: Todo) => boolean;
}

export const TodoCard: React.FC<Props> = ({
    todo,
    index,
    selectedTasks,
    editMode,
    attendees,
    onShowRelatedTasks,
    onSelectTask,
    onEditStart,
    onEditSave,
    onEditCancel,
    onDelete,
    onTodoChange,
    isValidTodo,
}) => {
    const hasRelated = !!todo.referencedTasks && todo.referencedTasks.length > 0;
    const currentAssignee = todo.assigneeId || todo.assignee?.id;

    const getTodoStatusStyle = (status: number) => {
        switch (status) {
            case 0: // Generated
                return {
                    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                    color: "white",
                };
            case 1: // UnderReview
                return {
                    background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                    color: "white",
                };
            case 2: // ConvertedToTask
                return {
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                };
            case 3: // Deleted
                return {
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    color: "white",
                };
            default:
                return {
                    background: "#f3f4f6",
                    color: "#6b7280",
                };
        }
    };

    const getTodoStatusLabel = (statusDisplay: string) => {
        switch (statusDisplay) {
            case "Generated":
                return "Mới tạo";
            case "UnderReview":
                return "Đã chỉnh sửa";
            case "ConvertedToTask":
                return "Đã chuyển đổi thành công việc";
            case "Deleted":
                return "Đã xóa";
            default:
                return statusDisplay;
        }
    };

    const formatDate = (dateString?: string | Date): string => {
        if (!dateString) return "--/--/----";
        const dateObj =
            typeof dateString === "string" ? new Date(dateString) : dateString;
        if (isNaN(dateObj.getTime())) return "--/--/----";
        const dd = String(dateObj.getDate()).padStart(2, "0");
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const yyyy = dateObj.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const getTodoAssigneeName = (todo: Todo): string => {
        if (todo.assignee?.fullName) {
            return todo.assignee.fullName;
        }
        if (todo.assignee?.email) {
            return todo.assignee.email;
        }
        if (todo.assigneeId && attendees) {
            const attendee = attendees.find((att: any) => att.id === todo.assigneeId);
            return attendee?.fullName || attendee?.email || todo.assigneeId;
        }
        return "Chưa được giao";
    };

    return (
        <div
            className={`task-item ai-task ${selectedTasks.includes(todo.id) ? "selected" : ""
                } ${editMode ? "edit-mode" : ""}`}
            data-task-id={todo.id}
            onClick={(e) => {
                if (editMode) return;
                const target = e.target as HTMLElement;
                if (
                    target.closest(".task-actions") ||
                    target.closest(".task-checkbox")
                )
                    return;
                onSelectTask(todo.id);
            }}
            style={{ cursor: editMode ? "default" : "pointer" }}
        >
            <div className="task-checkbox">
                <Checkbox
                    checked={selectedTasks.includes(todo.id)}
                    disabled={!isValidTodo(todo) || todo.status === 2 || todo.status === 3}
                    onCheckedChange={() => onSelectTask(todo.id)}
                    className="task-select-checkbox data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
            </div>
            <div className="task-number">{index + 1}</div>

            <div className="task-content">
                {/* Status Badge */}
                <div className="task-status-badge">
                    <span
                        className="status-badge"
                        style={getTodoStatusStyle(todo.status)}
                    >
                        {getTodoStatusLabel(todo.statusDisplay)}
                    </span>
                </div>

                <div className="task-title">
                    <label
                        className="detail-label"
                        style={{ cursor: editMode ? "default" : "pointer" }}
                    >
                        Tên công việc
                    </label>
                    {editMode ? (
                        <input
                            type="text"
                            value={todo.title || ""}
                            onChange={(e) => {
                                onTodoChange(todo.id, { title: e.target.value });
                            }}
                            className="task-title-input"
                            placeholder="Nhập tên công việc..."
                            autoFocus
                        />
                    ) : (
                        <div className="task-title-display">
                            {todo.title || "Nhập tên công việc..."}
                        </div>
                    )}
                </div>

                <div className="task-description">
                    <label
                        className="detail-label"
                        style={{ cursor: editMode ? "default" : "pointer" }}
                    >
                        Mô tả công việc
                    </label>
                    {editMode ? (
                        <textarea
                            value={todo.description || ""}
                            onChange={(e) => {
                                onTodoChange(todo.id, { description: e.target.value });
                            }}
                            className="task-description-input"
                            placeholder="Mô tả chi tiết công việc..."
                            rows={2}
                        />
                    ) : (
                        <div className="task-description-display">
                            {todo.description || "Mô tả chi tiết công việc..."}
                        </div>
                    )}
                </div>

                <div className="task-details">
                    <div className="detail-item">
                        <label className="detail-label">Ngày bắt đầu</label>
                        <div className="detail-value">
                            <Calendar size={14} />
                            {editMode ? (
                                <DatePicker
                                    selected={
                                        todo.startDate ? new Date(todo.startDate) : null
                                    }
                                    onChange={(date) => {
                                        onTodoChange(todo.id, {
                                            startDate: date ? date.toISOString() : undefined,
                                        });
                                    }}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="dd/mm/yyyy"
                                    className="date-input"
                                />
                            ) : (
                                <span>{formatDate(todo.startDate) || "--/--/----"}</span>
                            )}
                        </div>
                    </div>

                    <div className="detail-item">
                        <label className="detail-label">Ngày kết thúc</label>
                        <div className="detail-value">
                            <Calendar size={14} />
                            {editMode ? (
                                <DatePicker
                                    selected={todo.endDate ? new Date(todo.endDate) : null}
                                    onChange={(date) => {
                                        onTodoChange(todo.id, {
                                            endDate: date ? date.toISOString() : undefined,
                                        });
                                    }}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="dd/mm/yyyy"
                                    className="date-input"
                                />
                            ) : (
                                <span>{formatDate(todo.endDate) || "--/--/----"}</span>
                            )}
                        </div>
                    </div>

                    <div className="detail-item">
                        <label className="detail-label">Người phụ trách</label>
                        <div className="detail-value">
                            <User size={14} />
                            {editMode ? (
                                <select
                                    value={currentAssignee || ""}
                                    onChange={(e) => {
                                        const newAssigneeId =
                                            e.target.value === "" ? null : e.target.value;
                                        const newAssigneeInfo = newAssigneeId
                                            ? attendees?.find(
                                                (att: any) => att.id === newAssigneeId
                                            )
                                            : null;

                                        onTodoChange(todo.id, {
                                            userId: newAssigneeId,
                                            user: newAssigneeInfo
                                                ? {
                                                    id: newAssigneeInfo.id,
                                                    fullName: newAssigneeInfo.fullName,
                                                    email: newAssigneeInfo.email,
                                                }
                                                : null,
                                        });
                                    }}
                                    className="assignee-select"
                                >
                                    <option value="">Chưa được giao</option>
                                    {attendees?.map(
                                        (attendee: any, idx: number) => (
                                            <option key={idx} value={attendee.id}>
                                                {attendee.fullName || attendee.email}
                                            </option>
                                        )
                                    )}
                                </select>
                            ) : (
                                <span>{getTodoAssigneeName(todo)}</span>
                            )}
                        </div>
                    </div>
                </div>

                {hasRelated && !editMode && (
                    <div style={{ marginTop: 12 }}>
                        <button
                            className="relation-link"
                            style={{
                                color: '#1681ff',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                                padding: 0,
                                fontSize: 14,
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowRelatedTasks(todo.referencedTasks ?? []);
                            }}
                        >
                            (Liên quan đến {todo.referencedTasks?.length} công việc cũ. Bấm vào để xem chi tiết)
                        </button>
                    </div>
                )}
            </div>

            <div className="task-actions">
                {editMode ? (
                    <>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={async (e) => {
                                e.stopPropagation();
                                await onEditSave(todo);
                            }}
                            className="save-btn"
                            title="Lưu"
                        >
                            <Check size={16} />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditCancel(todo.id);
                            }}
                            className="cancel-btn"
                            title="Hủy"
                        >
                            <X size={16} />
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditStart(todo.id, { ...todo });
                            }}
                            className="edit-btn"
                            title="Chỉnh sửa"
                        >
                            <Edit size={16} />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(todo.id);
                            }}
                            className="delete-btn"
                            title="Xóa"
                        >
                            <Trash2 size={16} />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default TodoCard;
