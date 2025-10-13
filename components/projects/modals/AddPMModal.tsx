'use client';

import { useState, useEffect } from 'react';
import { Search, UserCog } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProjectManager {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AddPMModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (pmIds: string[]) => void;
  availableManagers: ProjectManager[];
  currentManagers: ProjectManager[];
}

export function AddPMModal({
  isOpen,
  onClose,
  onAdd,
  availableManagers,
  currentManagers
}: AddPMModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPMs, setSelectedPMs] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedPMs([]);
    }
  }, [isOpen]);

  const filteredManagers = availableManagers.filter(pm => 
    pm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pm.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePM = (pmId: string) => {
    setSelectedPMs(prev => 
      prev.includes(pmId)
        ? prev.filter(id => id !== pmId)
        : [...prev, pmId]
    );
  };

  const handleAdd = () => {
    if (selectedPMs.length > 0) {
      onAdd(selectedPMs);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white to-orange-50 border-orange-200">
        <DialogHeader className="pb-4 border-b border-orange-100">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <UserCog size={20} className="text-white" />
            </div>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Thêm Project Manager
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Chọn các Project Manager để thêm vào dự án
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
            {filteredManagers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Không tìm thấy Project Manager nào</p>
              </div>
            ) : (
              filteredManagers.map((pm) => (
                <div
                  key={pm.id}
                  onClick={() => togglePM(pm.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPMs.includes(pm.id)
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
                    {pm.avatar ? (
                      <img 
                        src={pm.avatar} 
                        alt={pm.name} 
                        className="w-full h-full object-cover rounded-lg" 
                      />
                    ) : (
                      <span>{pm.name.charAt(0)}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      {pm.name}
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded">PM</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {pm.email}
                    </div>
                  </div>
                  
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selectedPMs.includes(pm.id)
                      ? 'bg-orange-500 border-orange-500 scale-110'
                      : 'border-gray-300'
                  }`}>
                    {selectedPMs.includes(pm.id) && (
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        className="text-white"
                      >
                        <path 
                          d="M13.3337 4L6.00033 11.3333L2.66699 8" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-orange-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
          >
            Hủy
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedPMs.length === 0}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <UserCog size={16} className="mr-2" />
            Thêm {selectedPMs.length > 0 && `(${selectedPMs.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
