"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import { MilestoneListView } from "./MilestoneListView";

interface ProjectListProps {
  project: Project;
  refreshKey?: number;
}

export const ProjectList = ({ project, refreshKey = 0 }: ProjectListProps) => {
  // Safety check: if no project, show empty state
  if (!project || !project.id) {
    return (
      <div className="project-list">
        <div className="empty-project-state">
          <h3>Không tìm thấy dự án</h3>
          <p>Vui lòng chọn một dự án để xem chi tiết.</p>
        </div>

        <style jsx>{`
          .project-list {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
          }

          .empty-project-state {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .empty-project-state h3 {
            margin: 0 0 12px 0;
            color: #1f2937;
            font-size: 20px;
            font-weight: 600;
          }

          .empty-project-state p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="project-list">
      <MilestoneListView project={project} refreshKey={refreshKey} />

      <style jsx>{`
        .project-list {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
        }

        /* Responsive Design */
        
        /* Tablet (768px - 1023px) */
        @media (max-width: 1023px) and (min-width: 769px) {
          .project-list {
            height: calc(100vh - 60px);
          }
        }

        /* Mobile Large (481px - 768px) */
        @media (max-width: 768px) and (min-width: 481px) {
          .project-list {
            height: calc(100vh - 50px);
          }
        }

        /* Mobile Small (320px - 480px) */
        @media (max-width: 480px) {
          .project-list {
            height: calc(100vh - 40px);
          }
        }
      `}</style>
    </div>
  );
};
