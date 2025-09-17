'use client';

import { Project } from '@/types/project';
import { PMDashboardHeader } from '@/components/dashboard/PMDashboardHeader';
import { PMProjectsOverview } from '@/components/dashboard/PMProjectsOverview';
import '@/app/styles/dashboard.scss';

export default function DashboardPage() {

  // Mock data - trong thực tế sẽ lấy từ API
  const projects: Project[] = [
    {
      id: '1',
      name: 'Project Management System',
      description: 'A system to manage company projects and resources',
      status: 'active' as const,
      startDate: '2025-09-01',
      endDate: '2025-12-31',
      manager: 'John Doe',
      members: [
        { id: '1', name: 'John Doe', role: 'Project Manager', email: 'john.doe@example.com', avatar: '/avatars/john.png' },
        { id: '2', name: 'Jane Smith', role: 'Developer', email: 'jane.smith@example.com', avatar: '/avatars/jane.png' }
      ],
      progress: 75
    },
    {
      id: '2',
      name: 'Marketing Campaign',
      description: 'Q4 Digital Marketing Campaign',
      status: 'planning' as const,
      startDate: '2025-10-01',
      endDate: '2025-12-15',
      manager: 'Jane Smith',
      members: [
        { id: '3', name: 'Mike Johnson', role: 'Marketing Lead', email: 'mike.johnson@example.com', avatar: '/avatars/mike.png' },
        { id: '4', name: 'Sarah Wilson', role: 'Content Creator', email: 'sarah.wilson@example.com', avatar: '/avatars/sarah.png' }
      ],
      progress: 25
    },
    {
      id: '3',
      name: 'Mobile App Development',
      description: 'Customer service mobile application',
      status: 'completed' as const,
      startDate: '2025-06-01',
      endDate: '2025-09-30',
      manager: 'Tom Brown',
      members: [
        { id: '5', name: 'Tom Brown', role: 'Tech Lead', email: 'tom.brown@example.com', avatar: '/avatars/tom.png' },
        { id: '6', name: 'Emma Davis', role: 'Developer', email: 'emma.davis@example.com', avatar: '/avatars/emma.png' }
      ],
      progress: 100
    },
    {
      id: '4',
      name: 'E-commerce Platform',
      description: 'Online shopping platform with payment integration',
      status: 'active' as const,
      startDate: '2025-08-01',
      endDate: '2026-02-28',
      manager: 'Alice Johnson',
      members: [
        { id: '7', name: 'Alice Johnson', role: 'Product Manager', email: 'alice.johnson@example.com', avatar: '/avatars/alice.png' },
        { id: '8', name: 'Bob Wilson', role: 'Full Stack Developer', email: 'bob.wilson@example.com', avatar: '/avatars/bob.png' },
        { id: '9', name: 'Carol Davis', role: 'UI/UX Designer', email: 'carol.davis@example.com', avatar: '/avatars/carol.png' }
      ],
      progress: 45
    },
    {
      id: '5',
      name: 'Data Analytics Dashboard',
      description: 'Business intelligence and reporting dashboard',
      status: 'planning' as const,
      startDate: '2025-11-01',
      endDate: '2026-01-31',
      manager: 'David Lee',
      members: [
        { id: '10', name: 'David Lee', role: 'Data Analyst', email: 'david.lee@example.com', avatar: '/avatars/david.png' },
        { id: '11', name: 'Lisa Chen', role: 'UI/UX Designer', email: 'lisa.chen@example.com', avatar: '/avatars/lisa.png' }
      ],
      progress: 15
    },
    {
      id: '6',
      name: 'Customer Support System',
      description: 'AI-powered customer support and ticketing system',
      status: 'on-hold' as const,
      startDate: '2025-07-01',
      endDate: '2025-12-31',
      manager: 'Maria Garcia',
      members: [
        { id: '12', name: 'Maria Garcia', role: 'AI Engineer', email: 'maria.garcia@example.com', avatar: '/avatars/maria.png' },
        { id: '13', name: 'James Taylor', role: 'Backend Developer', email: 'james.taylor@example.com', avatar: '/avatars/james.png' },
        { id: '14', name: 'Anna Wilson', role: 'Frontend Developer', email: 'anna.wilson@example.com', avatar: '/avatars/anna.png' }
      ],
      progress: 30
    },
    {
      id: '7',
      name: 'HR Management System',
      description: 'Human resources management and employee tracking',
      status: 'active' as const,
      startDate: '2025-09-15',
      endDate: '2026-03-15',
      manager: 'Robert Kim',
      members: [
        { id: '15', name: 'Robert Kim', role: 'HR Manager', email: 'robert.kim@example.com', avatar: '/avatars/robert.png' },
        { id: '16', name: 'Sophie Brown', role: 'Full Stack Developer', email: 'sophie.brown@example.com', avatar: '/avatars/sophie.png' }
      ],
      progress: 60
    },
    {
      id: '8',
      name: 'Inventory Management',
      description: 'Stock tracking and warehouse management system',
      status: 'planning' as const,
      startDate: '2025-12-01',
      endDate: '2026-04-30',
      manager: 'Kevin Park',
      members: [
        { id: '17', name: 'Kevin Park', role: 'Operations Manager', email: 'kevin.park@example.com', avatar: '/avatars/kevin.png' },
        { id: '18', name: 'Rachel Green', role: 'Backend Developer', email: 'rachel.green@example.com', avatar: '/avatars/rachel.png' },
        { id: '19', name: 'Michael Scott', role: 'Database Admin', email: 'michael.scott@example.com', avatar: '/avatars/michael.png' }
      ],
      progress: 5
    }
  ];


  // Calculate statistics
  const averageProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;

  return (
    <div className="pm-dashboard">
      {/* PM Dashboard Header */}
      <PMDashboardHeader
        projects={projects}
        averageProgress={averageProgress}
      />

      {/* PM Projects Overview */}
      <PMProjectsOverview projects={projects} />
    </div>
  );
}