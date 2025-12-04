import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, User, Edit, Trash2, Check, X, FileText, Link2 } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Todo } from '@/types/todo';

interface Props {
    todo: Todo;
    index: number;
    selectedTasks: string[];
    editMode: boolean;
    attendees: any[];
    onShowRelatedTasks: (todo: Todo) => void;
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
                    background: "#fef3c7",
                    color: "#d97706",
                    border: "1px solid #fcd34d",
                };
            case 1: // UnderReview
                return {
                    background: "#dbeafe",
                    color: "#2563eb",
                    border: "1px solid #93c5fd",
                };
            case 2: // ConvertedToTask
                return {
                    background: "#dcfce7",
                    color: "#16a34a",
                    border: "1px solid #86efac",
                };
            case 3: // Deleted
                return {
                    background: "#fee2e2",
                    color: "#dc2626",
                    border: "1px solid #fca5a5",
                };
            default:
                return {
                    background: "#f3f4f6",
                    color: "#6b7280",
                    border: "1px solid #e5e7eb",
                };
        }
    };

    const getTodoStatusLabel = (statusDisplay: string) => {
        switch (statusDisplay) {
            case "Generated":
                return "New";
            case "UnderReview":
                return "Edited";
            case "ConvertedToTask":
                return "Converted";
            case "Deleted":
                return "Deleted";
            default:
                return statusDisplay;
        }
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
        return "Unassigned";
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

    const isConverted = todo.status === 2; // ConvertedToTask
    const isSelected = selectedTasks.includes(todo.id);

    // Get today's date at midnight for date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get start date for end date validation
    const startDateObj = todo.startDate ? new Date(todo.startDate) : null;
    if (startDateObj) {
        startDateObj.setHours(0, 0, 0, 0);
    }

    // Validate title is not empty
    const isTitleEmpty = !todo.title || todo.title.trim() === '';

    return (
        <div
            className={`task-item ai-task ${isSelected ? "selected" : ""} ${editMode ? "edit-mode" : ""} ${isConverted ? "converted-disabled" : ""}`}
            data-task-id={todo.id}
        >
            {/* Left section: Checkbox + Number */}
            <div className="task-left-section">
                <div className="task-checkbox">
                    <Checkbox
                        checked={isSelected}
                        disabled={!isValidTodo(todo) || todo.status === 2 || todo.status === 3}
                        style={{ cursor: (isValidTodo(todo) && todo.status !== 2 && todo.status !== 3) ? "pointer" : "no-drop" }}
                        onCheckedChange={() => onSelectTask(todo.id)}
                        className="task-select-checkbox data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                </div>
                <div className="task-number">{index + 1}</div>
            </div>

            {/* Main content */}
            <div className="task-content">
                {/* Header: Status Badge */}
                <div className="task-header">
                    <span
                        className="status-badge"
                        style={getTodoStatusStyle(todo.status)}
                    >
                        {getTodoStatusLabel(todo.statusDisplay)}
                    </span>
                    {hasRelated && !editMode && (
                        <button
                            className="related-badge"
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowRelatedTasks(todo);
                            }}
                        >
                            <Link2 size={12} />
                            <span>Related to {todo.referencedTasks?.length} existing task</span>
                        </button>
                    )}
                </div>

                {/* Title */}
                <div className="task-field">
                    <label className="field-label">
                        <FileText size={12} />
                        Task Name <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    {editMode ? (
                        <>
                            <input
                                type="text"
                                value={todo.title || ""}
                                onChange={(e) => {
                                    onTodoChange(todo.id, { title: e.target.value });
                                }}
                                className={`task-title-input ${isTitleEmpty ? 'input-error' : ''}`}
                                placeholder="Enter task name..."
                                autoFocus
                            />
                            {isTitleEmpty && (
                                <span className="field-error">Task name is required</span>
                            )}
                        </>
                    ) : (
                        <h4 className="task-title-display">
                            {todo.title || "Untitled task"}
                        </h4>
                    )}
                </div>

                {/* Description */}
                <div className="task-field">
                    <label className="field-label">
                        <FileText size={12} />
                        Description
                    </label>
                    {editMode ? (
                        <textarea
                            value={todo.description || ""}
                            onChange={(e) => {
                                onTodoChange(todo.id, { description: e.target.value });
                            }}
                            className="task-description-input"
                            placeholder="Add description..."
                            rows={3}
                        />
                    ) : (
                        <p className="task-description-display">
                            {todo.description || "No description"}
                        </p>
                    )}
                </div>

                {/* Meta info: Dates + Assignee */}
                <div className="task-meta-grid">
                    <div className="meta-field">
                        <label className="field-label">
                            <Calendar size={12} />
                            Start Date
                        </label>
                        <div className="field-value">
                            {editMode ? (
                                <DatePicker
                                    selected={todo.startDate ? new Date(todo.startDate) : null}
                                    onChange={(date) => {
                                        onTodoChange(todo.id, {
                                            startDate: date ? date.toISOString() : undefined,
                                        });
                                        // If endDate is before new startDate, clear it
                                        if (date && todo.endDate) {
                                            const newStart = new Date(date);
                                            const currentEnd = new Date(todo.endDate);
                                            if (currentEnd < newStart) {
                                                onTodoChange(todo.id, { endDate: undefined });
                                            }
                                        }
                                    }}
                                    minDate={today}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Select date"
                                    className="date-input"
                                />
                            ) : (
                                <span>{formatDate(todo.startDate)}</span>
                            )}
                        </div>
                    </div>
                    <div className="meta-field">
                        <label className="field-label">
                            <Calendar size={12} />
                            Due Date
                        </label>
                        <div className="field-value">
                            {editMode ? (
                                <DatePicker
                                    selected={todo.endDate ? new Date(todo.endDate) : null}
                                    onChange={(date) => {
                                        onTodoChange(todo.id, {
                                            endDate: date ? date.toISOString() : undefined,
                                        });
                                    }}
                                    minDate={startDateObj || today}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Select date"
                                    className="date-input"
                                />
                            ) : (
                                <span>{formatDate(todo.endDate)}</span>
                            )}
                        </div>
                    </div>
                    <div className="meta-field">
                        <label className="field-label">
                            <User size={12} />
                            Assignee
                        </label>
                        <div className="field-value assignee">
                            {editMode ? (
                                <select
                                    value={currentAssignee || ""}
                                    onChange={(e) => {
                                        const newAssigneeId = e.target.value === "" ? null : e.target.value;
                                        const newAssigneeInfo = newAssigneeId
                                            ? attendees?.find((att: any) => att.id === newAssigneeId)
                                            : null;

                                        onTodoChange(todo.id, {
                                            assigneeId: newAssigneeId,
                                            assignee: newAssigneeInfo
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
                                    <option value="">Unassigned</option>
                                    {attendees?.map((attendee: any, idx: number) => (
                                        <option key={idx} value={attendee.id}>
                                            {attendee.fullName || attendee.email}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span>{getTodoAssigneeName(todo)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="task-actions">
                {editMode ? (
                    <>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={async (e) => {
                                e.stopPropagation();
                                if (!isTitleEmpty) {
                                    await onEditSave(todo);
                                }
                            }}
                            className="save-btn"
                            title={isTitleEmpty ? "Task name is required" : "Save"}
                            disabled={isTitleEmpty}
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
                            title="Cancel"
                        >
                            <X size={16} />
                        </Button>
                    </>
                ) : !isConverted ? (
                    <>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditStart(todo.id, { ...todo });
                            }}
                            className="edit-btn"
                            title="Edit"
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
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </Button>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default TodoCard;
