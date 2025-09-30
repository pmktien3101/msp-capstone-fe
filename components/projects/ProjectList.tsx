"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import { MilestoneListView } from "./MilestoneListView";

interface ProjectListProps {
  project: Project;
}

export const ProjectList = ({ project }: ProjectListProps) => {
  return (
    <div className="project-list">
      <MilestoneListView project={project} />

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
