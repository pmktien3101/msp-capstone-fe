'use client';

import { Button } from "@/components/ui/button";
import { useProjectModal } from "@/contexts/ProjectModalContext";
import { Plus } from 'lucide-react';

export function ProjectHeader() {
  const { openCreateModal } = useProjectModal();

  return (
    <div className="page-header">
      <div className="header-actions">
        <Button 
          onClick={openCreateModal} 
          variant="default"
          style={{
            background: 'transparent',
            color: '#FF5E13',
            border: '1px solid #FF5E13',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FF5E13';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#FF5E13';
          }}
        >
          <Plus size={16} />
          Tạo Dự Án Mới
        </Button>
      </div>
    </div>
  );
}
