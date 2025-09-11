import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import '@/app/styles/milestone.scss';

interface MeetingDetailModalProps {
  isOpen: boolean
  onClose: () => void
  meeting: any // Sẽ thay bằng interface Meeting sau
}

export function MeetingDetailModal({ isOpen, onClose, meeting }: MeetingDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="meeting-detail-modal">
        <DialogHeader>
          <DialogTitle>{meeting?.title}</DialogTitle>
        </DialogHeader>

        <div className="meeting-meta">
          <div className="meta-item">
            <span className="label">Thời gian:</span>
            <span className="value">14:00 - 15:00, 10/09/2023</span>
          </div>
          <div className="meta-item">
            <span className="label">Số người tham gia:</span>
            <span className="value">6 thành viên</span>
          </div>
        </div>

        <Tabs defaultValue="summary" className="meeting-tabs">
          <TabsList>
            <TabsTrigger value="summary">Tóm Tắt</TabsTrigger>
            <TabsTrigger value="tasks">Danh Sách Công Việc</TabsTrigger>
            <TabsTrigger value="notes">Ghi Chú Thu Công</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="meeting-content">
            <div className="transcript-section">
              <h3>Nội dung cuộc họp</h3>
              <div className="transcript">
                <p>Cuộc họp thảo luận về kiến trúc hệ thống CRM đã diễn ra thành công. Team đã thống nhất về việc sử dụng microservices architecture và database design. Các thành viên đã được phân công trách nhiệm cụ thể cho từng module.</p>
                
                <div className="key-points">
                  <h4>Các điểm chính:</h4>
                  <ul>
                    <li>Thống nhất sử dụng Microservices Architecture</li>
                    <li>Phân chia module và trách nhiệm cho team</li>
                    <li>Thảo luận về Database Schema</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="meeting-content">
            <div className="tasks-section">
              <div className="task-list">
                <div className="task-item">
                  <div className="task-info">
                    <h4>Thiết kế database schema cho module User Management</h4>
                    <div className="task-meta">
                      <span className="assignee">Hoàng Văn E</span>
                      <span className="due-date">25/06/2024</span>
                      <span className="priority high">Cao</span>
                    </div>
                  </div>
                  <div className="task-status pending">Đang thực hiện</div>
                </div>

                <div className="task-item">
                  <div className="task-info">
                    <h4>Tạo API documentation cho các endpoints</h4>
                    <div className="task-meta">
                      <span className="assignee">Vũ Thị F</span>
                      <span className="due-date">30/06/2024</span>
                      <span className="priority medium">Trung bình</span>
                    </div>
                  </div>
                  <div className="task-status waiting">Chờ thực hiện</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="meeting-content">
            <div className="notes-section">
              <div className="note-content">
                <h4>Ghi chú bổ sung</h4>
                <ul className="note-list">
                  <li>Cần thêm diagram để minh họa kiến trúc hệ thống</li>
                  <li>Xem xét việc sử dụng Redis cho caching</li>
                  <li>Lên kế hoạch chi tiết cho việc migration data</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="modal-actions">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
