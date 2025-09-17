'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectModalContextType {
  isCreateModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
}

const ProjectModalContext = createContext<ProjectModalContextType | undefined>(undefined);

export function ProjectModalProvider({ children }: { children: ReactNode }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  return (
    <ProjectModalContext.Provider value={{
      isCreateModalOpen,
      openCreateModal,
      closeCreateModal
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
