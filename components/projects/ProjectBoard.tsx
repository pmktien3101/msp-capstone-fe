import { useState } from "react";
import { Project } from "@/types/project";
import { BoardHeader } from "./BoardHeader";
import { mockProject, mockTasks, mockMembers } from "@/constants/mockData";

interface ProjectBoardProps {
  project: Project;
  onTaskClick?: (task: any) => void;
  onCreateTask?: () => void;
}

// Map lấy tên member từ ID
const memberMap = Object.fromEntries(
  mockMembers.map((m) => [m.id, m.name])
);

export const ProjectBoard = ({
  project,
  onTaskClick,
  onCreateTask,
}: ProjectBoardProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Lấy danh sách milestone id của project hiện tại
  const projectMilestoneIds = project.milestones || [];

  // Lọc tasks chỉ thuộc project hiện tại
  const tasksOfCurrentProject = mockTasks.filter(
    (task) =>
      task.milestoneIds &&
      task.milestoneIds.some((id) => projectMilestoneIds.includes(id))
  );

  // Filter thêm theo search nếu có
  const filteredTasks = tasksOfCurrentProject.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="project-board">
      <BoardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        groupBy={""}
        onGroupByChange={() => {}}
      />

      {/* List table công việc */}
      <div className="task-list">
        <table>
          <thead>
            <tr>
              <th>Số</th>
              <th>Tiêu đề</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Người thực hiện</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id} onClick={() => onTaskClick?.(task)}>
                <td>{task.id}</td>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>{task.status}</td>
                <td>{memberMap[task.assignee] || "Chưa giao"}</td>
                <td>{task.startDate}</td>
                <td>{task.endDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .project-board {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
        }
        .task-list {
          padding: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          border: 1px solid #eee;
          padding: 6px 8px;
          text-align: left;
        }
        tr:hover {
          background: #f0f5fa;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
