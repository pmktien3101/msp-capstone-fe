'use client';

import { Button } from "@/components/ui/button";
import { useProjectModal } from "@/contexts/ProjectModalContext";
import { useUser } from "@/hooks/useUser";
import { Plus } from 'lucide-react';
import '@/app/styles/project-header.scss';

export function ProjectHeader() {
  const { openCreateModal } = useProjectModal();
  const { role } = useUser();

  // Check if user can create projects (ProjectManager or BusinessOwner)
  const canCreateProject = role === 'ProjectManager' || role === 'BusinessOwner';

  const handleCreateClick = () => {
    console.log('Create project button clicked!');
    openCreateModal();
  };

  return (
    <div className="page-header">
      <div className="header-content">
        <div className="header-title">
          <h1>All Projects</h1>
          <p>Manage and track all your projects</p>
        </div>
        <div className="header-actions">
          {canCreateProject && (
            <Button 
              onClick={handleCreateClick} 
              variant="default"
              className="btn-create-project"
            >
              <Plus size={16} />
              Create New Project
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
