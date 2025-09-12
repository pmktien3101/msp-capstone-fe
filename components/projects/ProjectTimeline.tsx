'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { TimelineHeader } from './TimelineHeader';
import { WorkItemsList } from './WorkItemsList';
import { GanttChart } from './GanttChart';
import { TimelineControls } from './TimelineControls';
import { mockProject } from '@/constants/mockData';

interface ProjectTimelineProps {
  project: Project;
}

export const ProjectTimeline = ({ project }: ProjectTimelineProps) => {
  const [timeScale, setTimeScale] = useState('weeks');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  return (
    <div className="project-timeline">
      <TimelineHeader />
      
      <div className="timeline-layout">
        <div className="timeline-sidebar">
          <WorkItemsList 
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
          />
        </div>
        
        <div className="timeline-main">
          <GanttChart 
            timeScale={timeScale}
            selectedItems={selectedItems}
          />
        </div>
      </div>

      <TimelineControls 
        timeScale={timeScale}
        onTimeScaleChange={setTimeScale}
      />

      <style jsx>{`
        .project-timeline {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
        }

        .timeline-layout {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .timeline-sidebar {
          width: 300px;
          background: white;
          border-right: 1px solid #e5e7eb;
          overflow-y: auto;
        }

        .timeline-main {
          flex: 1;
          overflow: auto;
          background: white;
        }
      `}</style>
    </div>
  );
};
