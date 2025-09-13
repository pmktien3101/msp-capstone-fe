'use client';

import React, { useState } from 'react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Doanh Thu');
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [hoveredProgress, setHoveredProgress] = useState<string | null>(null);
  const [hoveredDevice, setHoveredDevice] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedYears, setSelectedYears] = useState<string[]>(['2024', '2023']); // Mặc định chọn 2024 và 2023

  // Data for different tabs - Flexible years structure
  const chartData = {
    'Doanh Thu': {
      years: {
        '2024': {
          values: [130, 90, 170, 150, 110, 190, 160, 0, 0, 0, 0, 0],
          displayValues: ['$130K', '$90K', '$170K', '$150K', '$110K', '$190K', '$160K', '$0', '$0', '$0', '$0', '$0'],
          color: '#BAEDBD',
          label: 'Năm 2024'
        },
        '2023': {
          values: [110, 70, 140, 120, 90, 160, 130, 145, 95, 175, 155, 125],
          displayValues: ['$110K', '$70K', '$140K', '$120K', '$90K', '$160K', '$130K', '$145K', '$95K', '$175K', '$155K', '$125K'],
          color: '#B1E3FF',
          label: 'Năm 2023'
        },
        '2022': {
          values: [100, 80, 120, 110, 85, 140, 120, 130, 90, 160, 140, 110],
          displayValues: ['$100K', '$80K', '$120K', '$110K', '$85K', '$140K', '$120K', '$130K', '$90K', '$160K', '$140K', '$110K'],
          color: '#FFE4B5',
          label: 'Năm 2022'
        }
      },
      yLabels: ['$200K', '$150K', '$100K', '$50K', '$0'],
      maxValue: 200
    },
    'Gói Đăng Ký': {
      years: {
        '2024': {
          values: [1400, 1200, 1600, 1300, 1500, 1700, 1800, 0, 0, 0, 0, 0],
          displayValues: ['1,400', '1,200', '1,600', '1,300', '1,500', '1,700', '1,800', '0', '0', '0', '0', '0'],
          color: '#BAEDBD',
          label: 'Năm 2024'
        },
        '2023': {
          values: [1200, 1000, 1400, 1100, 1300, 1500, 1600, 1350, 1150, 1550, 1450, 1250],
          displayValues: ['1,200', '1,000', '1,400', '1,100', '1,300', '1,500', '1,600', '1,350', '1,150', '1,550', '1,450', '1,250'],
          color: '#B1E3FF',
          label: 'Năm 2023'
        },
        '2022': {
          values: [1000, 800, 1200, 1100, 900, 1300, 1200, 1150, 950, 1400, 1300, 1100],
          displayValues: ['1,000', '800', '1,200', '1,100', '900', '1,300', '1,200', '1,150', '950', '1,400', '1,300', '1,100'],
          color: '#FFE4B5',
          label: 'Năm 2022'
        }
      },
      yLabels: ['2,000', '1,500', '1,000', '500', '0'],
      maxValue: 2000
    },
    'Công Ty Mới': {
      years: {
        '2024': {
          values: [125, 87, 150, 112, 100, 175, 137, 0, 0, 0, 0, 0],
          displayValues: ['125', '87', '150', '112', '100', '175', '137', '0', '0', '0', '0', '0'],
          color: '#BAEDBD',
          label: 'Năm 2024'
        },
        '2023': {
          values: [100, 62, 125, 87, 75, 150, 112, 95, 67, 135, 97, 85],
          displayValues: ['100', '62', '125', '87', '75', '150', '112', '95', '67', '135', '97', '85'],
          color: '#B1E3FF',
          label: 'Năm 2023'
        },
        '2022': {
          values: [80, 50, 100, 70, 60, 120, 90, 75, 55, 110, 80, 70],
          displayValues: ['80', '50', '100', '70', '60', '120', '90', '75', '55', '110', '80', '70'],
          color: '#FFE4B5',
          label: 'Năm 2022'
        }
      },
      yLabels: ['200', '150', '100', '50', '0'],
      maxValue: 200
    }
  };

  const currentData = chartData[activeTab as keyof typeof chartData];
  
  // Function to toggle year selection
  const toggleYear = (year: string) => {
    setSelectedYears(prev => {
      if (prev.includes(year)) {
        // Nếu đã chọn thì bỏ chọn, nhưng phải giữ ít nhất 1 năm
        if (prev.length > 1) {
          return prev.filter(y => y !== year);
        }
        return prev;
      } else {
        // Nếu chưa chọn thì thêm vào
        return [...prev, year];
      }
    });
  };
  
  // Filter years data based on selection
  const filteredYears = Object.fromEntries(
    Object.entries(currentData.years).filter(([year]) => selectedYears.includes(year))
  );
  return (
    <div className="admin-dashboard">
      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card blue interactive" 
             onMouseEnter={() => setHoveredBar('revenue')}
             onMouseLeave={() => setHoveredBar(null)}>
          <div className="stat-header">
            <div className="stat-label">Doanh Thu Tháng</div>
          </div>
          <div className="stat-content">
            <div className="stat-value">$125,430</div>
            <div className="stat-change">
              <span className="change-text positive">+12.5%</span>
              <div className="change-icon up">↗</div>
            </div>
          </div>
          {hoveredBar === 'revenue' && (
            <div className="tooltip">
              <div className="tooltip-content">
                <strong>Doanh thu tháng này</strong><br/>
                Tăng 12.5% so với tháng trước<br/>
                <small>Chi tiết: $125,430</small>
              </div>
            </div>
          )}
        </div>

        <div className="stat-card purple interactive"
             onMouseEnter={() => setHoveredBar('subscriptions')}
             onMouseLeave={() => setHoveredBar(null)}>
          <div className="stat-header">
            <div className="stat-label">Gói Đăng Ký</div>
          </div>
          <div className="stat-content">
            <div className="stat-value">3,456</div>
            <div className="stat-change">
              <span className="change-text positive">+8.2%</span>
              <div className="change-icon up">↗</div>
            </div>
          </div>
          {hoveredBar === 'subscriptions' && (
            <div className="tooltip">
              <div className="tooltip-content">
                <strong>Tổng gói đăng ký</strong><br/>
                Tăng 8.2% so với tháng trước<br/>
                <small>Chi tiết: 3,456 gói</small>
              </div>
            </div>
          )}
        </div>

        <div className="stat-card blue interactive"
             onMouseEnter={() => setHoveredBar('companies')}
             onMouseLeave={() => setHoveredBar(null)}>
          <div className="stat-header">
            <div className="stat-label">Tổng Công Ty</div>
          </div>
          <div className="stat-content">
            <div className="stat-value">1,247</div>
            <div className="stat-change">
              <span className="change-text positive">+15.3%</span>
              <div className="change-icon up">↗</div>
            </div>
          </div>
          {hoveredBar === 'companies' && (
            <div className="tooltip">
              <div className="tooltip-content">
                <strong>Tổng số công ty</strong><br/>
                Tăng 15.3% so với tháng trước<br/>
                <small>Chi tiết: 1,247 công ty</small>
              </div>
            </div>
          )}
        </div>

        <div className="stat-card purple interactive"
             onMouseEnter={() => setHoveredBar('meetings')}
             onMouseLeave={() => setHoveredBar(null)}>
          <div className="stat-header">
            <div className="stat-label">Cuộc Họp Tháng</div>
          </div>
          <div className="stat-content">
            <div className="stat-value">8,932</div>
            <div className="stat-change">
              <span className="change-text positive">+6.8%</span>
              <div className="change-icon up">↗</div>
            </div>
          </div>
          {hoveredBar === 'meetings' && (
            <div className="tooltip">
              <div className="tooltip-content">
                <strong>Cuộc họp tháng này</strong><br/>
                Tăng 6.8% so với tháng trước<br/>
                <small>Chi tiết: 8,932 cuộc họp</small>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        {/* Main Chart Section */}
        <div className="main-chart-container">
          <div className="chart-header">
            <div className="chart-tabs">
              <div className={`tab ${activeTab === 'Doanh Thu' ? 'active' : ''}`}
                   onClick={() => setActiveTab('Doanh Thu')}>Doanh Thu</div>
              <div className={`tab ${activeTab === 'Gói Đăng Ký' ? 'active' : ''}`}
                   onClick={() => setActiveTab('Gói Đăng Ký')}>Gói Đăng Ký</div>
              <div className={`tab ${activeTab === 'Công Ty Mới' ? 'active' : ''}`}
                   onClick={() => setActiveTab('Công Ty Mới')}>Công Ty Mới</div>
            </div>
            <div className="chart-legend">
              {Object.entries(currentData.years).map(([year, data]) => (
                <div key={year} className="legend-item">
                  <input 
                    type="checkbox" 
                    checked={selectedYears.includes(year)}
                    onChange={() => toggleYear(year)}
                    className="year-checkbox"
                  />
                  <div className="legend-dot" style={{backgroundColor: data.color}}></div>
                  <span>{data.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-content">
            <div className="chart-y-axis">
              {currentData.yLabels.map((label, index) => (
                <div key={index} className="y-label">{label}</div>
              ))}
            </div>
            <div className="chart-area">
              <div className="chart-grid">
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line bold"></div>
              </div>
              <div className="chart-bars">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
                  return (
                    <div key={month} className="bar-group">
                      {Object.entries(filteredYears).map(([year, data]) => {
                        const value = data.values[index];
                        const height = (value / currentData.maxValue) * 100;
                        
                        return (
                          <div key={year} 
                               className={`bar ${hoveredBar === `${month}-${year}` ? 'hovered' : ''}`}
                               style={{
                                 height: `${height}%`,
                                 backgroundColor: data.color
                               }}
                               onMouseEnter={() => setHoveredBar(`${month}-${year}`)}
                               onMouseLeave={() => setHoveredBar(null)}>
                            {hoveredBar === `${month}-${year}` && (
                              <div className="bar-tooltip">
                                <div className="tooltip-content">
                                  <strong>{month} {year}</strong><br/>
                                  {activeTab}: {data.displayValues[index]}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <div className="chart-x-axis">
                <div className="x-label">Jan</div>
                <div className="x-label">Feb</div>
                <div className="x-label">Mar</div>
                <div className="x-label">Apr</div>
                <div className="x-label">May</div>
                <div className="x-label">Jun</div>
                <div className="x-label">Jul</div>
                <div className="x-label">Aug</div>
                <div className="x-label">Sep</div>
                <div className="x-label">Oct</div>
                <div className="x-label">Nov</div>
                <div className="x-label">Dec</div>
              </div>
            </div>
          </div>
        </div>

        {/* Phân Bố Gói Đăng Ký */}
        <div className="traffic-website">
          <div className="section-header">
          <h3>Phân Bố Gói Đăng Ký</h3>
          </div>
          <div className="traffic-list">
            {[
              {name: 'Premium', width: '100%', count: '1,200', revenue: '$48,000', color: 'premium'},
              {name: 'Professional', width: '75%', count: '900', revenue: '$27,000', color: 'professional'},
              {name: 'Business', width: '85%', count: '1,020', revenue: '$30,600', color: 'business'},
              {name: 'Enterprise', width: '45%', count: '540', revenue: '$21,600', color: 'enterprise'},
              {name: 'Basic', width: '60%', count: '720', revenue: '$14,400', color: 'basic'},
              {name: 'Starter', width: '30%', count: '360', revenue: '$7,200', color: 'starter'},
              {name: 'Free', width: '20%', count: '240', revenue: '$0', color: 'free'}
            ].map((plan) => (
              <div key={plan.name} className="traffic-item">
                <span className="website-name">{plan.name}</span>
                <div className="progress-bar"
                     onMouseEnter={(e) => {
                       setHoveredProgress(plan.name);
                       setMousePosition({ x: e.clientX, y: e.clientY });
                     }}
                     onMouseMove={(e) => {
                       setMousePosition({ x: e.clientX, y: e.clientY });
                     }}
                     onMouseLeave={() => setHoveredProgress(null)}>
                  <div className={`progress-fill ${plan.color} ${hoveredProgress === plan.name ? 'hovered' : ''}`}
                       style={{width: plan.width}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Tooltip for Progress Bars */}
      {hoveredProgress && (
        <div className="floating-tooltip"
             style={{
               position: 'fixed',
               left: mousePosition.x + 10,
               top: mousePosition.y - 10,
               zIndex: 1000,
               pointerEvents: 'none'
             }}>
          <div className="tooltip-content">
            {(() => {
              const plan = [
                {name: 'Premium', count: '1,200', revenue: '$48,000'},
                {name: 'Professional', count: '900', revenue: '$27,000'},
                {name: 'Business', count: '1,020', revenue: '$30,600'},
                {name: 'Enterprise', count: '540', revenue: '$21,600'},
                {name: 'Basic', count: '720', revenue: '$14,400'},
                {name: 'Starter', count: '360', revenue: '$7,200'},
                {name: 'Free', count: '240', revenue: '$0'}
              ].find(p => p.name === hoveredProgress);
              return (
                <>
                  <strong>{plan?.name}</strong><br/>
                  Số lượng: {plan?.count}<br/>
                  Doanh thu: {plan?.revenue}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Charts Row 2 */}
      <div className="charts-row">
        {/* Thống Kê Công Ty Theo Ngành */}
        <div className="traffic-device">
          <div className="section-header">
            <h3>Thống Kê Công Ty Theo Ngành</h3>
          </div>
          <div className="device-chart">
            <div className="device-y-axis">
              <div className="y-label">500</div>
              <div className="y-label">400</div>
              <div className="y-label">300</div>
              <div className="y-label">200</div>
              <div className="y-label">100</div>
              <div className="y-label">0</div>
            </div>
            <div className="device-bars">
              {[
                {name: 'IT', height: '80%', color: 'indigo', count: '400'},
                {name: 'Finance', height: '60%', color: 'mint', count: '300'},
                {name: 'Healthcare', height: '70%', color: 'black', count: '350'},
                {name: 'Education', height: '40%', color: 'blue', count: '200'},
                {name: 'Retail', height: '90%', color: 'cyan', count: '450'},
                {name: 'Other', height: '50%', color: 'green', count: '250'}
              ].map((industry) => (
                <div key={industry.name}
                     className={`device-bar ${industry.color} ${hoveredDevice === industry.name ? 'hovered' : ''}`}
                     style={{height: industry.height}}
                     onMouseEnter={() => setHoveredDevice(industry.name)}
                     onMouseLeave={() => setHoveredDevice(null)}>
                  {hoveredDevice === industry.name && (
                    <div className="device-tooltip">
                      <div className="tooltip-content">
                        <strong>{industry.name}</strong><br/>
                        Số công ty: {industry.count}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="device-x-axis">
              <div className="x-label">IT</div>
              <div className="x-label">Finance</div>
              <div className="x-label">Healthcare</div>
              <div className="x-label">Education</div>
              <div className="x-label">Retail</div>
              <div className="x-label">Other</div>
            </div>
          </div>
        </div>

        {/* Thống Kê Cuộc Họp Theo Thời Gian */}
        <div className="traffic-location">
          <div className="section-header">
            <h3>Cuộc Họp Theo Thời Gian</h3>
          </div>
          <div className="location-content">
            <div className="pie-chart">
              <div className="pie-slice black" style={{transform: 'rotate(0deg)', clipPath: 'polygon(50% 50%, 50% 0%, 78% 16%, 50% 50%)'}}></div>
              <div className="pie-slice indigo" style={{transform: 'rotate(90deg)', clipPath: 'polygon(50% 50%, 78% 16%, 100% 30%, 50% 50%)'}}></div>
              <div className="pie-slice blue" style={{transform: 'rotate(180deg)', clipPath: 'polygon(50% 50%, 100% 30%, 100% 100%, 50% 50%)'}}></div>
              <div className="pie-slice mint" style={{transform: 'rotate(270deg)', clipPath: 'polygon(50% 50%, 100% 100%, 0% 100%, 50% 50%)'}}></div>
            </div>
            <div className="location-legend">
              <div className="legend-item">
                <div className="legend-dot black"></div>
                <span>9:00-12:00</span>
                <span className="percentage">35.2%</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot mint"></div>
                <span>13:00-17:00</span>
                <span className="percentage">28.8%</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot indigo"></div>
                <span>18:00-20:00</span>
                <span className="percentage">22.4%</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot blue"></div>
                <span>Khác</span>
                <span className="percentage">13.6%</span>
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thống Kê Dự Án Theo Tháng */}
      <div className="marketing-seo">
        <div className="section-header">
          <h3>Thống Kê Dự Án Theo Tháng</h3>
        </div>
        <div className="marketing-chart">
          <div className="marketing-y-axis">
            <div className="y-label">500</div>
            <div className="y-label">400</div>
            <div className="y-label">300</div>
            <div className="y-label">200</div>
            <div className="y-label">100</div>
            <div className="y-label">0</div>
          </div>
          <div className="marketing-bars">
            <div className="marketing-bar indigo" style={{height: '65%'}}></div>
            <div className="marketing-bar mint" style={{height: '45%'}}></div>
            <div className="marketing-bar black" style={{height: '70%'}}></div>
            <div className="marketing-bar blue" style={{height: '35%'}}></div>
            <div className="marketing-bar cyan" style={{height: '80%'}}></div>
            <div className="marketing-bar green" style={{height: '55%'}}></div>
            <div className="marketing-bar indigo" style={{height: '60%'}}></div>
            <div className="marketing-bar mint" style={{height: '40%'}}></div>
            <div className="marketing-bar black" style={{height: '75%'}}></div>
            <div className="marketing-bar blue" style={{height: '50%'}}></div>
            <div className="marketing-bar cyan" style={{height: '85%'}}></div>
            <div className="marketing-bar green" style={{height: '65%'}}></div>
          </div>
          <div className="marketing-x-axis">
            <div className="x-label">Jan</div>
            <div className="x-label">Feb</div>
            <div className="x-label">Mar</div>
            <div className="x-label">Apr</div>
            <div className="x-label">May</div>
            <div className="x-label">Jun</div>
            <div className="x-label">Jul</div>
            <div className="x-label">Aug</div>
            <div className="x-label">Sep</div>
            <div className="x-label">Oct</div>
            <div className="x-label">Nov</div>
            <div className="x-label">Dec</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 28px;
          padding: 24px;
          background: #F7F9FB;
          min-height: 100vh;
        }

        /* Stats Container */
        .stats-container {
          display: flex;
          flex-wrap: wrap;
          gap: 28px;
          align-content: flex-start;
        }

        .stat-card {
          flex: 1 1 0;
          min-width: 200px;
          padding: 24px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-card.blue {
          background: #E3F5FF;
        }

        .stat-card.purple {
          background: #E5ECF6;
        }

        .stat-card.interactive {
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .stat-card.interactive:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .stat-header {
          align-self: stretch;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stat-label {
          color: #1C1C1C;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          line-height: 20px;
        }

        .stat-content {
          align-self: stretch;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-value {
          color: #1C1C1C;
          font-size: 24px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          line-height: 36px;
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .change-text {
          font-size: 12px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          line-height: 18px;
        }

        .change-text.positive {
          color: #1C1C1C;
        }

        .change-text.negative {
          color: #1C1C1C;
        }

        .change-icon {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        /* Charts Rows */
        .charts-row {
          display: flex;
          gap: 28px;
          align-items: flex-start;
        }

        /* Main Chart */
        .main-chart-container {
          flex: 1 1 0;
          height: 330px;
          min-width: 662px;
          padding: 24px;
          background: linear-gradient(135deg, #F7F9FB 0%, #E8F2FF 100%);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .chart-tabs {
          display: flex;
          gap: 16px;
        }

        .tab {
          padding: 4px 0;
          color: rgba(28, 28, 28, 0.40);
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          line-height: 20px;
          cursor: pointer;
        }

        .tab.active {
          color: #1C1C1C;
          font-weight: 600;
        }

        .tab {
          transition: all 0.3s ease;
        }

        .tab:hover {
          color: #1C1C1C;
          background: rgba(28, 28, 28, 0.05);
          border-radius: 4px;
          padding: 4px 8px;
        }

        .chart-legend {
          display: flex;
          gap: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 4px 2px 4px;
        }

        .legend-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .legend-dot.current {
          background: #BAEDBD;
        }

        .legend-dot.previous {
          background: #B1E3FF;
        }

        .legend-item span {
          color: #1C1C1C;
          font-size: 12px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          line-height: 18px;
        }

        .chart-content {
          flex: 1;
          display: flex;
          gap: 16px;
        }

        .chart-y-axis {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
        }

        .y-label {
          color: rgba(28, 28, 28, 0.40);
          font-size: 12px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          line-height: 18px;
          text-align: right;
        }

        .chart-area {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .chart-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 16px 0 28px 0;
        }

        .grid-line {
          height: 1px;
          background: rgba(28, 28, 28, 0.05);
        }

        .grid-line.bold {
          background: rgba(28, 28, 28, 0.20);
        }

        .chart-bars {
          position: absolute;
          top: 16px;
          left: 0;
          right: 0;
          bottom: 28px;
          display: flex;
          align-items: flex-end;
          gap: 4px;
          padding: 0 16px;
        }

        .bar-group {
          flex: 1;
          height: 100%;
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 2px;
        }

        .bar {
          width: 20px;
          background: #1C1C1C;
          border-radius: 4px 4px 0 0;
          min-height: 0;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
        }
        
        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
        }
        
        .year-checkbox {
          margin-right: 8px;
          cursor: pointer;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .bar.hovered {
          transform: scaleY(1.05);
        }

        .bar.current.hovered {
          background: #A8E5AB;
        }

        .bar.previous.hovered {
          background: #9DD9FF;
        }

        .chart-x-axis {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          padding: 0 16px;
        }

        .chart-x-axis .x-label {
          flex: 1;
          text-align: center;
          margin: 0 2px;
        }

        .x-label {
          color: rgba(28, 28, 28, 0.40);
          font-size: 12px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          line-height: 18px;
          text-align: center;
        }

        /* Traffic by Website */
        .traffic-website {
          flex: 1 1 0;
          height: 330px;
          max-width: 272px;
          min-width: 200px;
          padding: 24px;
          background: linear-gradient(135deg, #F7F9FB 0%, #E8F4F8 100%);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .section-header h3 {
          color: #1C1C1C;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          line-height: 20px;
          margin: 0;
        }

        .traffic-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .traffic-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .website-name {
          color: #1C1C1C;
          font-size: 12px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          line-height: 18px;
          min-width: 60px;
        }

        .progress-bar {
          flex: 1;
          height: 18px;
          background: rgba(28, 28, 28, 0.10);
          border-radius: 80px;
          overflow: hidden;
          padding: 6px;
        }

        .progress-fill {
          height: 100%;
          background: #1C1C1C;
          border-radius: 80px;
          transition: all 0.3s ease;
          position: relative;
        }

        .progress-fill.hovered {
          transform: scaleY(1.1);
        }

        /* Progress bar colors */
        .progress-fill.premium { background: #FF6B6B; }
        .progress-fill.professional { background: #4ECDC4; }
        .progress-fill.business { background: #45B7D1; }
        .progress-fill.enterprise { background: #96CEB4; }
        .progress-fill.basic { background: #FFEAA7; }
        .progress-fill.starter { background: #DDA0DD; }
        .progress-fill.free { background: #98D8C8; }

        .progress-fill.premium.hovered { background: #FF5252; }
        .progress-fill.professional.hovered { background: #26A69A; }
        .progress-fill.business.hovered { background: #2196F3; }
        .progress-fill.enterprise.hovered { background: #66BB6A; }
        .progress-fill.basic.hovered { background: #FFC107; }
        .progress-fill.starter.hovered { background: #BA68C8; }
        .progress-fill.free.hovered { background: #4DB6AC; }

        /* Floating Tooltip */
        .floating-tooltip {
          position: fixed;
          z-index: 1000;
          pointer-events: none;
        }

        .floating-tooltip .tooltip-content {
          background: rgba(28, 28, 28, 0.95);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.4;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Traffic by Device */
        .traffic-device {
          flex: 1 1 0;
          height: 280px;
          min-width: 400px;
          padding: 24px;
          background: linear-gradient(135deg, #F7F9FB 0%, #F0F8FF 100%);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .device-chart {
          flex: 1;
          display: flex;
          gap: 16px;
          position: relative;
        }

        .device-y-axis {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
        }

        .device-bars {
          flex: 1;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 16px 0 28px 0;
        }

        .device-bar {
          flex: 1;
          border-radius: 4px 4px 0 0;
          min-height: 4px;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
        }

        .device-bar.hovered {
          transform: scaleY(1.05);
          opacity: 0.8;
        }

        .device-bar.indigo { background: #95A4FC; }
        .device-bar.mint { background: #BAEDBD; }
        .device-bar.black { background: #1C1C1C; }
        .device-bar.blue { background: #B1E3FF; }
        .device-bar.cyan { background: #A8C5DA; }
        .device-bar.green { background: #A1E3CB; }

        .device-x-axis {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          padding: 0 16px;
        }

        /* Traffic by Location */
        .traffic-location {
          flex: 1 1 0;
          height: 280px;
          min-width: 400px;
          padding: 24px;
          background: linear-gradient(135deg, #F7F9FB 0%, #F5F0FF 100%);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .location-content {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 40px;
          padding: 0 20px;
        }

        .pie-chart {
          width: 120px;
          height: 120px;
          position: relative;
          border-radius: 50%;
          overflow: hidden;
        }

        .pie-slice {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }

        .pie-slice.black { background: #1C1C1C; }
        .pie-slice.indigo { background: #95A4FC; }
        .pie-slice.blue { background: #B1E3FF; }
        .pie-slice.mint { background: #BAEDBD; }

        .location-legend {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .location-legend .legend-item {
          display: flex;
          align-items: center;
          gap: 48px;
          padding: 2px 4px;
        }

        .location-legend .legend-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
        }

        .location-legend .legend-dot.black { background: #1C1C1C; }
        .location-legend .legend-dot.mint { background: #BAEDBD; }
        .location-legend .legend-dot.indigo { background: #95A4FC; }
        .location-legend .legend-dot.blue { background: #B1E3FF; }

        .location-legend span {
          color: #1C1C1C;
          font-size: 12px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          line-height: 18px;
        }

        .percentage {
          margin-left: auto;
        }

        /* Marketing & SEO */
        .marketing-seo {
          flex: 1 1 0;
          min-width: 800px;
          padding: 24px;
          background: linear-gradient(135deg, #F7F9FB 0%, #FFF0F5 100%);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .marketing-chart {
          flex: 1;
          display: flex;
          gap: 16px;
          position: relative;
        }

        .marketing-y-axis {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
        }

        .marketing-bars {
          flex: 1;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 16px 0 28px 0;
        }

        .marketing-bar {
          flex: 1;
          border-radius: 4px 4px 0 0;
          min-height: 4px;
        }

        .marketing-bar.indigo { background: #95A4FC; }
        .marketing-bar.mint { background: #BAEDBD; }
        .marketing-bar.black { background: #1C1C1C; }
        .marketing-bar.blue { background: #B1E3FF; }
        .marketing-bar.cyan { background: #A8C5DA; }
        .marketing-bar.green { background: #A1E3CB; }

        .marketing-x-axis {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          padding: 0 16px;
        }

        /* Tooltips */
        .tooltip {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
        }

        .tooltip-content {
          background: rgba(28, 28, 28, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          line-height: 1.4;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }


        .bar-tooltip {
          position: absolute;
          top: -50px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
        }

        .progress-tooltip {
          position: absolute;
          top: -50px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
        }

        .device-tooltip {
          position: absolute;
          top: -50px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .stats-container {
            flex-direction: column;
          }
          
          .charts-row {
            flex-direction: column;
          }
          
          .main-chart-container,
          .traffic-website,
          .traffic-device,
          .traffic-location,
          .marketing-seo {
            min-width: auto;
            width: 100%;
          }
        }

        @media (max-width: 768px) {
          .admin-dashboard {
            padding: 16px;
            gap: 16px;
          }

          .chart-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .location-content {
            flex-direction: column;
            gap: 20px;
            padding: 0;
          }

          .pie-chart {
            width: 100px;
            height: 100px;
          }

          .charts-row {
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
