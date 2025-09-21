"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import { ListHeader } from "./ListHeader";
import { ListTable } from "./ListTable";
import { mockProject } from "@/constants/mockData";

interface ProjectListProps {
  project: Project;
}

export const ProjectList = ({ project }: ProjectListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  return (
    <div className="project-list">
      <ListHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        assigneeFilter={assigneeFilter}
        onAssigneeFilterChange={setAssigneeFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />
      <ListTable
        project={project || mockProject}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        assigneeFilter={assigneeFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />

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
