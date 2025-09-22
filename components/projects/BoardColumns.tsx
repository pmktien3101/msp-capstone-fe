"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import { TaskCard } from "./TaskCard";
import { AddColumnModal } from "./AddColumnModal";
import { ColumnMenu } from "./ColumnMenu";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { mockTasks, mockMembers, mockMilestones, mockProjects } from "@/constants/mockData";
import { Task } from "@/types/milestone";
import { ChevronDown, Plus } from "lucide-react";
import { useUser } from "@/hooks/useUser";

interface BoardColumnsProps {
  project: Project;
  searchQuery: string;
  groupBy: string;
  onTaskClick?: (task: any) => void;
  onCreateTask?: () => void;
}

export const BoardColumns = ({
  project,
  searchQuery,
  groupBy,
  onTaskClick,
}: BoardColumnsProps) => {
  const { role } = useUser();

  // Check permissions
  const canCreateTask = role && role.toLowerCase() !== 'member';
  const canCreateColumn = role && role.toLowerCase() !== 'member';
  const canDeleteColumn = role && role.toLowerCase() !== 'member';
  // Get tasks for this specific project based on milestoneIds
  const projectMilestones = mockProjects.find(p => p.id === project.id)?.milestones || [];
  const projectTasks = mockTasks.filter(task =>
    task.milestoneIds.some(milestoneId => projectMilestones.includes(milestoneId))
  );

  // Map projectTasks to Task interface with proper member information
  const mappedTasks: Task[] = projectTasks.map(task => {
    const assigneeMember = mockMembers.find(member => member.id === task.assignee);
    return {
      id: task.id,
      title: task.title,
      name: task.title,
      description: task.description,
      epic: "", // Not in mockdata, can be added later
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      assignedTo: assigneeMember ? {
        id: assigneeMember.id,
        name: assigneeMember.name,
        email: assigneeMember.email,
        avatar: assigneeMember.avatar,
        role: assigneeMember.role
      } : null,
      startDate: task.startDate,
      endDate: task.endDate,
      dueDate: task.endDate,
      createdDate: task.startDate,
      updatedDate: task.endDate,
      tags: [],
      projectId: project.id,
      milestoneId: task.milestoneIds?.[0] || "milestone-1",
      milestoneIds: task.milestoneIds || ["milestone-1"],
      comments: []
    };
  });

  const [tasks, setTasks] = useState<Task[]>(mappedTasks);

  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [createTaskColumn, setCreateTaskColumn] = useState<string>("");

  const [columns, setColumns] = useState([
    {
      id: "todo",
      title: "CẦN LÀM",
      color: "#6b7280",
      order: 0,
    },
    {
      id: "in-progress",
      title: "ĐANG LÀM",
      color: "#f59e0b",
      order: 1,
    },
    {
      id: "review",
      title: "ĐANG REVIEW",
      color: "#3b82f6",
      order: 2,
    },
    {
      id: "done",
      title: "HOÀN THÀNH",
      color: "#10b981",
      order: 3,
    },
  ]);

  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(
    null
  );
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.epic?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTaskMove = (taskId: string, newStatus: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedTask) {
      handleTaskMove(draggedTask, columnId);
    }
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const handleAddColumn = (title: string, color: string) => {
    const newColumn = {
      id: `column-${Date.now()}`,
      title: title.toUpperCase(),
      color,
      order: columns.length,
    };
    setColumns((prev) => [...prev, newColumn]);
    setShowAddColumnModal(false);
  };

  const handleCreateTaskClick = (columnId: string) => {
    setCreateTaskColumn(columnId);
    setShowCreateTaskModal(true);
  };

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleCreateTask = (taskData: any) => {
    const assignee = taskData.assigneeId
      ? mockMembers.find((m) => m.id === taskData.assigneeId) || null
      : null;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      name: taskData.title,
      description: taskData.description || "",
      epic: taskData.epic || "",
      status: taskData.status || "todo",
      priority: taskData.priority || "medium",
      assignee: assignee?.name || taskData.assignee || null,
      assignedTo: assignee ? {
        id: assignee.id,
        name: assignee.name,
        email: assignee.email,
        avatar: assignee.avatar,
        role: assignee.role
      } : null,
      startDate: taskData.startDate,
      endDate: taskData.endDate,
      dueDate: taskData.endDate || new Date().toISOString().split("T")[0],
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      tags: taskData.tags || [],
      projectId: project.id,
      milestoneId: taskData.milestoneId || "milestone-1",
      milestoneIds: taskData.milestoneIds || [taskData.milestoneId || "milestone-1"],
      comments: [],
    };

    setTasks((prev) => [...prev, newTask]);
    setShowCreateTaskModal(false);
    setCreateTaskColumn("");
  };

  const handleDeleteColumn = (columnId: string) => {
    // Move all tasks from this column to the first column
    const firstColumnId = columns[0].id;
    setTasks((prev) =>
      prev.map((task) =>
        task.status === columnId ? { ...task, status: firstColumnId } : task
      )
    );

    // Remove the column
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
  };

  const handleMoveColumnLeft = (columnId: string) => {
    setColumns((prev) => {
      const newColumns = [...prev];
      const currentIndex = newColumns.findIndex((col) => col.id === columnId);

      if (currentIndex > 0) {
        // Swap with previous column
        [newColumns[currentIndex], newColumns[currentIndex - 1]] = [
          newColumns[currentIndex - 1],
          newColumns[currentIndex],
        ];

        // Update order values
        newColumns.forEach((col, index) => {
          col.order = index;
        });
      }

      return newColumns;
    });
  };

  const handleMoveColumnRight = (columnId: string) => {
    setColumns((prev) => {
      const newColumns = [...prev];
      const currentIndex = newColumns.findIndex((col) => col.id === columnId);

      if (currentIndex < newColumns.length - 1) {
        // Swap with next column
        [newColumns[currentIndex], newColumns[currentIndex + 1]] = [
          newColumns[currentIndex + 1],
          newColumns[currentIndex],
        ];

        // Update order values
        newColumns.forEach((col, index) => {
          col.order = index;
        });
      }

      return newColumns;
    });
  };

  const handleDeleteOldItems = (columnId: string) => {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    setTasks((prev) =>
      prev.filter((task) => {
        if (task.status === columnId) {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate > fourteenDaysAgo;
        }
        return true;
      })
    );
  };

  // Generate columns based on groupBy
  const getColumnsForGroupBy = () => {
    if (groupBy === "status") {
      return columns.sort((a, b) => a.order - b.order);
    } else if (groupBy === "assignee") {
      // Create columns for each member with their own status columns
      const memberColumns: any[] = [];

      mockMembers.forEach(member => {
        const memberTasks = filteredTasks.filter(task =>
          task.assignee === member.id || task.assignedTo?.id === member.id
        );

        if (memberTasks.length > 0) {
          // Add status columns for this member
          columns.forEach(statusColumn => {
            memberColumns.push({
              id: `${member.id}-${statusColumn.id}`,
              title: statusColumn.title,
              color: statusColumn.color,
              order: memberColumns.length,
              memberId: member.id,
              statusId: statusColumn.id,
              memberName: member.name
            });
          });
        }
      });

      // Add unassigned tasks columns
      const unassignedTasks = filteredTasks.filter(task =>
        !task.assignee && !task.assignedTo
      );

      if (unassignedTasks.length > 0) {
        columns.forEach(statusColumn => {
          memberColumns.push({
            id: `unassigned-${statusColumn.id}`,
            title: statusColumn.title,
            color: statusColumn.color,
            order: memberColumns.length,
            memberId: "unassigned",
            statusId: statusColumn.id,
            memberName: "Chưa phân công"
          });
        });
      }

      return memberColumns;
    } else if (groupBy === "milestone") {
      // Create columns for each milestone with their own status columns
      const milestoneColumns: any[] = [];

      mockMilestones.forEach(milestone => {
        const milestoneTasks = filteredTasks.filter(task =>
          task.milestoneIds?.includes(milestone.id) || task.milestoneId === milestone.id
        );

        if (milestoneTasks.length > 0) {
          // Add status columns for this milestone
          columns.forEach(statusColumn => {
            milestoneColumns.push({
              id: `${milestone.id}-${statusColumn.id}`,
              title: statusColumn.title,
              color: statusColumn.color,
              order: milestoneColumns.length,
              milestoneId: milestone.id,
              statusId: statusColumn.id,
              milestoneName: milestone.name
            });
          });
        }
      });

      return milestoneColumns;
    }

    return columns.sort((a, b) => a.order - b.order);
  };

  const displayColumns = getColumnsForGroupBy();

  // Get tasks for each column based on groupBy
  const getTasksForColumn = (column: any) => {
    if (groupBy === "status") {
      return filteredTasks.filter((task) => task.status === column.id);
    } else if (groupBy === "assignee") {
      return filteredTasks.filter((task) => {
        const matchesMember = column.memberId === "unassigned"
          ? (!task.assignee && !task.assignedTo)
          : (task.assignee === column.memberId || task.assignedTo?.id === column.memberId);
        const matchesStatus = task.status === column.statusId;
        return matchesMember && matchesStatus;
      });
    } else if (groupBy === "milestone") {
      return filteredTasks.filter((task) => {
        const matchesMilestone = task.milestoneIds?.includes(column.milestoneId) || task.milestoneId === column.milestoneId;
        const matchesStatus = task.status === column.statusId;
        return matchesMilestone && matchesStatus;
      });
    }
    return [];
  };

  // Group tasks within each column based on groupBy (for milestone grouping)
  const getGroupedTasksForColumn = (column: any) => {
    const columnTasks = getTasksForColumn(column);

    if (groupBy === "status" || groupBy === "assignee" || groupBy === "milestone") {
      return { "All Tasks": columnTasks };
    }

    return { "All Tasks": columnTasks };
  };

  // Get member sections for assignee grouping
  const getMemberSections = () => {
    if (groupBy !== "assignee") return [];

    const sections: any[] = [];

    mockMembers.forEach(member => {
      const memberTasks = filteredTasks.filter(task =>
        task.assignee === member.id || task.assignedTo?.id === member.id
      );

      if (memberTasks.length > 0) {
        sections.push({
          id: member.id,
          name: member.name,
          taskCount: memberTasks.length,
          memberId: member.id
        });
      }
    });

    // Add unassigned section
    const unassignedTasks = filteredTasks.filter(task =>
      !task.assignee && !task.assignedTo
    );

    if (unassignedTasks.length > 0) {
      sections.push({
        id: "unassigned",
        name: "Chưa phân công",
        taskCount: unassignedTasks.length,
        memberId: "unassigned"
      });
    }

    return sections;
  };

  // Get milestone sections for milestone grouping
  const getMilestoneSections = () => {
    if (groupBy !== "milestone") return [];

    const sections: any[] = [];

    mockMilestones.forEach(milestone => {
      const milestoneTasks = filteredTasks.filter(task =>
        task.milestoneIds?.includes(milestone.id) || task.milestoneId === milestone.id
      );

      if (milestoneTasks.length > 0) {
        sections.push({
          id: milestone.id,
          name: milestone.name,
          taskCount: milestoneTasks.length,
          milestoneId: milestone.id
        });
      }
    });

    return sections;
  };

  const memberSections = getMemberSections();
  const milestoneSections = getMilestoneSections();

  return (
    <div className="board-columns">
      {groupBy === "assignee" ? (
        // Render swimlane layout for assignee grouping
        <div className="swimlanes-container">
          {memberSections.map((section) => {
            const member = mockMembers.find(m => m.id === section.memberId);
            const isCollapsed = collapsedSections.has(section.id);

            return (
              <div key={section.id} className="swimlane">
                <div className="swimlane-header">
                  <div className="swimlane-title-container">
                    <div className="member-info">
                      <div className="member-avatar">
                        {member?.avatar || section.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="swimlane-title">
                        {section.name} ({section.taskCount} công việc)
                      </span>
                    </div>
                    <button
                      className="collapse-toggle"
                      onClick={() => toggleSectionCollapse(section.id)}
                    >
                      <ChevronDown
                        size={16}
                        style={{
                          transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </button>
                  </div>
                </div>
                {!isCollapsed && (
                  <div className="swimlane-columns">
                    {columns.map((statusColumn) => {
                      const column = {
                        id: `${section.memberId}-${statusColumn.id}`,
                        title: statusColumn.title,
                        color: statusColumn.color,
                        memberId: section.memberId,
                        statusId: statusColumn.id,
                        memberName: section.name
                      };
                      const columnTasks = getTasksForColumn(column);
                      const groupedTasks = getGroupedTasksForColumn(column);

                      return (
                        <div
                          key={column.id}
                          className={`board-column ${draggedOverColumn === column.id ? "drag-over" : ""
                            }`}
                          onDragOver={(e) => handleDragOver(e, column.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, column.id)}
                        >
                          <div className="column-header">
                            <div className="column-title">
                              <div
                                className="column-indicator"
                                style={{ backgroundColor: column.color }}
                              ></div>
                              <span>{column.title}</span>
                            </div>
                            <div className="column-actions">
                              <span className="column-count">{columnTasks.length}</span>
                            </div>
                          </div>

                          <div className="column-content">
                            {Object.entries(groupedTasks).map(([groupName, tasks]) => (
                              <div key={groupName} className="task-group">
                                <div className="group-tasks">
                                  {tasks.map((task) => (
                                    <TaskCard
                                      key={task.id}
                                      task={task}
                                      onMove={(newStatus) => handleTaskMove(task.id, newStatus)}
                                      onDragStart={(e) => handleDragStart(e, task.id)}
                                      onTaskClick={onTaskClick}
                                      isDragging={draggedTask === task.id}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}

                            {canCreateTask && (
                              <button
                                className="create-task-btn"
                                onClick={() => handleCreateTaskClick(statusColumn.id)}
                              >
                                <Plus size={16} />
                                Tạo
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : groupBy === "milestone" ? (
        // Render swimlane layout for milestone grouping
        <div className="swimlanes-container">
          {milestoneSections.map((section) => {
            const milestone = mockMilestones.find(m => m.id === section.milestoneId);
            const isCollapsed = collapsedSections.has(section.id);

            return (
              <div key={section.id} className="swimlane">
                <div className="swimlane-header">
                  <div className="swimlane-title-container">
                    <div className="member-info">
                      <span className="swimlane-title">
                        {section.name} ({section.taskCount} công việc)
                      </span>
                    </div>
                    <button
                      className="collapse-toggle"
                      onClick={() => toggleSectionCollapse(section.id)}
                    >
                      <ChevronDown
                        size={16}
                        style={{
                          transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </button>
                  </div>
                </div>
                {!isCollapsed && (
                  <div className="swimlane-columns">
                    {columns.map((statusColumn) => {
                      const column = {
                        id: `${section.milestoneId}-${statusColumn.id}`,
                        title: statusColumn.title,
                        color: statusColumn.color,
                        milestoneId: section.milestoneId,
                        statusId: statusColumn.id,
                        milestoneName: section.name
                      };
                      const columnTasks = getTasksForColumn(column);
                      const groupedTasks = getGroupedTasksForColumn(column);

                      return (
                        <div
                          key={column.id}
                          className={`board-column ${draggedOverColumn === column.id ? "drag-over" : ""
                            }`}
                          onDragOver={(e) => handleDragOver(e, column.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, column.id)}
                        >
                          <div className="column-header">
                            <div className="column-title">
                              <div
                                className="column-indicator"
                                style={{ backgroundColor: column.color }}
                              ></div>
                              <span>{column.title}</span>
                            </div>
                            <div className="column-actions">
                              <span className="column-count">{columnTasks.length}</span>
                            </div>
                          </div>

                          <div className="column-content">
                            {Object.entries(groupedTasks).map(([groupName, tasks]) => (
                              <div key={groupName} className="task-group">
                                <div className="group-tasks">
                                  {tasks.map((task) => (
                                    <TaskCard
                                      key={task.id}
                                      task={task}
                                      onMove={(newStatus) => handleTaskMove(task.id, newStatus)}
                                      onDragStart={(e) => handleDragStart(e, task.id)}
                                      onTaskClick={onTaskClick}
                                      isDragging={draggedTask === task.id}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}

                            {canCreateTask && (
                              <button
                                className="create-task-btn"
                                onClick={() => handleCreateTaskClick(statusColumn.id)}
                              >
                                <Plus size={16} />
                                Tạo
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Render normal layout for status grouping
        <div className="columns-container">
          {displayColumns.map((column) => {
            const columnTasks = getTasksForColumn(column);
            const groupedTasks = getGroupedTasksForColumn(column);

            return (
              <div
                key={column.id}
                className={`board-column ${draggedOverColumn === column.id ? "drag-over" : ""
                  }`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="column-header">
                  <div className="column-title">
                    <div
                      className="column-indicator"
                      style={{ backgroundColor: column.color }}
                    ></div>
                    <span>{column.title}</span>
                  </div>
                  <div className="column-actions">
                    <span className="column-count">{columnTasks.length}</span>
                    {canDeleteColumn && (
                      <ColumnMenu
                        columnId={column.id}
                        columnTitle={column.title}
                        isDoneColumn={
                          column.id === "done" ||
                          column.title.includes("HOÀN THÀNH")
                        }
                        onMoveLeft={() => handleMoveColumnLeft(column.id)}
                        onMoveRight={() => handleMoveColumnRight(column.id)}
                        onDelete={() => handleDeleteColumn(column.id)}
                        onDeleteOldItems={
                          column.id === "done" ||
                            column.title.includes("HOÀN THÀNH")
                            ? () => handleDeleteOldItems(column.id)
                            : undefined
                        }
                        canMoveLeft={
                          displayColumns.findIndex((col) => col.id === column.id) > 0
                        }
                        canMoveRight={
                          displayColumns.findIndex((col) => col.id === column.id) <
                          displayColumns.length - 1
                        }
                      />
                    )}
                  </div>
                </div>

                <div className="column-content">
                  {Object.entries(groupedTasks).map(([groupName, tasks]) => (
                    <div key={groupName} className="task-group">
                      {groupBy !== "status" && (
                        <div className="group-header">
                          <span className="group-title">{groupName}</span>
                          <span className="group-count">({tasks.length})</span>
                        </div>
                      )}
                      <div className="group-tasks">
                        {tasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onMove={(newStatus) => handleTaskMove(task.id, newStatus)}
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onTaskClick={onTaskClick}
                            isDragging={draggedTask === task.id}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {canCreateTask && (
                    <button
                      className="create-task-btn"
                      onClick={() => handleCreateTaskClick(column.id)}
                    >
                      <Plus size={16} />
                      Tạo
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {groupBy === "status" && canCreateColumn && (
            <button
              className="add-column-btn"
              onClick={() => setShowAddColumnModal(true)}
            >
              <Plus size={16} />
              Thêm cột
            </button>
          )}
        </div>
      )}

      {showAddColumnModal && (
        <AddColumnModal
          onClose={() => setShowAddColumnModal(false)}
          onAdd={handleAddColumn}
        />
      )}

      {showCreateTaskModal && (
        <CreateTaskModal
          isOpen={showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(false)}
          onCreateTask={handleCreateTask}
          milestoneId={createTaskColumn}
          defaultStatus={createTaskColumn}
        />
      )}

      <style jsx>{`
        .board-columns {
          flex: 1;
          overflow: hidden;
          background: #f8f9fa;
        }

        .swimlanes-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow-y: auto;
        }

        .swimlane {
          margin-bottom: 16px;
          background: white;
          border-radius: 6px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }

        .swimlane-header {
          padding: 10px 14px;
          border-bottom: 1px solid #e5e7eb;
          background: #f8f9fa;
          border-radius: 4px 4px 0 0;
        }

        .swimlane-title-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .member-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .member-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          background: linear-gradient(135deg, #fb923c, #fbbf24);
          color: white;
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(251, 146, 60, 0.3);
        }

        .swimlane-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .collapse-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          border-radius: 3px;
          color: #6b7280;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .collapse-toggle:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .swimlane-columns {
          display: flex;
          gap: 12px;
          padding: 12px;
          overflow-x: auto;
        }

        .columns-container {
          display: flex;
          height: 100%;
          gap: 12px;
          padding: 12px;
          overflow-x: auto;
        }

        .board-column {
          min-width: 200px;
          max-width: 200px;
          background: #f1f3f4;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          height: fit-content;
          max-height: calc(100vh - 120px);
          transition: all 0.2s ease;
        }

        .board-column.drag-over {
          background: #e0f2fe;
          border: 2px dashed #0ea5e9;
        }

        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .column-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .column-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          color: #374151;
          font-size: 13px;
        }

        .column-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .column-count {
          background: #e5e7eb;
          color: #6b7280;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 500;
        }

        .column-content {
          flex: 1;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          overflow-y: auto;
        }

        .task-group {
          margin-bottom: 8px;
        }

        .group-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
          padding: 4px 8px;
          background: #f8f9fa;
          border-radius: 3px;
          border-left: 2px solid #3b82f6;
        }

        .group-title {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
        }

        .group-count {
          font-size: 10px;
          color: #6b7280;
          background: #e5e7eb;
          padding: 1px 4px;
          border-radius: 8px;
        }

        .group-tasks {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .create-task-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 6px;
          border: 2px dashed #d1d5db;
          border-radius: 4px;
          background: transparent;
          color: #6b7280;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 4px;
        }

        .create-task-btn:hover {
          border-color: #9ca3af;
          color: #374151;
          background: #f9fafb;
        }

        .add-column-btn {
          min-width: 130px;
          height: 40px;
          border: 2px dashed #d1d5db;
          border-radius: 4px;
          background: transparent;
          color: #6b7280;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.2s ease;
          margin-top: 12px;
        }

        .add-column-btn:hover {
          border-color: #9ca3af;
          color: #374151;
          background: #f9fafb;
        }

        /* Responsive Design */
        
        /* Large Desktop (1200px+) */
        @media (min-width: 1200px) {
          .columns-container {
            padding: 20px;
            gap: 20px;
          }

          .board-column {
            min-width: 220px;
            max-width: 220px;
          }

          .add-column-btn {
            min-width: 150px;
          }
        }

        /* Desktop (1024px - 1199px) */
        @media (max-width: 1199px) and (min-width: 1024px) {
          .columns-container {
            padding: 18px;
            gap: 18px;
          }

          .board-column {
            min-width: 210px;
            max-width: 210px;
          }

          .add-column-btn {
            min-width: 140px;
          }
        }

        /* Tablet (768px - 1023px) */
        @media (max-width: 1023px) and (min-width: 769px) {
          .columns-container {
            padding: 16px;
            gap: 16px;
          }

          .board-column {
            min-width: 200px;
            max-width: 200px;
          }

          .add-column-btn {
            min-width: 130px;
          }

          .column-header {
            padding: 12px 14px;
          }

          .column-title {
            font-size: 13px;
          }

          .task-count {
            font-size: 11px;
            padding: 2px 6px;
          }

          .column-menu-btn {
            width: 24px;
            height: 24px;
          }

          .create-btn {
            padding: 8px 12px;
            font-size: 12px;
          }

          .swimlane-header {
            padding: 8px 12px;
            margin-bottom: 8px;
          }

          .swimlane-title {
            font-size: 12px;
          }

          .swimlane-count {
            font-size: 10px;
            padding: 1px 5px;
          }

          .member-avatar {
            width: 22px;
            height: 22px;
            font-size: 10px;
          }

          .collapse-btn {
            width: 20px;
            height: 20px;
          }

          .tasks-container {
            padding: 8px;
            gap: 8px;
          }
        }

        /* Mobile Large (481px - 768px) */
        @media (max-width: 768px) and (min-width: 481px) {
          .columns-container {
            padding: 12px;
            gap: 12px;
            flex-direction: column;
            align-items: stretch;
          }

          .board-column {
            min-width: 100%;
            max-width: 100%;
            margin-bottom: 12px;
          }

          .add-column-btn {
            min-width: 100%;
            margin-bottom: 12px;
          }

          .column-header {
            padding: 10px 12px;
          }

          .column-title {
            font-size: 12px;
          }

          .task-count {
            font-size: 10px;
            padding: 1px 5px;
          }

          .column-menu-btn {
            width: 22px;
            height: 22px;
          }

          .create-btn {
            padding: 6px 10px;
            font-size: 11px;
          }

          .swimlane-header {
            padding: 6px 10px;
            margin-bottom: 6px;
          }

          .swimlane-title {
            font-size: 11px;
          }

          .swimlane-count {
            font-size: 9px;
            padding: 1px 4px;
          }

          .member-avatar {
            width: 20px;
            height: 20px;
            font-size: 9px;
          }

          .collapse-btn {
            width: 18px;
            height: 18px;
          }

          .tasks-container {
            padding: 6px;
            gap: 6px;
          }
        }

        /* Mobile Small (320px - 480px) */
        @media (max-width: 480px) {
          .columns-container {
            padding: 8px;
            gap: 8px;
            flex-direction: column;
            align-items: stretch;
          }

          .board-column {
            min-width: 100%;
            max-width: 100%;
            margin-bottom: 8px;
          }

          .add-column-btn {
            min-width: 100%;
            margin-bottom: 8px;
            padding: 8px 12px;
            font-size: 12px;
          }

          .column-header {
            padding: 8px 10px;
          }

          .column-title {
            font-size: 11px;
          }

          .task-count {
            font-size: 9px;
            padding: 1px 4px;
          }

          .column-menu-btn {
            width: 20px;
            height: 20px;
          }

          .create-btn {
            padding: 5px 8px;
            font-size: 10px;
          }

          .swimlane-header {
            padding: 5px 8px;
            margin-bottom: 5px;
          }

          .swimlane-title {
            font-size: 10px;
          }

          .swimlane-count {
            font-size: 8px;
            padding: 1px 3px;
          }

          .member-avatar {
            width: 18px;
            height: 18px;
            font-size: 8px;
          }

          .collapse-btn {
            width: 16px;
            height: 16px;
          }

          .tasks-container {
            padding: 4px;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};
