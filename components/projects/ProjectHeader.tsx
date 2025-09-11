'use client';

import { Button } from "@/components/ui/button";

interface ProjectHeaderProps {
  onCreateProject: () => void;
}

export function ProjectHeader({ onCreateProject }: ProjectHeaderProps) {
  return (
    <div className="page-header">
      <div className="header-actions">
        <Button onClick={onCreateProject} variant="default">
          ➕ Tạo Dự Án Mới
        </Button>
        <Button variant="secondary">
          📊 Xem Báo Cáo
        </Button>
      </div>
    </div>
  );
}
