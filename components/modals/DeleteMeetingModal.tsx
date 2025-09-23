"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface DeleteMeetingModalProps {
  meeting: {
    id: string;
    title: string;
    startTime: string;
    projectId: string;
  };
  onClose: () => void;
  onConfirm: (meetingId: string) => void;
}

export const DeleteMeetingModal = ({
  meeting,
  onClose,
  onConfirm,
}: DeleteMeetingModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(meeting.id);
      onClose();
    } catch (error) {
      console.error("Error deleting meeting:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal panel */}
      <div className="relative w-full max-w-md mx-4 rounded-xl border bg-white shadow-2xl animate-in fade-in zoom-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Đóng"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 p-6 pb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Xóa cuộc họp
            </h3>
            <p className="text-sm text-gray-500">
              Hành động này không thể hoàn tác
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">{meeting.title}</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>📅 <span className="font-medium">Thời gian:</span> {formatDate(meeting.startTime)}</p>
              <p>🆔 <span className="font-medium">ID:</span> {meeting.id}</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-medium text-red-800 mb-1">
                  Cảnh báo quan trọng
                </h5>
                <p className="text-sm text-red-700">
                  Bạn có chắc chắn muốn xóa cuộc họp này? Tất cả dữ liệu liên quan 
                  sẽ bị mất vĩnh viễn và không thể khôi phục.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="px-6"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-6 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Xóa cuộc họp
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
