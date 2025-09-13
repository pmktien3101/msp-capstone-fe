'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { Meeting, MeetingStatus } from '@/types/meeting';
import { Milestone, Task } from '@/types/milestone';
import { Member } from '@/types/member';
import ProjectOverview from '@/components/dashboard/ProjectOverview';
import UpcomingMeetings from '@/components/dashboard/UpcomingMeetings';
import RecentMeetings from '@/components/dashboard/RecentMeetings';
import Milestones from '@/components/dashboard/Milestones';
import TaskStatusBoard from '@/components/dashboard/TaskStatusBoard';
import Documents from '@/components/dashboard/Documents';
import TeamActivity from '@/components/dashboard/TeamActivity';
import '@/app/styles/dashboard.scss';

export default function DashboardPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Mock data - trong thực tế sẽ lấy từ API
  const projects: Project[] = [
    {
      id: '1',
      name: 'Meeting Support Platform',
      description: 'Platform hỗ trợ quản lý cuộc họp',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      manager: 'Nguyễn Văn A',
      members: [],
      progress: 75
    },
    {
      id: '2',
      name: 'E-commerce Website',
      description: 'Website thương mại điện tử',
      status: 'active',
      startDate: '2024-02-01',
      endDate: '2024-08-31',
      manager: 'Trần Thị B',
      members: [],
      progress: 45
    }
  ];

  const meetings: Meeting[] = [
    // Project 1 meetings
    {
      id: '1',
      title: 'Sprint Planning Meeting',
      description: 'Lập kế hoạch sprint mới',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      participants: ['user1', 'user2', 'user3'],
      createdBy: 'user1',
      status: MeetingStatus.SCHEDULED
    },
    {
      id: '2',
      title: 'Design Review',
      description: 'Review thiết kế UI/UX',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
      participants: ['user2', 'user4'],
      createdBy: 'user2',
      status: MeetingStatus.SCHEDULED
    },
    {
      id: '3',
      title: 'Daily Standup',
      description: 'Cuộc họp standup hàng ngày',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      participants: ['user1', 'user2', 'user3', 'user4'],
      createdBy: 'user1',
      status: MeetingStatus.COMPLETED
    },
    // Project 2 meetings
    {
      id: '4',
      title: 'E-commerce Planning',
      description: 'Lập kế hoạch phát triển e-commerce',
      startTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
      participants: ['user3', 'user4'],
      createdBy: 'user3',
      status: MeetingStatus.SCHEDULED
    },
    {
      id: '5',
      title: 'Backend Architecture Review',
      description: 'Review kiến trúc backend',
      startTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      endTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      participants: ['user1', 'user3'],
      createdBy: 'user1',
      status: MeetingStatus.COMPLETED
    }
  ];

  const milestones: Milestone[] = [
    // Project 1 milestones
    {
      id: 1,
      name: 'Hoàn thành thiết kế UI',
      description: 'Thiết kế giao diện người dùng cho toàn bộ hệ thống',
      startDate: '2024-01-01',
      endDate: '2024-02-15',
      status: 'completed',
      priority: 'high',
      progress: 100,
      projectId: '1',
      createdAt: '2024-01-01',
      updatedAt: '2024-02-15',
      members: []
    },
    {
      id: 2,
      name: 'Phát triển API Backend',
      description: 'Xây dựng API backend cho hệ thống',
      startDate: '2024-02-01',
      endDate: '2024-03-31',
      status: 'in-progress',
      priority: 'high',
      progress: 65,
      projectId: '1',
      createdAt: '2024-02-01',
      updatedAt: '2024-03-15',
      members: []
    },
    {
      id: 3,
      name: 'Testing & QA',
      description: 'Kiểm thử và đảm bảo chất lượng',
      startDate: '2024-04-01',
      endDate: '2024-05-15',
      status: 'pending',
      priority: 'medium',
      progress: 0,
      projectId: '1',
      createdAt: '2024-04-01',
      updatedAt: '2024-04-01',
      members: []
    },
    // Project 2 milestones
    {
      id: 4,
      name: 'Database Design',
      description: 'Thiết kế cơ sở dữ liệu cho e-commerce',
      startDate: '2024-02-15',
      endDate: '2024-03-15',
      status: 'completed',
      priority: 'high',
      progress: 100,
      projectId: '2',
      createdAt: '2024-02-15',
      updatedAt: '2024-03-15',
      members: []
    },
    {
      id: 5,
      name: 'Payment Integration',
      description: 'Tích hợp hệ thống thanh toán',
      startDate: '2024-03-01',
      endDate: '2024-04-30',
      status: 'in-progress',
      priority: 'high',
      progress: 40,
      projectId: '2',
      createdAt: '2024-03-01',
      updatedAt: '2024-03-20',
      members: []
    }
  ];

  const tasks: Task[] = [
    {
      id: 1,
      name: 'Thiết kế Dashboard',
      description: 'Thiết kế giao diện dashboard chính',
      status: 'completed',
      priority: 'high',
      dueDate: '2024-02-10',
      assignedTo: {
        id: 1,
        name: 'Nguyễn Văn A',
        email: 'a@example.com',
        role: 'Designer',
        avatar: '/avatars/user1.jpg'
      },
      milestoneId: 1
    },
    {
      id: 2,
      name: 'Implement Authentication',
      description: 'Xây dựng hệ thống xác thực',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2024-03-20',
      assignedTo: {
        id: 2,
        name: 'Trần Thị B',
        email: 'b@example.com',
        role: 'Developer',
        avatar: '/avatars/user2.jpg'
      },
      milestoneId: 2
    },
    {
      id: 3,
      name: 'Setup Database',
      description: 'Thiết lập cơ sở dữ liệu',
      status: 'pending',
      priority: 'medium',
      dueDate: '2024-03-25',
      assignedTo: {
        id: 3,
        name: 'Lê Văn C',
        email: 'c@example.com',
        role: 'Backend Developer',
        avatar: '/avatars/user3.jpg'
      },
      milestoneId: 2
    }
  ];

  const members: Member[] = [
    { id: '1', name: 'Nguyễn Văn A', role: 'Project Manager', avatar: '/avatars/user1.jpg', email: 'a@example.com' },
    { id: '2', name: 'Trần Thị B', role: 'Developer', avatar: '/avatars/user2.jpg', email: 'b@example.com' },
    { id: '3', name: 'Lê Văn C', role: 'Designer', avatar: '/avatars/user3.jpg', email: 'c@example.com' },
    { id: '4', name: 'Phạm Thị D', role: 'Tester', avatar: '/avatars/user4.jpg', email: 'd@example.com' }
  ];

  const documents = [
    {
      id: '1',
      name: 'Project Requirements.pdf',
      type: 'pdf',
      size: '2.5 MB',
      uploadedBy: 'Nguyễn Văn A',
      uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      url: '/documents/requirements.pdf'
    },
    {
      id: '2',
      name: 'UI Design Mockups.fig',
      type: 'fig',
      size: '15.2 MB',
      uploadedBy: 'Trần Thị B',
      uploadedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      url: '/documents/mockups.fig'
    },
    {
      id: '3',
      name: 'API Documentation.docx',
      type: 'docx',
      size: '1.8 MB',
      uploadedBy: 'Lê Văn C',
      uploadedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      url: '/documents/api-docs.docx'
    }
  ];

  // Set default selected project to "Tất cả dự án" only once
  if (!isInitialized) {
    setSelectedProject(null); // null = "Tất cả dự án"
    setIsInitialized(true);
  }

  const handleProjectChange = (project: Project | null) => {
    setSelectedProject(project);
  };

  const handleJoinMeeting = (meetingId: string) => {
    console.log('Join meeting:', meetingId);
    // Navigate to meeting room
  };

  const handleViewSummary = (meetingId: string) => {
    console.log('View meeting summary:', meetingId);
    // Navigate to meeting summary
  };

  const handleCreateMeeting = () => {
    console.log('Create new meeting');
    // Open create meeting modal
  };

  const handleCreateMilestone = () => {
    console.log('Create new milestone');
    // Open create milestone modal
  };

  const handleCreateTask = () => {
    console.log('Create new task');
    // Open create task modal
  };

  return (
    <div className="pm-dashboard">
      {/* Project Overview - Full Width */}
      <div className="dashboard-section project-overview-section">
        <ProjectOverview
          projects={projects}
          selectedProject={selectedProject}
          onProjectChange={handleProjectChange}
        />
      </div>

      {/* Middle Section - 2 Columns */}
      <div className="dashboard-section middle-section">
        <div className="dashboard-column left-column">
          <UpcomingMeetings
            meetings={meetings}
            selectedProject={selectedProject}
            projects={projects}
            onJoinMeeting={handleJoinMeeting}
            onViewSummary={handleViewSummary}
            onCreateMeeting={handleCreateMeeting}
          />
          
          <RecentMeetings
            meetings={meetings}
            selectedProject={selectedProject}
            projects={projects}
            onViewSummary={handleViewSummary}
          />
        </div>

        <div className="dashboard-column right-column">
          <Milestones
            milestones={milestones}
            selectedProject={selectedProject}
            onCreateMilestone={handleCreateMilestone}
          />
          
          <TaskStatusBoard
            tasks={tasks}
            selectedProject={selectedProject}
            onCreateTask={handleCreateTask}
          />
        </div>
      </div>

      {/* Bottom Section - 2 Columns */}
      <div className="dashboard-section bottom-section">
        <div className="dashboard-column left-column">
          <Documents documents={documents} selectedProject={selectedProject} />
        </div>

        <div className="dashboard-column right-column">
          <TeamActivity members={members} tasks={tasks} selectedProject={selectedProject} />
        </div>
      </div>
    </div>
  );
}