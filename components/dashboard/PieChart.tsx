'use client';

import React from 'react';

interface PieChartProps {
  title: string;
  data: {
    labels: string[];
    values: number[];
    colors: string[];
  };
  height?: number;
}

export default function PieChart({ 
  title, 
  data, 
  height = 200 
}: PieChartProps) {
  // Tính tổng giá trị
  const total = data.values.reduce((sum, value) => sum + value, 0);
  
  // Tính góc cho từng phần
  let currentAngle = 0;
  const segments = data.values.map((value, index) => {
    const percentage = (value / total) * 100;
    const angle = (value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    currentAngle += angle;
    
    return {
      label: data.labels[index],
      value,
      percentage: Math.round(percentage),
      color: data.colors[index],
      startAngle,
      endAngle,
      angle
    };
  });

  // Tính toán đường path cho SVG
  const getPathData = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(radius, radius, radius, endAngle);
    const end = polarToCartesian(radius, radius, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", radius, radius,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const radius = 60;
  const centerX = radius;
  const centerY = radius;

  return (
    <div className="pie-chart">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
      </div>
      
      <div className="chart-content">
        <div className="pie-container">
          <svg width={radius * 2} height={radius * 2} className="pie-svg">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={getPathData(segment.startAngle, segment.endAngle, radius)}
                fill={segment.color}
                stroke="#fff"
                strokeWidth="2"
                className="pie-segment"
              />
            ))}
          </svg>
        </div>
        
        <div className="legend">
          {segments.map((segment, index) => (
            <div key={index} className="legend-item">
              <div 
                className="legend-color"
                style={{ backgroundColor: segment.color }}
              ></div>
              <div className="legend-text">
                <span className="legend-label">{segment.label}</span>
                <span className="legend-value">{segment.value} ({segment.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .pie-chart {
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

        .chart-content {
          display: flex;
          align-items: center;
          gap: 16px;
          min-height: ${height}px;
        }

        .pie-container {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pie-svg {
          width: ${radius * 2}px;
          height: ${radius * 2}px;
        }

        .pie-segment {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .pie-segment:hover {
          opacity: 0.8;
          transform: scale(1.05);
          transform-origin: center;
        }

        .legend {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .legend-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .legend-label {
          font-size: 12px;
          color: #374151;
          font-weight: 500;
        }

        .legend-value {
          font-size: 11px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .chart-content {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .pie-container {
            align-self: center;
          }

          .legend {
            width: 100%;
          }

          .legend-item {
            justify-content: space-between;
          }

          .legend-text {
            flex-direction: row;
            gap: 8px;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}
