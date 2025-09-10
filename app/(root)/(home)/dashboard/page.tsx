'use client';

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
import '@/app/styles/dashboard.scss';

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

export default function DashboardPage() {
  // Chart data
  const lineChartData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: 'Số dự án',
        data: [4, 3, 5, 6, 5, 6, 7, 6, 5, 4, 6, 7],
        borderColor: '#FF5E13',
        backgroundColor: 'rgba(255, 94, 19, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: ['IT', 'Marketing', 'Sales', 'HR', 'Finance'],
    datasets: [
      {
        label: 'Số nhân viên',
        data: [12, 8, 10, 5, 10],
        backgroundColor: '#FFA463',
      },
    ],
  };

  const pieChartData = {
    labels: ['Đã hoàn thành', 'Đang diễn ra', 'Sắp tới'],
    datasets: [
      {
        data: [5, 6, 3],
        backgroundColor: ['#10B981', '#FFA463', '#FF5E13'],
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Cần làm', 'Đang làm', 'Đã xong', 'Tạm hoãn'],
    datasets: [
      {
        data: [15, 20, 10, 5],
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
    <div className="pm-dashboard">
      {/* Overview Cards */}
      <div className="dashboard-overview">
        <div className="overview-card">
          <div className="overview-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 9H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="overview-content">
            <h3>Dự Án</h3>
            <p className="overview-number">6</p>
            <p className="overview-label">Đang thực hiện</p>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="overview-content">
            <h3>Nhân Viên</h3>
            <p className="overview-number">45</p>
            <p className="overview-label">Đang tham gia</p>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 10H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="overview-content">
            <h3>Cuộc Họp</h3>
            <p className="overview-number">14</p>
            <p className="overview-label">Trong tháng này</p>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="overview-content">
            <h3>Tasks</h3>
            <p className="overview-number">50</p>
            <p className="overview-label">Cần triển khai</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-content">
        <div className="charts">
          <div className="chart">
            <h2>Dự Án Theo Tháng</h2>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>

          <div className="chart">
            <h2>Nhân Viên Theo Phòng Ban</h2>
            <Bar data={barChartData} options={barChartOptions} />
          </div>

          <div className="chart">
            <h2>Tình Trạng Cuộc Họp</h2>
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>

          <div className="chart">
            <h2>Các Task Cần Triển Khai</h2>
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}