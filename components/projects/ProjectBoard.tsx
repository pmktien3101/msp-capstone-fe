import { useState } from "react";
import { Project } from "@/types/project";
import { BoardHeader } from "./BoardHeader";
import { mockTasks, mockMembers } from "@/constants/mockData";

interface ProjectBoardProps {
  project: Project;
  onTaskClick?: (task: any) => void;
  onCreateTask?: () => void;
}

// Map lấy tên member từ ID
const memberMap = Object.fromEntries(
  mockMembers.map((m) => [m.id, m.name])
);

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng trong JS từ 0-11
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

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
      {onCreateTask && (
        <div className="create-task-container">
          <button onClick={onCreateTask}>Tạo công việc mới</button>
        </div>
      )}

      {/* List table công việc */}
      <div className="task-list">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tiêu đề</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Người thực hiện</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task, index) => (
              <tr key={task.id} onClick={() => onTaskClick?.(task)}>
                <td>{index + 1}</td> {/* Hiển thị số thứ tự */}
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>{task.status}</td>
                <td>{task.assignee ? memberMap[task.assignee] : "Chưa giao"}</td>
                <td>{formatDate(task.startDate)}</td>
                <td>{formatDate(task.endDate)}</td>
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
        .create-task-container {
          padding: 6px 0px;
          background: #fff;
          border-bottom: 1px solid #ddd;
        }
        button {
          padding: 8px 16px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        button:hover {
          background: #005bb5;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 15px;
          table-layout: fixed;
        }
        th, td {
          border: 1px solid #eee;
          padding: 6px 8px;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        tr:hover {
          background: #f0f5fa;
          cursor: pointer;
        }
        /* Cố định độ rộng cột, có thể điều chỉnh theo nhu cầu */
        th:nth-child(1), td:nth-child(1) { width: 50px; }
        th:nth-child(2), td:nth-child(2) { width: 150px; }
        th:nth-child(3), td:nth-child(3) { width: 250px; }
        th:nth-child(4), td:nth-child(4) { width: 100px; }
        th:nth-child(5), td:nth-child(5) { width: 120px; }
        th:nth-child(6), td:nth-child(6) { width: 100px; }
        th:nth-child(7), td:nth-child(7) { width: 100px; }
      `}</style>
    </div>
  );
};
