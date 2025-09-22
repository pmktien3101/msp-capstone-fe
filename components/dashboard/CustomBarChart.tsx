'use client';

import React, { useState } from 'react';

interface CustomBarChartProps {
  title: string;
  data: {
    labels: string[];
    completedData: number[];
    totalData: number[];
  };
  height?: number;
}

export default function CustomBarChart({ 
  title, 
  data, 
  height = 300 
}: CustomBarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  
  // Tính toán scale cho biểu đồ
  const maxValue = Math.max(...data.totalData);
  const scaleValues = [];
  const step = maxValue / 3;
  for (let i = 0; i <= 3; i++) {
    scaleValues.push(Math.round(step * i));
  }

  // Tính toán vị trí các cột
  const getBarHeight = (value: number) => {
    return (value / maxValue) * (height - 130);
  };

  const getBarWidth = () => {
    return (100 / data.labels.length) - 2; // 2% gap between bars
  };

  return (
    <div className="custom-bar-chart">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
      </div>
      
      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color completed"></div>
          <span>Công việc hoàn thành</span>
        </div>
        <div className="legend-item">
          <div className="legend-color total"></div>
          <span>Tổng số công việc</span>
        </div>
      </div>

      <div className="chart-content">
        <div className="chart-y-axis">
          {scaleValues.slice().reverse().map((value, index) => (
            <div key={index} className="y-axis-label">
              {value > 0 ? `${value}` : '0'}
            </div>
          ))}
        </div>

        <div className="chart-main" style={{ height: `${height}px` }}>
          <div className="chart-grid">
            {scaleValues.map((_, index) => (
              <div 
                key={index} 
                className="grid-line"
                style={{ top: `${(index / (scaleValues.length - 1)) * (height - 130) + 20}px` }}
              />
            ))}
          </div>

          <div className="chart-bars-container">
            <div className="chart-bars" style={{ height: `${height - 130}px`, marginTop: '20px', marginBottom: '30px' }}>
              {data.labels.map((label, index) => {
                const completedHeight = getBarHeight(data.completedData[index]);
                const totalHeight = getBarHeight(data.totalData[index]);
                const barWidth = getBarWidth();
                const leftPosition = (index * (100 / data.labels.length)) + 1;

                return (
                  <div 
                    key={index} 
                    className="bar-group"
                    style={{ 
                      position: 'absolute',
                      left: `${leftPosition}%`,
                      width: `${barWidth}%`,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      padding: '0 8px'
                    }}
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div className="bar-container" style={{ position: 'relative', width: '20px' }}>
                      {/* Total bar (background) */}
                      <div 
                        className="bar total-bar"
                        style={{
                          width: '20px',
                          height: `${totalHeight}px`,
                          background: hoveredBar === index ? 'rgba(168, 197, 218, 0.3)' : 'rgba(168, 197, 218, 0.5)',
                          borderRadius: '4px 4px 0 0',
                          position: 'absolute',
                          bottom: 0,
                          transition: 'all 0.3s ease'
                        }}
                      />
                      {/* Completed bar (foreground) */}
                      <div 
                        className="bar completed-bar"
                        style={{
                          width: '20px',
                          height: `${completedHeight}px`,
                          background: hoveredBar === index ? '#7BA7C7' : '#A8C5DA',
                          borderRadius: '4px 4px 0 0',
                          position: 'absolute',
                          bottom: 0,
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="chart-x-axis">
            {data.labels.map((label, index) => (
              <div key={index} className="x-axis-label">
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

<style jsx>{`
  .custom-bar-chart {
    width: 100%;
    height: auto;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .chart-header {
    margin-bottom: 12px;
  }

  .chart-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }

  .chart-legend {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }

  .legend-color.completed {
    background: #A8C5DA;
  }

  .legend-color.total {
    background: rgba(168, 197, 218, 0.5);
  }

  .legend-item span {
    font-size: 12px;
    color: #6b7280;
  }

  .chart-content {
    flex: 1;
    display: flex;
    position: relative;
    overflow: hidden;
  }

  .chart-y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-right: 8px;
    min-width: 30px;
  }

  .y-axis-label {
    font-size: 11px;
    color: #6b7280;
    text-align: right;
    line-height: 1;
  }

  .chart-main {
    flex: 1;
    position: relative;
    overflow: hidden;
    padding-bottom: 30px;
  }

  .chart-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .grid-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: #e5e7eb;
  }

  .chart-bars-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .chart-bars {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .bar-group {
    cursor: pointer;
  }

  .bar-container {
    position: relative;
  }

  .bar {
    transition: all 0.3s ease;
  }

  .chart-x-axis {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding-top: 8px;
    padding-bottom: 8px;
    height: 30px;
  }

  .x-axis-label {
    font-size: 11px;
    color: #6b7280;
    text-align: center;
    transform: rotate(-45deg);
    transform-origin: center;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .chart-legend {
      gap: 12px;
    }
    
    .legend-item span {
      font-size: 11px;
    }
    
    .x-axis-label {
      font-size: 10px;
    }
  }
`}</style>