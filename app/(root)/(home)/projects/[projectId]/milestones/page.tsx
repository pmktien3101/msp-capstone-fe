'use client'

import React, { useEffect, useState } from 'react'
import '@/app/styles/milestone.scss'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { format } from 'date-fns'
import { Member } from '@/types'
import { Milestone, MilestoneFormData, Task } from '@/types/milestone'
import { Project } from '@/types/project'
import MilestoneModal from '@/components/modals/MilestoneModal'


const ProjectMilestonePage = () => {
  const router = useRouter()
  const params = useParams()
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [isProjectSpecific, setIsProjectSpecific] = useState(false)
  
  // Modal states
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [showTasksModal, setShowTasksModal] = useState(false)
  const [showEditMilestoneModal, setShowEditMilestoneModal] = useState(false)
  const [showMilestoneDetailsModal, setShowMilestoneDetailsModal] = useState(false)
  
  const [milestoneToDelete, setMilestoneToDelete] = useState<Milestone | null>(null)
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [selectedMilestoneForDetails, setSelectedMilestoneForDetails] = useState<Milestone | null>(null)
  const [selectedMilestoneForEdit, setSelectedMilestoneForEdit] = useState<Milestone | null>(null)
  
  // Form states
  const [editMilestoneForm, setEditMilestoneForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'pending' as const,
    priority: 'medium' as const
  })

  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    priority: 'medium' as const,
    assignedTo: null as Member | null, // Changed from ProjectMember to Member
    dueDate: ''
  })

  const [milestoneTasks, setMilestoneTasks] = useState<{ [key: string]: Task[] }>({})

  // Mock data
const availableMembers: Member[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@company.com',
    role: 'Frontend Developer',
    avatar: 'NA'
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'tranthib@company.com',
    role: 'Backend Developer',
    avatar: 'TB'
  }
];
  useEffect(() => {
    // Debug: log toàn bộ params object
    console.log('Params:', params)
    
    // Do chúng ta đang ở trong /projects/[projectId]/milestones
    const projectId = (params as any)?.projectId as string || null
    console.log('ProjectId:', projectId) // Debug
    
    setIsProjectSpecific(!!projectId)

    if (projectId) {
      // Debug: tìm project
      console.log('Projects available:', projects)
      const mockProject = projects.find(p => p.id === projectId)
      console.log('Found project:', mockProject) // Debug
      
      setCurrentProject(mockProject || null)
      
      // Debug: kiểm tra milestones
      console.log('Available milestones:', mockMilestones[projectId])
      setMilestones(mockMilestones[projectId] || [])
    } else {
      setMilestones(mockMilestones['1'] || [])
    }
  }, [params])

  // Helper functions
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Chờ thực hiện',
      'in-progress': 'Đang thực hiện',
      'completed': 'Hoàn thành',
      'overdue': 'Quá hạn',
      'delayed': 'Bị trễ'
    }
    return statusMap[status] || status
  }

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy')
  }

  const confirmDeleteMilestone = (milestone: Milestone) => {
    setMilestoneToDelete(milestone)
    setShowDeleteConfirmModal(true)
  }

  const cancelDeleteMilestone = () => {
    setMilestoneToDelete(null)
    setShowDeleteConfirmModal(false)
  }

  const deleteMilestoneConfirmed = () => {
    if (!milestoneToDelete) return
    setMilestones(prevMilestones => 
      prevMilestones.filter(m => m.id !== milestoneToDelete.id)
    )
    cancelDeleteMilestone()
  }

  const getInProgressCount = () => {
    return milestones.filter(m => m.status === 'in-progress').length
  }

  const getCompletedCount = () => {
    return milestones.filter(m => m.status === 'completed').length
  }

  const getAverageProgress = () => {
    if (milestones.length === 0) return 0
    const totalProgress = milestones.reduce((sum, m) => sum + m.progress, 0)
    return Math.round(totalProgress / milestones.length)
  }

  const openCreateMilestone = () => {
    setSelectedMilestoneForEdit(null)
    setEditMilestoneForm({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'pending',
      priority: 'medium'
    })
    setShowEditMilestoneModal(true)
  }

  return (
    <div className="milestones-page">
      {/* Confirm Delete Modal */}
      {showDeleteConfirmModal && (
        <div className="modal-overlay" onClick={cancelDeleteMilestone}>
          <div className="modal" style={{ maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '24px 24px 0 24px' }}>
              <h3 style={{ margin: 0, color: '#ef4444', fontSize: '20px' }}>Xác nhận xóa milestone</h3>
            </div>
            <div className="modal-content" style={{ padding: '24px' }}>
              <p>Bạn có chắc chắn muốn xóa milestone <b>{milestoneToDelete?.name}</b> không?</p>
            </div>
            <div className="modal-actions" style={{ padding: '0 24px 24px 24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={cancelDeleteMilestone}>Hủy</button>
              <button className="btn btn-primary" style={{ background: '#ef4444' }} onClick={deleteMilestoneConfirmed}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="header-content">
          <div className="header-title-section">
            {isProjectSpecific && (
              <button className="btn btn-outline btn-sm back-btn" onClick={() => router.push('/projects')}>
                ← Quay lại Dự Án
              </button>
            )}
            <h2>{!isProjectSpecific ? '🎯 Quản Lý Milestone' : `🎯 Milestones - ${currentProject?.name}`}</h2>
            <p>
              {!isProjectSpecific
                ? 'Theo dõi và quản lý các milestone của dự án'
                : `Quản lý milestones cho dự án ${currentProject?.name}`}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <Button
            variant="default"
            className="create-milestone-btn"
            onClick={openCreateMilestone}
          >
            <Plus className="w-5 h-5 mr-2" />
            Tạo Milestone Mới
          </Button>
          <Button variant="outline">
            📊 Xem Báo Cáo
          </Button>
        </div>
      </div>

      {/* Project Info Section */}
      {isProjectSpecific && currentProject && (
        <div className="project-info-section">
          <div className="project-info-card">
            <div className="project-info-header">
              <div className="project-icon">📁</div>
              <div className="project-info">
                <h3>{currentProject.name}</h3>
                <p>{currentProject.description}</p>
              </div>
              <div className="project-status">
                <span className={`status-badge ${currentProject.status}`}>
                  {currentProject.status === 'active' ? 'Đang thực hiện' :
                   currentProject.status === 'planning' ? 'Lập kế hoạch' :
                   currentProject.status === 'completed' ? 'Hoàn thành' : 
                   currentProject.status}
                </span>
              </div>
            </div>
            <div className="project-info-meta">
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span className="meta-text">
                  {formatDate(currentProject.startDate)} - {formatDate(currentProject.endDate)}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">👤</span>
                <span className="meta-text">{currentProject.manager}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">⏰</span>
                <span className="meta-text">Tiến độ: {currentProject.progress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
     {/* Milestones Summary */}
      <div className="milestones-summary">
        <div className="summary-card">
          <div className="summary-icon">🎯</div>
          <div className="summary-content">
            <h4>Tổng số milestone</h4>
            <p className="summary-number">{milestones.length}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🚀</div>
          <div className="summary-content">
            <h4>Đang thực hiện</h4>
            <p className="summary-number">{getInProgressCount()}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <h4>Hoàn thành</h4>
            <p className="summary-number">{getCompletedCount()}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">⏰</div>
          <div className="summary-content">
            <h4>Trung bình hoàn thành</h4>
            <p className="summary-number">{getAverageProgress()}%</p>
          </div>
        </div>
      </div>
      {/* Filters Section */}
      <div className="milestones-filters">
        <div className="filter-group">
          <label>Trạng thái:</label>
          <select className="filter-select" aria-label="Lọc theo trạng thái">
            <option value="">Tất cả</option>
            <option value="pending">Chờ thực hiện</option>
            <option value="in-progress">Đang thực hiện</option>
            <option value="completed">Hoàn thành</option>
            <option value="delayed">Bị trễ</option>
          </select>
        </div>
        {isProjectSpecific && (
          <div className="filter-group">
            <label>Dự án:</label>
            <select className="filter-select" aria-label="Lọc theo dự án">
              <option value="">Tất cả dự án</option>
              <option value="1">Website E-commerce</option>
              <option value="2">Mobile App</option>
              <option value="3">CRM System</option>
            </select>
          </div>
        )}
        <div className="filter-group">
          <label>Tìm kiếm:</label>
          <input type="text" className="filter-input" placeholder="Tìm kiếm milestone..." />
        </div>
      </div>

      {/* Milestone Cards */}
      <div className="milestone-cards">
        {milestones.map(milestone => (
          <div key={milestone.id} className="milestone-card" style={{ position: 'relative' }}>
            <button 
              className="milestone-delete-btn"
              style={{ 
                position: 'absolute', 
                top: '12px', 
                right: '12px', 
                background: 'transparent', 
                border: 'none', 
                fontSize: '18px', 
                color: '#ef4444', 
                cursor: 'pointer',
                zIndex: 2
              }}
              onClick={() => confirmDeleteMilestone(milestone)}
            >×</button>
            <div className="milestone-header">
              <div className="milestone-icon">🎯</div>
              <div className="milestone-status">
                <span className={`status-badge ${milestone.status}`}>
                  {getStatusText(milestone.status)}
                </span>
              </div>
            </div>
            <div className="milestone-content">
              <h3 className="milestone-title">{milestone.name}</h3>
              <p className="milestone-description">{milestone.description}</p>
              <div className="milestone-meta">
                {!isProjectSpecific && (
                  <div className="meta-item">
                    <span className="meta-icon">📁</span>
                    <span className="meta-text">{milestone.projectName}</span>
                  </div>
                )}
                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <span className="meta-text">
                    {formatDate(milestone.startDate)} - {formatDate(milestone.endDate)}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">👥</span>
                  <span className="meta-text">5 thành viên</span>
                </div>
              </div>
              <div className="milestone-progress">
                <div className="progress-header">
                  <span className="progress-label">Tiến độ</span>
                  <span className="progress-percentage">{milestone.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${milestone.progress}%`,
                      background: 'linear-gradient(135deg, #FF5E13, #FFA463)'
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="milestone-actions">
              <Button 
                variant="default"
                onClick={() => router.push(`/projects/${currentProject?.id}/milestones/${milestone.id}`)}
              >
                Xem Chi Tiết
              </Button>
              <Button 
                variant="secondary"
                onClick={() => {
                  setSelectedMilestoneForEdit(milestone)
                  setShowEditMilestoneModal(true)
                }}
              >
                Chỉnh Sửa
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedMilestone(milestone)
                  setShowTasksModal(true)
                }}
              >
                📋 Tasks ({milestoneTasks[milestone.id]?.length || 0})
              </Button>
            </div>
          </div>
        ))}
      </div>

      

      {/* Edit/Create Milestone Modal */}
      <MilestoneModal
        isOpen={showEditMilestoneModal}
        onClose={() => setShowEditMilestoneModal(false)}
        onSubmit={(formData: MilestoneFormData) => {
          // TODO: Replace with actual API call
          if (selectedMilestoneForEdit) {
            // Edit existing milestone
            setMilestones(prev => prev.map(m => 
              m.id === selectedMilestoneForEdit.id 
                ? {
                    ...m,
                    name: formData.name,
                    description: formData.description,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    status: formData.status,
                    priority: formData.priority,
                    members: availableMembers.filter(member => 
                      formData.members.includes(member.id)
                    ),
                    updatedAt: new Date().toISOString()
                  }
                : m
            ))
          } else {
            // Create new milestone
            const newMilestone: Milestone = {
              id: Math.random().toString(),
              name: formData.name,
              description: formData.description,
              startDate: formData.startDate,
              endDate: formData.endDate,
              status: formData.status,
              priority: formData.priority,
              projectId: currentProject?.id || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              progress: 0,
              projectName: currentProject?.name,
              members: availableMembers.filter(member => 
                formData.members.includes(member.id)
              )
            }
            setMilestones(prev => [...prev, newMilestone])
          }
          setShowEditMilestoneModal(false)
        }}
        initialData={selectedMilestoneForEdit ? {
          name: selectedMilestoneForEdit.name,
          description: selectedMilestoneForEdit.description,
          startDate: selectedMilestoneForEdit.startDate,
          endDate: selectedMilestoneForEdit.endDate,
          status: selectedMilestoneForEdit.status,
          priority: selectedMilestoneForEdit.priority,
          members: selectedMilestoneForEdit.members.map(m => m.id)
        } : undefined}
        projectMembers={availableMembers}
        mode={selectedMilestoneForEdit ? 'edit' : 'create'}
      />
    </div>
  )
}

// Mock data
const projects: Project[] = [
  {
    id: '1',
    name: 'Website E-commerce',
    description: 'Phát triển website bán hàng trực tuyến với đầy đủ tính năng',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    manager: 'Nguyễn Văn A',
    status: 'active',
    progress: 65,
    members: [
      {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@company.com',
        role: 'Frontend Developer',
        avatar: 'NA'
      },
      {
        id: '2',
        name: 'Trần Thị B',
        email: 'tranthib@company.com',
        role: 'Backend Developer',
        avatar: 'TB'
      },
      {
        id: '3',
        name: 'Lê Văn C',
        email: 'levanc@company.com',
        role: 'UI/UX Designer',
        avatar: 'LC'
      }
    ],
    milestones: ['1', '2', '3'], // Added - required by Project type
  },
  {
    id: '2',
    name: 'Mobile App',
    description: 'Ứng dụng di động đa nền tảng cho khách hàng',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    manager: 'Trần Thị B',
    status: 'planning',
    progress: 15,
    members: [],
    milestones: [], // Added - required by Project type
  }
]
const mockMilestones: Record<string, Milestone[]> = {
  '1': [
    {
      id: '1',
      name: 'Thiết Kế UI/UX',
      description: 'Thiết kế giao diện người dùng và trải nghiệm người dùng',
      startDate: '2024-01-01',
      endDate: '2024-02-15',
      status: 'completed',
      priority: 'high',
      projectId: '1',
      createdAt: '2024-01-01',
      updatedAt: '2024-02-15',
      progress: 100,
      projectName: 'Website E-commerce',
      members: [
        {
          id: '1',
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@company.com',
          role: 'Frontend Developer',
          avatar: 'NA'
        }
      ]
    },
    {
      id: '2',
      name: 'Phát Triển Frontend',
      description: 'Xây dựng giao diện người dùng với React/Next.js',
      startDate: '2024-02-16',
      endDate: '2024-04-30',
      status: 'in-progress',
      priority: 'medium',
      projectId: '1',
      createdAt: '2024-02-16',
      updatedAt: '2024-04-30',
      progress: 75,
      projectName: 'Website E-commerce',
      members: []
    },
    {
      id: '3',
      name: 'Phát Triển Backend',
      description: 'Xây dựng hệ thống backend và API',
      startDate: '2024-03-01',
      endDate: '2024-05-31',
      status: 'in-progress',
      priority: 'high',
      projectId: '1',
      createdAt: '2024-03-01',
      updatedAt: '2024-05-31',
      progress: 60,
      projectName: 'Website E-commerce',
      members: []
    }
  ]
}

export default ProjectMilestonePage