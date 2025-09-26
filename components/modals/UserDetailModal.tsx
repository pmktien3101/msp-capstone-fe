"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: "Member" | "ProjectManager";
    status: "active" | "inactive";
    joinDate: string;
    lastActive: string;
    projects: number;
  } | null;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, member }) => {
  if (!member) return null;

  const roleText = member.role === "ProjectManager" ? "Project Manager" : "Member";
  const statusText = member.status === "active" ? "Hoạt động" : "Không hoạt động";

  const initial = member.name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-[600px] p-0 overflow-hidden bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Chi tiết người dùng - {member.name}</DialogTitle>
        {/* Header */}
        <div className="user-header">
          <div className="user-avatar">
            {initial}
          </div>
          <div className="user-info">
            <h2 className="user-name">{member.name}</h2>
            <p className="user-email">{member.email}</p>
            <div className="user-badges">
              <span className="badge role">{roleText}</span>
              <span className={`badge status ${member.status === "active" ? "active" : "inactive"}`}>
                {statusText}
              </span>
            </div>
          </div>
        </div>
        </DialogHeader>


        {/* Content */}
        <div className="user-content">
          {/* Contact Information */}
          <div className="info-section">
            <h3 className="section-title">Thông tin liên hệ</h3>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">Email</div>
                <div className="info-value">{member.email}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Số điện thoại</div>
                <div className="info-value">{member.phone}</div>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="info-section">
            <h3 className="section-title">Tổng quan</h3>
            <div className="overview-grid">
              <div className="overview-item">
                <div className="overview-label">Vai trò</div>
                <div className="overview-value">{roleText}</div>
              </div>
              <div className="overview-item">
                <div className="overview-label">Trạng thái</div>
                <div className="overview-value">{statusText}</div>
              </div>
              <div className="overview-item">
                <div className="overview-label">Ngày tham gia</div>
                <div className="overview-value">{member.joinDate}</div>
              </div>
              <div className="overview-item">
                <div className="overview-label">Số dự án</div>
                <div className="overview-value highlight">{member.projects}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="user-footer">
          <button className="close-btn" onClick={onClose}>
            Đóng
          </button>
        </div>

        <style jsx>{`
          /* Header */
          .user-header {
            background: linear-gradient(135deg, #FF5E13, #FF8C42);
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 16px;
            color: white;
          }

          .user-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 800;
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
          }

          .user-info {
            flex: 1;
          }

          .user-name {
            font-size: 22px;
            font-weight: 800;
            margin: 0 0 6px 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .user-email {
            font-size: 14px;
            opacity: 0.9;
            margin: 0 0 12px 0;
            font-weight: 500;
          }

          .user-badges {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .badge {
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 11px;
            font-weight: 600;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
          }

          .badge.role {
            background: rgba(255, 255, 255, 0.2);
            color: white;
          }

          .badge.status.active {
            background: rgba(34, 197, 94, 0.3);
            color: #86EFAC;
            border-color: rgba(34, 197, 94, 0.5);
          }

          .badge.status.inactive {
            background: rgba(239, 68, 68, 0.3);
            color: #FCA5A5;
            border-color: rgba(239, 68, 68, 0.5);
          }

          /* Content */
          .user-content {
            padding: 20px;
          }

          .info-section {
            margin-bottom: 20px;
          }

          .info-section:last-child {
            margin-bottom: 0;
          }

          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #1F2937;
            margin: 0 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #FF5E13;
            position: relative;
          }

          .section-title::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 60px;
            height: 2px;
            background: #FF8C42;
          }

          /* Contact Information Grid */
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .info-item {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 12px;
            transition: all 0.3s ease;
          }

          .info-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            border-color: #FF5E13;
          }

          .info-label {
            font-size: 11px;
            color: #6B7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }

          .info-value {
            font-size: 14px;
            font-weight: 600;
            color: #1F2937;
            word-break: break-all;
            line-height: 1.3;
          }


          /* Overview Grid */
          .overview-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
          }

          .overview-item {
            background: linear-gradient(135deg, #FFF7ED, #FED7AA);
            border: 1px solid #FDBA74;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .overview-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #FF5E13, #FF8C42);
          }

          .overview-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 94, 19, 0.2);
          }

          .overview-label {
            font-size: 10px;
            color: #9A3412;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }

          .overview-value {
            font-size: 14px;
            font-weight: 800;
            color: #7C2D12;
          }

          .overview-value.highlight {
            color: #FF5E13;
            font-size: 18px;
          }

          /* Footer */
          .user-footer {
            padding: 16px 20px;
            background: #F8FAFC;
            border-top: 1px solid #E2E8F0;
            display: flex;
            justify-content: center;
          }

          .close-btn {
            background: #FF5E13;
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(255, 94, 19, 0.3);
          }

          .close-btn:hover {
            background: #FF8C42;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 94, 19, 0.4);
          }

          /* Responsive */
          @media (max-width: 768px) {
            .user-header {
              padding: 16px;
              flex-direction: column;
              text-align: center;
              gap: 12px;
            }

            .user-avatar {
              width: 50px;
              height: 50px;
              font-size: 20px;
            }

            .user-name {
              font-size: 20px;
            }

            .user-content {
              padding: 16px;
            }

            .info-grid {
              grid-template-columns: 1fr;
              gap: 10px;
            }

            .overview-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }

            .user-footer {
              padding: 12px 16px;
            }
          }

          @media (max-width: 480px) {
            .overview-grid {
              grid-template-columns: 1fr;
            }

            .user-badges {
              justify-content: center;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;


