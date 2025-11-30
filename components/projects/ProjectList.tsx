"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import { MilestoneListView } from "./MilestoneListView";

interface ProjectListProps {
  project: Project;
  refreshKey?: number;
  onCreateMilestone?: () => void;
  readOnly?: boolean;
}

export const ProjectList = ({ project, refreshKey = 0, onCreateMilestone, readOnly = false }: ProjectListProps) => {
  return (
      <MilestoneListView 
        project={project} 
        refreshKey={refreshKey}
        onCreateMilestone={onCreateMilestone}
        readOnly={readOnly}
      />
  );
};
