'use client';

import { useState, useRef, useEffect } from 'react';

export type TimeFilterOption = '7d' | 'lastMonth' | 'thisMonth' | 'lastYear' | 'thisYear' | 'all';

interface TimeFilterProps {
  selectedFilter: TimeFilterOption;
  onFilterChange: (filter: TimeFilterOption) => void;
}

const timeFilterOptions = [
  { value: '7d' as TimeFilterOption, label: '7 ngày qua' },
  { value: 'lastMonth' as TimeFilterOption, label: 'Tháng trước' },
  { value: 'thisMonth' as TimeFilterOption, label: 'Tháng này' },
  { value: 'lastYear' as TimeFilterOption, label: 'Năm trước' },
  { value: 'thisYear' as TimeFilterOption, label: 'Năm nay' },
  { value: 'all' as TimeFilterOption, label: 'Tất cả' }
];

export default function TimeFilter({ selectedFilter, onFilterChange }: TimeFilterProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getSelectedLabel = () => {
    return timeFilterOptions.find(option => option.value === selectedFilter)?.label || 'Chọn thời gian';
  };

  return (
    <div className="time-filter" ref={dropdownRef}>
      <button 
        className="time-filter-trigger"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>{getSelectedLabel()}</span>
        <svg 
          className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none"
        >
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      {isDropdownOpen && (
        <div className="time-filter-menu">
          {timeFilterOptions.map((option) => (
            <button
              key={option.value}
              className={`time-filter-item ${selectedFilter === option.value ? 'active' : ''}`}
              onClick={() => {
                onFilterChange(option.value);
                setIsDropdownOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
