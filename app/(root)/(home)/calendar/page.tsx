'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, MapPin, Plus } from 'lucide-react';

interface CalendarEvent {
    id: string;
    title: string;
    type: 'task' | 'meeting';
    startTime: string;
    endTime?: string;
    date: string;
    description?: string;
    location?: string;
    attendees?: string[];
    priority?: 'high' | 'medium' | 'low';
    status?: 'pending' | 'in-progress' | 'completed';
}

export default function CalendarPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current date
    const [showAllEvents, setShowAllEvents] = useState(false);
    // Mock data for calendar events
    const mockEvents: CalendarEvent[] = [
        // Ngày 15/09/2025 - Nhiều sự kiện
        {
            id: '1',
            title: 'Payment Gateway Integration',
            type: 'task',
            startTime: '09:00',
            endTime: '12:00',
            date: '2025-09-15',
            description: 'Implement payment gateway for e-commerce platform with Stripe integration',
            priority: 'high',
            status: 'in-progress'
        },
        {
            id: '2',
            title: 'Team Standup Meeting',
            type: 'meeting',
            startTime: '09:30',
            endTime: '10:00',
            date: '2025-09-15',
            description: 'Daily standup with development team to discuss progress and blockers',
            location: 'Meeting Room A',
            attendees: ['John Doe', 'Alice Johnson', 'Member', 'Sarah Wilson']
        },
        {
            id: '3',
            title: 'Backend API Development',
            type: 'task',
            startTime: '14:00',
            endTime: '17:00',
            date: '2025-09-15',
            description: 'Develop REST API endpoints for user authentication and data management',
            priority: 'medium',
            status: 'pending'
        },
        {
            id: '4',
            title: 'Client Demo Preparation',
            type: 'task',
            startTime: '17:30',
            endTime: '19:00',
            date: '2025-09-15',
            description: 'Prepare demo materials and presentation for client meeting tomorrow',
            priority: 'high',
            status: 'pending'
        },
        {
            id: '5',
            title: 'Database Optimization',
            type: 'task',
            startTime: '20:00',
            endTime: '22:00',
            date: '2025-09-15',
            description: 'Optimize database queries and improve performance',
            priority: 'low',
            status: 'completed'
        },

        // Ngày 16/01/2025 - Mix tasks và meetings
        {
            id: '6',
            title: 'Project Review Meeting',
            type: 'meeting',
            startTime: '09:00',
            endTime: '10:30',
            date: '2025-09-16',
            description: 'Monthly project review with stakeholders and progress assessment',
            location: 'Conference Room B',
            attendees: ['PM John', 'Business Owner', 'Member', 'Tech Lead']
        },
        {
            id: '7',
            title: 'Dashboard Design',
            type: 'task',
            startTime: '11:00',
            endTime: '15:00',
            date: '2025-09-16',
            description: 'Design new dashboard interface with modern UI components and responsive layout',
            priority: 'high',
            status: 'in-progress'
        },
        {
            id: '8',
            title: 'Client Presentation',
            type: 'meeting',
            startTime: '15:30',
            endTime: '17:00',
            date: '2025-09-16',
            description: 'Present project progress and demo new features to client',
            location: 'Client Office - Floor 15',
            attendees: ['PM John', 'Member', 'Client Team']
        },
        {
            id: '9',
            title: 'Bug Fixes & Testing',
            type: 'task',
            startTime: '17:30',
            endTime: '19:30',
            date: '2025-09-16',
            description: 'Fix critical bugs found during testing and perform regression testing',
            priority: 'high',
            status: 'pending'
        },

        // Ngày 17/01/2025 - Focus on development
        {
            id: '10',
            title: 'Code Review Session',
            type: 'meeting',
            startTime: '10:00',
            endTime: '11:30',
            date: '2025-09-17',
            description: 'Review recent code changes and discuss best practices',
            location: 'Online - Zoom',
            attendees: ['Senior Dev', 'Member', 'Code Reviewer']
        },
        {
            id: '11',
            title: 'Frontend Development',
            type: 'task',
            startTime: '13:00',
            endTime: '17:00',
            date: '2025-09-17',
            description: 'Implement new frontend components using React and TypeScript',
            priority: 'medium',
            status: 'in-progress'
        },
        {
            id: '12',
            title: 'Documentation Update',
            type: 'task',
            startTime: '17:30',
            endTime: '19:00',
            date: '2025-09-17',
            description: 'Update project documentation and API documentation',
            priority: 'low',
            status: 'completed'
        },

        // Ngày 18/09/2025 - Weekend work
        {
            id: '13',
            title: 'Weekend Sprint Planning',
            type: 'meeting',
            startTime: '10:00',
            endTime: '12:00',
            date: '2025-09-18',
            description: 'Plan next sprint goals and assign tasks to team members',
            location: 'Online - Teams',
            attendees: ['PM John', 'All Developers', 'QA Team']
        },
        {
            id: '14',
            title: 'Performance Testing',
            type: 'task',
            startTime: '14:00',
            endTime: '18:00',
            date: '2025-09-18',
            description: 'Conduct performance testing and load testing on the application',
            priority: 'high',
            status: 'pending'
        },

        // Ngày 19/09/2025 - Current date events
        {
            id: '18',
            title: 'Daily Standup Meeting',
            type: 'meeting',
            startTime: '09:00',
            endTime: '09:30',
            date: '2025-09-19',
            description: 'Daily standup meeting with the development team',
            location: 'Meeting Room A',
            attendees: ['John Doe', 'Alice Johnson', 'Member', 'Sarah Wilson']
        },
        {
            id: '19',
            title: 'Code Review Session',
            type: 'task',
            startTime: '14:00',
            endTime: '16:00',
            date: '2025-09-19',
            description: 'Review recent code changes and provide feedback',
            priority: 'high',
            status: 'in-progress'
        },
        {
            id: '20',
            title: 'Project Planning Meeting',
            type: 'meeting',
            startTime: '16:30',
            endTime: '17:30',
            date: '2025-09-19',
            description: 'Plan upcoming project milestones and tasks',
            location: 'Conference Room B',
            attendees: ['PM John', 'Member', 'Tech Lead']
        },

        // Ngày 20/01/2025 - Start of new week
        {
            id: '15',
            title: 'Weekly Team Meeting',
            type: 'meeting',
            startTime: '09:00',
            endTime: '10:00',
            date: '2025-09-20',
            description: 'Weekly team meeting to discuss goals and upcoming tasks',
            location: 'Main Conference Room',
            attendees: ['All Team Members']
        },
        {
            id: '16',
            title: 'Security Audit',
            type: 'task',
            startTime: '11:00',
            endTime: '16:00',
            date: '2025-09-20',
            description: 'Conduct security audit and vulnerability assessment',
            priority: 'high',
            status: 'in-progress'
        },
        {
            id: '17',
            title: 'Deployment Preparation',
            type: 'task',
            startTime: '16:30',
            endTime: '18:00',
            date: '2025-09-20',
            description: 'Prepare application for production deployment',
            priority: 'medium',
            status: 'pending'
        }
    ];

    // Initialize events for current month
    const getCurrentMonthEvents = () => {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        return mockEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
        });
    };

    const [events, setEvents] = useState<CalendarEvent[]>(getCurrentMonthEvents());

    useEffect(() => {
        // Filter events for current month when currentDate changes
        const filteredEvents = getCurrentMonthEvents();
        setEvents(filteredEvents);
    }, [currentDate]);

    // Handle query parameter for specific date
    useEffect(() => {
        const dateParam = searchParams.get('date');
        if (dateParam) {
            const targetDate = new Date(dateParam);
            if (!isNaN(targetDate.getTime())) {
                setSelectedDate(targetDate);
                // Also update currentDate to show the correct month
                setCurrentDate(targetDate);
            }
        } else {
            // Default to current date if no date parameter
            setSelectedDate(new Date());
        }
    }, [searchParams]);

    // Force re-render when events are loaded to ensure selectedDateEvents updates
    useEffect(() => {
        if (events.length > 0) {
            // This will trigger a re-render and update selectedDateEvents
            setSelectedDate(prev => new Date(prev.getTime()));
        }
    }, [events]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getEventsForDate = (date: Date) => {
        // Normalize date to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        return events.filter(event => event.date === dateString);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long'
        });
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high':
                return '#ef4444';
            case 'medium':
                return '#f59e0b';
            case 'low':
                return '#10b981';
            default:
                return '#6b7280';
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'completed':
                return '#10b981';
            case 'in-progress':
                return '#3b82f6';
            case 'pending':
                return '#f59e0b';
            default:
                return '#6b7280';
        }
    };

    const getStatusText = (status?: string) => {
        switch (status) {
            case 'completed':
                return 'Hoàn thành';
            case 'in-progress':
                return 'Đang thực hiện';
            case 'pending':
                return 'Chờ thực hiện';
            default:
                return '';
        }
    };

    const handleTaskDetail = (taskId: string) => {
        // Navigate to task detail page
        // window.open(`/tasks/${taskId}`, '_blank');
        alert(`Xem chi tiết công việc: ${taskId}`);
    };

    const handleJoinMeeting = (meetingId: string) => {
        // Handle meeting join logic
        const meeting = events.find(event => event.id === meetingId);
        if (meeting) {
            if (meeting.location?.includes('Online')) {
                // For online meetings, show join link
                alert(`Tham gia cuộc họp: ${meeting.title}\nThời gian: ${meeting.startTime} - ${meeting.endTime}\nĐịa điểm: ${meeting.location}`);
            } else {
                // For physical meetings, show location info
                alert(`Tham gia cuộc họp: ${meeting.title}\nThời gian: ${meeting.startTime} - ${meeting.endTime}\nĐịa điểm: ${meeting.location}`);
            }
        }
    };

    const days = getDaysInMonth(currentDate);
    // Default to current date events, only change when user clicks a different date
    const selectedDateEvents = getEventsForDate(selectedDate);
    const displayedEvents = showAllEvents ? selectedDateEvents : selectedDateEvents.slice(0, 3);

    return (
        <div className="calendar-page">
            {/* Header */}
            <div className="calendar-header">
                <div className="header-content">
                    <div className="title-section">
                        <h1>Lịch làm việc</h1>
                        <p>Quản lý công việc và cuộc họp của bạn</p>
                    </div>
                </div>
            </div>

            <div className="calendar-container">
                {/* Calendar */}
                <div className="calendar-section">
                    <div className="calendar-header-nav">
                        <button
                            className="nav-btn"
                            onClick={() => navigateMonth('prev')}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="month-year">{formatDate(currentDate)}</h2>
                        <button
                            className="nav-btn"
                            onClick={() => navigateMonth('next')}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="calendar-grid">
                        {/* Day headers */}
                        <div className="day-headers">
                            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                                <div key={day} className="day-header">{day}</div>
                            ))}
                        </div>

                        {/* Calendar days */}
                        <div className="calendar-days">
                            {days.map((day, index) => {
                                if (!day) {
                                    return <div key={`empty-${index}`} className="empty-day"></div>;
                                }

                                const dayEvents = getEventsForDate(day);
                                const isToday = day.toDateString() === new Date().toDateString();
                                const isSelected = day.toDateString() === selectedDate.toDateString();

                                return (
                                    <div
                                        key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                                        className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedDate(day);
                                            setShowAllEvents(false); // Reset to show only 3 events
                                        }}
                                    >
                                        <span className="day-number">{day.getDate()}</span>
                                        {dayEvents.length > 0 && (
                                            <div className="day-events">
                                                {dayEvents.slice(0, 3).map(event => (
                                                    <div
                                                        key={event.id}
                                                        className={`event-dot ${event.type}`}
                                                        title={event.title}
                                                    ></div>
                                                ))}
                                                {dayEvents.length > 3 && (
                                                    <div className="more-events">+{dayEvents.length - 3}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Events Panel */}
                <div className="events-panel">
                    <div className="events-header">
                        <h3>
                            {selectedDate.toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </h3>
                        <span className="events-count">{selectedDateEvents.length} sự kiện</span>
                    </div>

                    <div className="events-list">
                        {selectedDateEvents.length === 0 ? (
                            <div className="empty-events">
                                <Calendar size={48} />
                                <p>Không có sự kiện nào</p>
                                <span>Hãy thêm công việc hoặc cuộc họp mới</span>
                            </div>
                        ) : (
                            <>
                                {displayedEvents.map(event => (
                                    <div key={event.id} className="event-card">
                                        <div className="event-header">
                                            <div className="event-type">
                                                <div className={`type-icon ${event.type}`}>
                                                    {event.type === 'task' ? <Calendar size={16} /> : <Users size={16} />}
                                                </div>
                                                <span className="type-label">
                                                    {event.type === 'task' ? 'Công việc' : 'Cuộc họp'}
                                                </span>
                                            </div>
                                            {event.priority && (
                                                <div
                                                    className="priority-badge"
                                                    style={{ backgroundColor: getPriorityColor(event.priority) }}
                                                >
                                                    {event.priority === 'high' ? 'Cao' :
                                                        event.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                                                </div>
                                            )}
                                        </div>

                                        <div className="event-content">
                                            <h4 className="event-title">{event.title}</h4>
                                            {event.description && (
                                                <p className="event-description">{event.description}</p>
                                            )}
                                        </div>

                                        <div className="event-details">
                                            <div className="time-info">
                                                <Clock size={14} />
                                                <span>{event.startTime}{event.endTime && ` - ${event.endTime}`}</span>
                                            </div>

                                            {event.location && (
                                                <div className="location-info">
                                                    <MapPin size={14} />
                                                    <span>{event.location}</span>
                                                </div>
                                            )}

                                            {event.attendees && event.attendees.length > 0 && (
                                                <div className="attendees-info">
                                                    <Users size={14} />
                                                    <span>{event.attendees.join(', ')}</span>
                                                </div>
                                            )}

                                            {event.status && (
                                                <div className="status-info">
                                                    <div
                                                        className="status-dot"
                                                        style={{ backgroundColor: getStatusColor(event.status) }}
                                                    ></div>
                                                    <span>{getStatusText(event.status)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <div className="event-action">
                                            {event.type === 'task' ? (
                                                <button
                                                    className="action-btn task-btn"
                                                    onClick={() => handleTaskDetail(event.id)}
                                                >
                                                    <span>Xem chi tiết</span>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <button
                                                    className="action-btn meeting-btn"
                                                    onClick={() => handleJoinMeeting(event.id)}
                                                >
                                                    <span>Tham gia</span>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                        <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.19 12.85C3.49997 10.2412 2.44824 7.27099 2.12 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.11 2H7.11C7.59531 1.99522 8.06679 2.16708 8.43376 2.48353C8.80073 2.79999 9.03996 3.23945 9.11 3.72C9.23662 4.68007 9.47144 5.62273 9.81 6.53C9.94454 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.36 8.64L8.09 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* View More Button */}
                                {selectedDateEvents.length > 3 && !showAllEvents && (
                                    <div className="view-more-events">
                                        <button
                                            className="view-more-btn"
                                            onClick={() => setShowAllEvents(true)}
                                        >
                                            <span>Xem thêm {selectedDateEvents.length - 3} sự kiện khác</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                {/* View Less Button */}
                                {showAllEvents && selectedDateEvents.length > 3 && (
                                    <div className="view-more-events">
                                        <button
                                            className="view-less-btn"
                                            onClick={() => setShowAllEvents(false)}
                                        >
                                            <span>Thu gọn</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .calendar-page {
          width: 100%;
          min-height: 100vh;
          background: #F9F4EE;
          padding: 24px;
        }

        .calendar-header {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }

        .title-section h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .title-section p {
          color: #6b7280;
          margin: 0;
          font-size: 16px;
        }

        .calendar-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .calendar-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .calendar-header-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .nav-btn {
          background: #f3f4f6;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-btn:hover {
          background: #e5e7eb;
          transform: scale(1.05);
        }

        .month-year {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .calendar-grid {
          width: 100%;
        }

        .day-headers {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          margin-bottom: 8px;
        }

        .day-header {
          text-align: center;
          padding: 12px 8px;
          font-weight: 600;
          color: #6b7280;
          font-size: 14px;
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
        }

        .calendar-day {
          aspect-ratio: 1;
          border: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
          position: relative;
        }

        .calendar-day:hover {
          background: #f9fafb;
        }

        .calendar-day.today {
          background: #fef3c7;
          border-color: #f59e0b;
        }

        .calendar-day.selected {
          background: #dbeafe;
          border-color: #3b82f6;
        }

        .day-number {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .day-events {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          justify-content: center;
          width: 100%;
        }

        .event-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .event-dot.task {
          background: #ff5e13;
        }

        .event-dot.meeting {
          background: #3b82f6;
        }

        .more-events {
          font-size: 10px;
          color: #6b7280;
          font-weight: 600;
        }

        .empty-day {
          aspect-ratio: 1;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .events-panel {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          height: fit-content;
        }

        .events-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .events-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .events-count {
          background: #f3f4f6;
          color: #6b7280;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .empty-events {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .empty-events svg {
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-events p {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .empty-events span {
          font-size: 14px;
          opacity: 0.8;
        }

        .event-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          transition: all 0.2s ease;
        }

        .event-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .event-type {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .type-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .type-icon.task {
          background: #ff5e13;
        }

        .type-icon.meeting {
          background: #3b82f6;
        }

        .type-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .priority-badge {
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .event-content {
          margin-bottom: 12px;
        }

        .event-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .event-description {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
          line-height: 1.4;
        }

        .event-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .time-info,
        .location-info,
        .attendees-info,
        .status-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6b7280;
        }

        .status-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .event-action {
          margin-top: 12px;
          display: flex;
          justify-content: flex-end;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .task-btn {
          background: linear-gradient(135deg, #ff5e13 0%, #ff7c3a 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(255, 94, 19, 0.3);
        }

        .task-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(255, 94, 19, 0.4);
          background: linear-gradient(135deg, #e55100 0%, #ff6b2b 100%);
        }

        .meeting-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .meeting-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        }

        .action-btn:active {
          transform: translateY(0);
        }

        .view-more-events {
          margin-top: 16px;
          text-align: center;
        }

        .view-more-btn,
        .view-less-btn {
          background: none;
          color: #3b82f6;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 auto;
          transition: all 0.2s ease;
          text-decoration: none;
          position: relative;
        }

        .view-more-btn:hover,
        .view-less-btn:hover {
          color: #1d4ed8;
        }

        .view-more-btn::after,
        .view-less-btn::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #3b82f6;
          transition: width 0.2s ease;
        }

        .view-more-btn:hover::after,
        .view-less-btn:hover::after {
          width: 100%;
        }

        @media (max-width: 768px) {
          .calendar-container {
            grid-template-columns: 1fr;
          }
          
          .header-content {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>
        </div>
    );
}
