'use client';

import { useState, useEffect, useRef } from 'react';
import { Project } from '@/types/project';
import { mockTasks } from '@/constants/mockData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import TimeFilter, { TimeFilterOption } from './TimeFilter';
import CustomBarChart from './CustomBarChart';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ProjectOverviewProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectChange: (project: Project | null) => void;
}

export default function ProjectOverview({ 
  projects, 
  selectedProject, 
  onProjectChange 
}: ProjectOverviewProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [projectTimeFilter, setProjectTimeFilter] = useState<TimeFilterOption>('thisYear');
  const [taskTimeFilter, setTaskTimeFilter] = useState<TimeFilterOption>('lastMonth');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate real stats based on tasks
  const calculateStats = () => {
    if (selectedProject) {
      // Stats cho project cụ thể
      const projectTaskMapping: { [key: string]: string[] } = {
        '1': ['MWA-1', 'MWA-2', 'MWA-3', 'MWA-4', 'MWA-5'],
        '2': ['MKT-1', 'MKT-2', 'MKT-3'],
        '3': ['MOB-1', 'MOB-2', 'MOB-3', 'MOB-4'],
        '4': ['E-1', 'E-2', 'E-3'],
        '5': ['DA-1', 'DA-2'],
        '6': ['CS-1', 'CS-2', 'CS-3']
      };

      const taskIds = projectTaskMapping[selectedProject.id] || [];
      const allTasks = [...mockTasks];
      const tasks = allTasks.filter(task => taskIds.includes(task.id));
      
      return {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(task => task.status === 'done' || task.status === 'completed').length,
        totalMilestones: 5,
        completedMilestones: 3,
        completedMeetings: 8,
        upcomingMeetings: 3
      };
    } else {
      // Stats tổng hợp cho tất cả projects
      const allTasks = [...mockTasks];
      return {
        totalTasks: allTasks.length,
        completedTasks: allTasks.filter(task => task.status === 'done' || task.status === 'completed').length,
        totalMilestones: 12,
        completedMilestones: 8,
        completedMeetings: 23,
        upcomingMeetings: 7
      };
    }
  };

  const stats = calculateStats();
  const progressPercentage = Math.round((stats.completedTasks / stats.totalTasks) * 100);

  // Generate project chart data based on time filter (yearly/monthly view)
  const generateProjectChartData = (filter: TimeFilterOption) => {
    const now = new Date();
    let labels: string[] = [];
    let lineData: number[] = [];
    let barData: number[] = [];
    let pieData: number[] = [];
    let doughnutData: number[] = [];

    switch (filter) {
      case 'lastMonth':
        // Tháng trước - hiển thị theo tuần
        labels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
        lineData = [2, 3, 4, 5];
        barData = [18, 15, 12, 8, 6];
        pieData = [8, 6, 4];
        doughnutData = [25, 30, 45, 5];
        break;
        
      case 'thisMonth':
        // Tháng này - hiển thị theo tuần
        labels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
        lineData = [3, 4, 5, 6];
        barData = [20, 18, 15, 12, 10];
        pieData = [10, 8, 6];
        doughnutData = [30, 35, 50, 8];
        break;
        
      case 'lastYear':
        // Năm trước - hiển thị theo tháng (12 tháng)
        labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        lineData = [8, 10, 12, 15, 18, 20, 22, 25, 28, 30, 32, 35];
        barData = [35, 30, 25, 20, 15];
        pieData = [20, 15, 10];
        doughnutData = [50, 60, 80, 12];
        break;
        
      case 'thisYear':
        // Năm nay - từ tháng 1 đến tháng hiện tại
        const currentMonth = now.getMonth() + 1; // 1-12
        labels = [];
        lineData = [];
        for (let i = 1; i <= currentMonth; i++) {
          labels.push(`T${i}`);
          lineData.push(i + 4);
        }
        barData = [25, 22, 20, 18, 15];
        pieData = [12, 10, 8];
        doughnutData = [40, 45, 60, 10];
        break;
        
      case 'all':
        // Tất cả - hiển thị theo tháng
        labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        lineData = [2, 3, 4, 5, 4, 6, 7, 6, 5, 4, 6, 8];
        barData = [18, 15, 12, 8, 6];
        pieData = [8, 6, 4];
        doughnutData = [25, 30, 45, 5];
        break;
    }

    return { labels, lineData, barData, pieData, doughnutData };
  };

  // Generate task chart data based on time filter (daily/weekly view)
  const generateTaskChartData = (filter: TimeFilterOption) => {
    const now = new Date();
    let labels: string[] = [];
    let lineData: number[] = [];
    let barData: number[] = [];
    let barTotalData: number[] = [];
    let pieData: number[] = [];
    let doughnutData: number[] = [];
    
    // Bar chart labels (always 5 projects)
    const barLabels = ['Meeting Support Platform', 'E-commerce Website', 'Mobile App', 'Data Analytics', 'AI Project'];

    switch (filter) {
      case '7d':
        // 7 ngày qua - hiển thị theo ngày
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        labels = [];
        
        for (let i = 6; i >= 0; i--) {
          const pastDate = new Date(now);
          pastDate.setDate(now.getDate() - i - 1);
          const dayIndex = pastDate.getDay();
          labels.push(dayNames[dayIndex]);
        }
        
        lineData = [1, 2, 1, 3, 2, 4, 3];
        barData = [45, 38, 32, 28, 22];
        barTotalData = [60, 53, 47, 43, 37];
        pieData = [3, 2, 1];
        doughnutData = [8, 12, 15, 2];
        break;
        
      case 'lastMonth':
        // Tháng trước - hiển thị theo ngày
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const daysInLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        labels = [];
        lineData = [];
        for (let i = 1; i <= daysInLastMonth; i++) {
          labels.push(`${i}`);
          lineData.push((i % 3) + 1);
        }
        barData = [52, 45, 38, 32, 28];
        barTotalData = [67, 60, 53, 47, 43];
        pieData = [8, 6, 4];
        doughnutData = [25, 30, 45, 5];
        break;
        
      case 'thisMonth':
        // Tháng này - hiển thị theo ngày
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        labels = [];
        lineData = [];
        for (let i = 1; i <= daysInMonth; i++) {
          labels.push(`${i}`);
          lineData.push((i % 4) + 1);
        }
        barData = [58, 52, 45, 38, 32];
        barTotalData = [73, 67, 60, 53, 47];
        pieData = [10, 8, 6];
        doughnutData = [30, 35, 50, 8];
        break;
        
      case 'lastYear':
        // Năm trước - hiển thị theo tháng
        labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        lineData = [8, 10, 12, 15, 18, 20, 22, 25, 28, 30, 32, 35];
        barData = [85, 75, 65, 55, 45];
        barTotalData = [100, 90, 80, 70, 60];
        pieData = [20, 15, 10];
        doughnutData = [50, 60, 80, 12];
        break;
        
      case 'thisYear':
        // Năm nay - hiển thị theo tháng
        const currentMonth = now.getMonth() + 1;
        labels = [];
        lineData = [];
        for (let i = 1; i <= currentMonth; i++) {
          labels.push(`T${i}`);
          lineData.push(i + 4);
        }
        barData = [65, 58, 52, 45, 38];
        barTotalData = [80, 73, 67, 60, 53];
        pieData = [12, 10, 8];
        doughnutData = [40, 45, 60, 10];
        break;
        
      case 'all':
        // Tất cả - hiển thị theo tháng
        labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        lineData = [2, 3, 4, 5, 4, 6, 7, 6, 5, 4, 6, 8];
        barData = [52, 45, 38, 32, 28];
        barTotalData = [67, 60, 53, 47, 43];
        pieData = [8, 6, 4];
        doughnutData = [25, 30, 45, 5];
        break;
    }

    return { labels, lineData, barData, barTotalData, pieData, doughnutData, barLabels };
  };

  const projectChartData = generateProjectChartData(projectTimeFilter);
  const taskChartData = generateTaskChartData(taskTimeFilter);

  // Chart data for "Tất cả dự án" - dynamic based on project time filter
  const totalProjectsData = projectChartData.lineData.map(val => val + 3);
  const completedProjectsData = projectChartData.lineData;
  const pendingProjectsData = totalProjectsData.map((total, index) => total - completedProjectsData[index]);

  const lineChartData = {
    labels: projectChartData.labels,
    datasets: [
      {
        label: 'Tổng số dự án',
        data: totalProjectsData,
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Dự án hoàn thành',
        data: completedProjectsData,
        borderColor: '#FF5E13',
        backgroundColor: 'rgba(255, 94, 19, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Dự án chưa hoàn thành',
        data: pendingProjectsData,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: ['Meeting Support Platform', 'E-commerce Website', 'Mobile App', 'Data Analytics', 'AI Project'],
    datasets: [
      {
        label: 'Số task hoàn thành',
        data: taskChartData.barData,
        backgroundColor: '#FFA463',
      },
    ],
  };

  const pieChartData = {
    labels: ['Hoàn thành', 'Đang thực hiện', 'Sắp tới'],
    datasets: [
      {
        data: taskChartData.pieData,
        backgroundColor: ['#10B981', '#FFA463', '#FF5E13'],
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Cần làm', 'Đang làm', 'Đã xong', 'Tạm hoãn'],
    datasets: [
      {
        data: taskChartData.doughnutData,
        backgroundColor: ['#FF5E13', '#FFA463', '#10B981', '#64748B'],
      },
    ],
  };

  // Chart options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          boxWidth: 12,
          font: {
            size: 12
          }
        }
      }
    },
  };

  const lineChartOptions = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const barChartOptions = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieChartOptions = {
    ...commonOptions,
  };

  const doughnutChartOptions = {
    ...commonOptions,
  };

  return (
    <div className="project-overview">
      <div className="overview-header">
        <div className="project-selector">
          <label>Dự án hiện tại:</label>
          <div className="dropdown-container" ref={dropdownRef}>
            <button 
              className="dropdown-trigger"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{selectedProject?.name || 'Tất cả dự án'}</span>
              <svg 
                className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`}
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <button
                  className={`dropdown-item ${!selectedProject ? 'active' : ''}`}
                  onClick={() => {
                    onProjectChange(null);
                    setIsDropdownOpen(false);
                  }}
                >
                  Tất cả dự án
                </button>
                {projects.map((project) => (
                  <button
                    key={project.id}
                    className={`dropdown-item ${selectedProject?.id === project.id ? 'active' : ''}`}
                    onClick={() => {
                      onProjectChange(project);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    <div className="overview-content">
      {selectedProject ? (
        // Single project view - show progress bar
        <div className="progress-section">
          <div className="progress-header">
            <h3>Tiến độ dự án</h3>
            <span className="progress-percentage">{progressPercentage}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-stats">
            <span>{stats.completedTasks}/{stats.totalTasks} tasks hoàn thành</span>
          </div>
        </div>
      ) : (
        // All projects view - show charts
        <div className="charts-section">
          <div className="charts-header">
            <h3>Thống kê tổng quan</h3>
          </div>
          <div className="charts-grid">
              <div className="chart-item">
                <div className="chart-header">
                  <h3>Thống kê dự án theo thời gian</h3>
                  <TimeFilter 
                    selectedFilter={projectTimeFilter}
                    onFilterChange={setProjectTimeFilter}
                  />
                </div>
                <div className="chart-container">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </div>
            <div className="chart-item">
              <div className="chart-header">
                <h3>Tiến độ công việc theo dự án</h3>
                <TimeFilter 
                  selectedFilter={taskTimeFilter}
                  onFilterChange={setTaskTimeFilter}
                />
              </div>
              <CustomBarChart
                title=""
                data={{
                  labels: taskChartData.barLabels,
                  completedData: taskChartData.barData,
                  totalData: taskChartData.barTotalData
                }}
                height={200}
              />
            </div>
          </div>
        </div>
      )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon tasks">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalTasks}</div>
              <div className="stat-label">Tasks</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon milestones">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalMilestones}</div>
              <div className="stat-label">Milestones</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon meetings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.completedMeetings}</div>
              <div className="stat-label">Meetings hoàn thành</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon upcoming">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.upcomingMeetings}</div>
              <div className="stat-label">Meetings sắp tới</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
