'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { TaskCard } from './TaskCard';
import { AddColumnModal } from './AddColumnModal';
import { ColumnMenu } from './ColumnMenu';
import { mockTasks } from '@/constants/mockData';

interface BoardColumnsProps {
  project: Project;
  searchQuery: string;
  groupBy: string;
}

export const BoardColumns = ({ project, searchQuery, groupBy }: BoardColumnsProps) => {
  const [tasks, setTasks] = useState(mockTasks);

  const [columns, setColumns] = useState([
    {
      id: 'todo',
      title: 'CẦN LÀM',
      color: '#6b7280',
      order: 0
    },
    {
      id: 'in-progress',
      title: 'ĐANG LÀM',
      color: '#f59e0b',
      order: 1
    },
    {
      id: 'done',
      title: 'HOÀN THÀNH',
      color: '#10b981',
      order: 2
    },
    {
      id: 'review',
      title: 'ĐANG REVIEW',
      color: '#3b82f6',
      order: 3
    }
  ]);

  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.epic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTaskMove = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedTask) {
      handleTaskMove(draggedTask, columnId);
    }
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const handleAddColumn = (title: string, color: string) => {
    const newColumn = {
      id: `column-${Date.now()}`,
      title: title.toUpperCase(),
      color,
      order: columns.length
    };
    setColumns(prev => [...prev, newColumn]);
    setShowAddColumnModal(false);
  };

  const handleDeleteColumn = (columnId: string) => {
    // Move all tasks from this column to the first column
    const firstColumnId = columns[0].id;
    setTasks(prev => prev.map(task => 
      task.status === columnId ? { ...task, status: firstColumnId } : task
    ));
    
    // Remove the column
    setColumns(prev => prev.filter(col => col.id !== columnId));
  };

  const handleMoveColumnLeft = (columnId: string) => {
    setColumns(prev => {
      const newColumns = [...prev];
      const currentIndex = newColumns.findIndex(col => col.id === columnId);
      
      if (currentIndex > 0) {
        // Swap with previous column
        [newColumns[currentIndex], newColumns[currentIndex - 1]] = [newColumns[currentIndex - 1], newColumns[currentIndex]];
        
        // Update order values
        newColumns.forEach((col, index) => {
          col.order = index;
        });
      }
      
      return newColumns;
    });
  };

  const handleMoveColumnRight = (columnId: string) => {
    setColumns(prev => {
      const newColumns = [...prev];
      const currentIndex = newColumns.findIndex(col => col.id === columnId);
      
      if (currentIndex < newColumns.length - 1) {
        // Swap with next column
        [newColumns[currentIndex], newColumns[currentIndex + 1]] = [newColumns[currentIndex + 1], newColumns[currentIndex]];
        
        // Update order values
        newColumns.forEach((col, index) => {
          col.order = index;
        });
      }
      
      return newColumns;
    });
  };

  const handleDeleteOldItems = (columnId: string) => {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    setTasks(prev => prev.filter(task => {
      if (task.status === columnId) {
        const taskDate = new Date(task.dueDate);
        return taskDate > fourteenDaysAgo;
      }
      return true;
    }));
  };

  const sortedColumns = columns.sort((a, b) => a.order - b.order);

  return (
    <div className="board-columns">
      <div className="columns-container">
        {sortedColumns.map((column) => {
          const columnTasks = filteredTasks.filter(task => task.status === column.id);
          return (
            <div 
              key={column.id} 
              className={`board-column ${draggedOverColumn === column.id ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="column-header">
                <div className="column-title">
                  <div 
                    className="column-indicator"
                    style={{ backgroundColor: column.color }}
                  ></div>
                  <span>{column.title}</span>
                </div>
                <div className="column-actions">
                  <span className="column-count">{columnTasks.length}</span>
                  <ColumnMenu
                    columnId={column.id}
                    columnTitle={column.title}
                    isDoneColumn={column.id === 'done' || column.title.includes('HOÀN THÀNH')}
                    onMoveLeft={() => handleMoveColumnLeft(column.id)}
                    onMoveRight={() => handleMoveColumnRight(column.id)}
                    onDelete={() => handleDeleteColumn(column.id)}
                    onDeleteOldItems={column.id === 'done' || column.title.includes('HOÀN THÀNH') ? 
                      () => handleDeleteOldItems(column.id) : undefined}
                    canMoveLeft={sortedColumns.findIndex(col => col.id === column.id) > 0}
                    canMoveRight={sortedColumns.findIndex(col => col.id === column.id) < sortedColumns.length - 1}
                  />
                </div>
              </div>

              <div className="column-content">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onMove={(newStatus) => handleTaskMove(task.id, newStatus)}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    isDragging={draggedTask === task.id}
                  />
                ))}
                
                <button className="create-task-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Tạo
                </button>
              </div>
            </div>
          );
        })}
        
        <button 
          className="add-column-btn"
          onClick={() => setShowAddColumnModal(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Thêm cột
        </button>
      </div>

      {showAddColumnModal && (
        <AddColumnModal
          onClose={() => setShowAddColumnModal(false)}
          onAdd={handleAddColumn}
        />
      )}

      <style jsx>{`
        .board-columns {
          flex: 1;
          overflow: hidden;
          background: #f8f9fa;
        }

        .columns-container {
          display: flex;
          height: 100%;
          gap: 20px;
          padding: 20px;
          overflow-x: auto;
        }

        .board-column {
          min-width: 300px;
          max-width: 300px;
          background: #f1f3f4;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          height: fit-content;
          max-height: calc(100vh - 120px);
          transition: all 0.2s ease;
        }

        .board-column.drag-over {
          background: #e0f2fe;
          border: 2px dashed #0ea5e9;
        }

        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .column-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }


        .column-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .column-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .column-count {
          background: #e5e7eb;
          color: #6b7280;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .column-content {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
        }

        .create-task-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          background: transparent;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
        }

        .create-task-btn:hover {
          border-color: #9ca3af;
          color: #374151;
          background: #f9fafb;
        }

        .add-column-btn {
          min-width: 200px;
          height: 60px;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          background: transparent;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          margin-top: 20px;
        }

        .add-column-btn:hover {
          border-color: #9ca3af;
          color: #374151;
          background: #f9fafb;
        }

        @media (max-width: 768px) {
          .columns-container {
            padding: 12px;
            gap: 12px;
          }

          .board-column {
            min-width: 250px;
            max-width: 250px;
          }
        }
      `}</style>
    </div>
  );
};
