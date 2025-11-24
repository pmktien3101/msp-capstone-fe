'use client';

import { useRef, useEffect } from 'react';
import '@/app/styles/task-list-header.scss';
import { Filter, AlertCircle, CheckCircle2, Calendar, X } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface TaskListHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  groupBy: string;
  onGroupByChange: (groupBy: string) => void;
  members?: Member[];
  userRole?: string;
  // Member-specific filters
  isMember?: boolean;
  filterType?: "my" | "status" | "dueDate";
  onFilterTypeChange?: (filterType: "my" | "status" | "dueDate") => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  dueDateFilter?: "overdue" | "today" | "week" | "all";
  onDueDateFilterChange?: (filter: "overdue" | "today" | "week" | "all") => void;
  // PM-specific filters (multi-select)
  selectedMemberIds?: string[];
  onMemberIdsChange?: (memberIds: string[]) => void;
  selectedStatuses?: string[];
  onStatusesChange?: (statuses: string[]) => void;
  dateRangeStart?: string;
  onDateRangeStartChange?: (date: string) => void;
  dateRangeEnd?: string;
  onDateRangeEndChange?: (date: string) => void;
  // Quick presets
  quickFilter?: "all" | "overdue" | "readyToReview" | null;
  onQuickFilterChange?: (filter: "all" | "overdue" | "readyToReview" | null) => void;
}

export const TaskListHeader = ({ 
  searchQuery, 
  onSearchChange, 
  groupBy, 
  onGroupByChange,
  members = [],
  userRole,
  isMember = false,
  filterType = "my",
  onFilterTypeChange,
  statusFilter = "all",
  onStatusFilterChange,
  dueDateFilter = "all",
  onDueDateFilterChange,
  // PM filters
  selectedMemberIds = [],
  onMemberIdsChange,
  selectedStatuses = [],
  onStatusesChange,
  dateRangeStart = "",
  onDateRangeStartChange,
  dateRangeEnd = "",
  onDateRangeEndChange,
  quickFilter = null,
  onQuickFilterChange
}: TaskListHeaderProps) => {
  // Generate initials from member name
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Check if user is Member role
  const isMemberRole = userRole === 'Member' || userRole === 'member';
  
  // Ref for dropdown
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        dropdownRef.current.open = false;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle member selection
  const toggleMemberSelection = (memberId: string) => {
    if (!onMemberIdsChange) return;
    if (selectedMemberIds.includes(memberId)) {
      onMemberIdsChange(selectedMemberIds.filter(id => id !== memberId));
    } else {
      onMemberIdsChange([...selectedMemberIds, memberId]);
    }
  };
  
  // Toggle status selection
  const toggleStatusSelection = (status: string) => {
    if (!onStatusesChange) return;
    if (selectedStatuses.includes(status)) {
      onStatusesChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusesChange([...selectedStatuses, status]);
    }
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    onMemberIdsChange?.([]);
    onStatusesChange?.([]);
    onDateRangeStartChange?.("");
    onDateRangeEndChange?.("");
    onQuickFilterChange?.(null);
  };
  
  const hasActiveFilters = selectedMemberIds.length > 0 || selectedStatuses.length > 0 || 
                          dateRangeStart || dateRangeEnd || quickFilter;

  return (
    <div className="task-list-header">
      <div className="header-left">
        <div className="search-container">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="search-icon">
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        
        {/* Show filters for members, advanced filters for PM/BO */}
        {isMember ? (
          <div className="member-filters">
            <select 
              value={filterType} 
              onChange={(e) => onFilterTypeChange?.(e.target.value as any)}
              className="filter-select"
            >
              <option value="my">My Tasks</option>
              <option value="status">By Status</option>
              <option value="dueDate">By Due Date</option>
            </select>
            
            {filterType === "status" && (
              <select 
                value={statusFilter} 
                onChange={(e) => onStatusFilterChange?.(e.target.value)}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="Todo">Todo</option>
                <option value="InProgress">In Progress</option>
                <option value="ReadyToReview">Ready to Review</option>
                <option value="ReOpened">Re-Opened</option>
                <option value="Done">Done</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            )}
            
            {filterType === "dueDate" && (
              <select 
                value={dueDateFilter} 
                onChange={(e) => onDueDateFilterChange?.(e.target.value as any)}
                className="filter-select"
              >
                <option value="all">All Dates</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due Today</option>
                <option value="week">Due This Week</option>
              </select>
            )}
          </div>
        ) : (
          <div className="group-dropdown">
            <select 
              value={groupBy} 
              onChange={(e) => onGroupByChange(e.target.value)}
              className="group-select"
            >
              <option value="none">No grouping</option>
              <option value="status">Group by Status</option>
              <option value="assignee">Group by Assignee</option>
              <option value="milestone">Group by Milestone</option>
            </select>
          </div>
        )}
      </div>

      <div className="header-right">
        {!isMemberRole && (
          <details ref={dropdownRef} className="pm-filters-dropdown">
            <summary className="filters-toggle-btn">
              <Filter size={16} />
              Filters 
              {hasActiveFilters && <span className="filter-badge">{
                (selectedMemberIds.length > 0 ? 1 : 0) +
                (selectedStatuses.length > 0 ? 1 : 0) +
                (dateRangeStart || dateRangeEnd ? 1 : 0) +
                (quickFilter && quickFilter !== 'all' ? 1 : 0)
              }</span>}
            </summary>
            
            <div className="pm-filters-panel">
              {/* Quick Preset Filters */}
              <div className="filter-section">
                <div className="filter-section-title">Quick Filters</div>
                <div className="quick-filters">
                  <button
                    className={`quick-filter-btn ${quickFilter === null ? 'active' : ''}`}
                    onClick={() => onQuickFilterChange?.(null)}
                  >
                    All Tasks
                  </button>
                  <button
                    className={`quick-filter-btn ${quickFilter === 'overdue' ? 'active' : ''}`}
                    onClick={() => onQuickFilterChange?.('overdue')}
                  >
                    <AlertCircle size={14} />
                    Overdue
                  </button>
                  <button
                    className={`quick-filter-btn ${quickFilter === 'readyToReview' ? 'active' : ''}`}
                    onClick={() => onQuickFilterChange?.('readyToReview')}
                  >
                    <CheckCircle2 size={14} />
                    Ready to Review
                  </button>
                </div>
              </div>

              {/* Members Multi-Select */}
              <div className="filter-section">
                <div className="filter-section-title">
                  Members {selectedMemberIds.length > 0 && <span className="count-badge">({selectedMemberIds.length})</span>}
                </div>
                <div className="filter-checkboxes">
                  {members
                    .filter((member) => member.role === 'Member' || member.role === 'member')
                    .map((member) => (
                      <label key={member.id} className="filter-checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.includes(member.id)}
                          onChange={() => toggleMemberSelection(member.id)}
                        />
                        <span>{member.name}</span>
                      </label>
                    ))}
                </div>
              </div>
              
              {/* Status Multi-Select */}
              <div className="filter-section">
                <div className="filter-section-title">
                  Status {selectedStatuses.length > 0 && <span className="count-badge">({selectedStatuses.length})</span>}
                </div>
                <div className="filter-checkboxes">
                  {['Todo', 'InProgress', 'ReadyToReview', 'ReOpened', 'Done', 'Cancelled'].map((status) => (
                    <label key={status} className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={() => toggleStatusSelection(status)}
                      />
                      <span>{status.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Date Range */}
              <div className="filter-section">
                <div className="filter-section-title">
                  <Calendar size={14} />
                  Due Date Range
                </div>
                <div className="date-range-filter">
                  <input
                    type="date"
                    className="date-input"
                    value={dateRangeStart}
                    onChange={(e) => onDateRangeStartChange?.(e.target.value)}
                    placeholder="Start date"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    className="date-input"
                    value={dateRangeEnd}
                    onChange={(e) => onDateRangeEndChange?.(e.target.value)}
                    placeholder="End date"
                  />
                </div>
              </div>
              
              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="filter-actions">
                  <button className="clear-filters-btn" onClick={clearAllFilters}>
                    <X size={16} />
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};
