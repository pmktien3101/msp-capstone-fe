'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectModalContextType {
  isCreateModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  triggerProjectRefresh: () => void;
  projectRefreshTrigger: number;
}

const ProjectModalContext = createContext<ProjectModalContextType | undefined>(undefined);

export function ProjectModalProvider({ children }: { children: ReactNode }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectRefreshTrigger, setProjectRefreshTrigger] = useState(0);

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);
  const triggerProjectRefresh = () => setProjectRefreshTrigger(prev => prev + 1);

  return (
    <ProjectModalContext.Provider value={{
      isCreateModalOpen,
      openCreateModal,
      closeCreateModal,
      triggerProjectRefresh,
      projectRefreshTrigger
    }}>
      {children}
    </ProjectModalContext.Provider>
  );
}

export function useProjectModal() {
  const context = useContext(ProjectModalContext);
  if (context === undefined) {
    throw new Error('useProjectModal must be used within a ProjectModalProvider');
  }
  return context;
}
