'use client';

import { useProjectModal } from '@/contexts/ProjectModalContext'
import { CreateProjectModal } from '@/components/projects/modals/CreateProjectModal'

export function GlobalModals() {
  const { isCreateModalOpen, closeCreateModal, triggerProjectRefresh } = useProjectModal();

  const handleProjectCreated = () => {
    triggerProjectRefresh();
    closeCreateModal();
  };

  return (
    <>
      {/* Global Modals */}
      {isCreateModalOpen && (
        <CreateProjectModal 
          isOpen={isCreateModalOpen} 
          onClose={closeCreateModal}
          onCreateProject={handleProjectCreated}
        />
      )}
    </>
  )
}
