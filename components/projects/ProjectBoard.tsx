'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { BoardHeader } from './BoardHeader';
import { BoardColumns } from './BoardColumns';
import { mockProject } from '@/constants/mockData';

interface ProjectBoardProps {
  project: Project;
}

export const ProjectBoard = ({ project }: ProjectBoardProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('status');

  return (
    <div className="project-board">
      <BoardHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
      />
      <BoardColumns 
        project={mockProject}
        searchQuery={searchQuery}
        groupBy={groupBy}
      />
      
      <style jsx>{`
        .project-board {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
        }
      `}</style>
    </div>
  );
};