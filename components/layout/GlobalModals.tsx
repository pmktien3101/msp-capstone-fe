'use client';

import { useProjectModal } from '@/contexts/ProjectModalContext'
import { CreateProjectModal } from '@/components/projects/modals/CreateProjectModal'

export function GlobalModals() {
  const { isCreateModalOpen, closeCreateModal } = useProjectModal();

  return (
    <>
      {/* Global Modals */}
      {isCreateModalOpen && (
        <CreateProjectModal 
          isOpen={isCreateModalOpen} 
          onClose={closeCreateModal}
        />
      )}
    </>
  )
}
