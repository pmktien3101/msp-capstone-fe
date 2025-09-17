'use client';

import { Button } from "@/components/ui/button";
import { useProjectModal } from "@/contexts/ProjectModalContext";

export function ProjectHeader() {
  const { openCreateModal } = useProjectModal();

  return (
    <div className="page-header">
      <div className="header-actions">
        <Button onClick={openCreateModal} variant="default">
          ➕ Tạo Dự Án Mới
        </Button>
        <Button variant="secondary">
          📊 Xem Báo Cáo
        </Button>
      </div>
    </div>
  );
}
