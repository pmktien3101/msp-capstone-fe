"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Users,
  MapPin,
  ArrowRight,
  Phone,
} from "lucide-react";
import { DetailTaskModal } from "@/components/tasks/DetailTaskModal";
import { meetingService } from "@/services/meetingService";
import { projectService } from "@/services/projectService";
import { useUser } from "@/hooks/useUser";
import type { MeetingItem } from "@/types/meeting";
import "@/app/styles/calendar.scss";

interface CalendarEvent {
  id: string;
  title: string;
  type: "meeting";
  startTime: string;
  endTime?: string;
  date: string;
  description?: string;
  location?: string;
  attendees?: string[];
  status?: string;
  projectName?: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch meetings from API
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Get user's projects
        const projectsResult = await projectService.getProjectsByMemberId(userId);
        if (!projectsResult.success || !projectsResult.data) {
          setEvents([]);
          setLoading(false);
          return;
        }

        const projects = projectsResult.data.items || [];

        // Fetch meetings for all projects
        const meetingPromises = projects.map((project) =>
          meetingService.getMeetingsByProjectId(project.id)
        );

        const meetingResults = await Promise.all(meetingPromises);

        // Transform meetings to calendar events
        const allMeetings: CalendarEvent[] = [];
        meetingResults.forEach((result, index) => {
          if (result.success && result.data) {
            result.data.forEach((meeting: MeetingItem) => {
              if (meeting.startTime) {
                const startDate = new Date(meeting.startTime);
                const endDate = meeting.endTime ? new Date(meeting.endTime) : undefined;

                allMeetings.push({
                  id: meeting.id,
                  title: meeting.title,
                  type: "meeting",
                  startTime: startDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  endTime: endDate
                    ? endDate.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : undefined,
                  date: startDate.toISOString().split("T")[0],
                  description: meeting.description || "",
                  location: meeting.recordUrl || meeting.projectName || "Online",
                  attendees: meeting.attendees?.map((a) => a.fullName || a.email) || [],
                  status: meeting.status,
                  projectName: meeting.projectName || projects[index]?.name,
                });
              }
            });
          }
        });

        setEvents(allMeetings);
      } catch (error) {
        console.error("Error fetching meetings:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [userId]);

  // Filter events for current month
  const getCurrentMonthEvents = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear
      );
    });
  };

  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    setFilteredEvents(getCurrentMonthEvents());
  }, [currentDate, events]);

  // Handle query parameter for specific date
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const targetDate = new Date(dateParam);
      if (!isNaN(targetDate.getTime())) {
        setSelectedDate(targetDate);
        setCurrentDate(targetDate);
      }
    }
  }, [searchParams]);

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
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    return filteredEvents.filter((event) => event.date === dateString);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const handleEventCardClick = (event: CalendarEvent) => {
    if (event.type === "meeting") {
      router.push(`/meeting/${event.id}`);
    }
  };

  const handleJoinMeeting = (meetingId: string) => {
    router.push(`/meeting/${meetingId}`);
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = getEventsForDate(selectedDate);
  const displayedEvents = showAllEvents
    ? selectedDateEvents
    : selectedDateEvents.slice(0, 3);

  if (loading) {
    return (
      <div className="calendar-page">
        <div className="calendar-header">
          <div className="header-content">
            <div className="title-section">
              <h1>Meeting Calendar</h1>
              <p>Loading meetings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      {/* Header */}
      <div className="calendar-header">
        <div className="header-content">
          <div className="title-section">
            <h1>Meeting Calendar</h1>
            <p>Your schedule, all your meetings in one place</p>
          </div>
        </div>
      </div>

      <div className="calendar-container">
        {/* Calendar */}
        <div className="calendar-section">
          <div className="calendar-header-nav">
            <button className="nav-btn" onClick={() => navigateMonth("prev")}>
              <ChevronLeft size={20} />
            </button>
            <h2 className="month-year">{formatDate(currentDate)}</h2>
            <button className="nav-btn" onClick={() => navigateMonth("next")}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="calendar-grid">
            {/* Day headers */}
            <div className="day-headers">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="day-header">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="calendar-days">
              {days.map((day, index) => {
                if (!day) {
                  return (
                    <div key={`empty-${index}`} className="empty-day"></div>
                  );
                }

                const dayEvents = getEventsForDate(day);
                const isToday =
                  day.toDateString() === new Date().toDateString();
                const isSelected =
                  day.toDateString() === selectedDate.toDateString();

                return (
                  <div
                    key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                    className={`calendar-day ${isToday ? "today" : ""} ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedDate(day);
                      setShowAllEvents(false);
                    }}
                  >
                    <span className="day-number">{day.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <div className="day-events">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`event-dot ${event.type}`}
                            title={event.title}
                          ></div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="more-events">
                            +{dayEvents.length - 3}
                          </div>
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
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <span className="events-count">
              {selectedDateEvents.length} {selectedDateEvents.length === 1 ? "meeting" : "meetings"}
            </span>
          </div>

          <div className="events-list">
            {selectedDateEvents.length === 0 ? (
              <div className="empty-events">
                <Calendar size={48} />
                <p>No meetings</p>
                <span>You have no meetings scheduled for this day</span>
              </div>
            ) : (
              <>
                {displayedEvents.map((event) => (
                  <div key={event.id} className="event-card" onClick={() => handleEventCardClick(event)}>
                    <div className="event-header">
                      <div className="event-type">
                        <div className={`type-icon ${event.type}`}>
                          <Users size={16} />
                        </div>
                        <span className="type-label">Meeting</span>
                      </div>
                      {event.status && (
                        <div
                          className="priority-badge"
                          style={{
                            backgroundColor:
                              event.status === "Scheduled"
                                ? "#3b82f6"
                                : event.status === "Ongoing"
                                ? "#10b981"
                                : "#6b7280",
                          }}
                        >
                          {event.status}
                        </div>
                      )}
                    </div>

                    <div className="event-content">
                      <h4 className="event-title">{event.title}</h4>
                      {event.description && (
                        <p className="event-description">{event.description}</p>
                      )}
                      {event.projectName && (
                        <p className="event-project">
                          <span style={{ color: "#ff5e13", fontWeight: 600 }}>Project:</span> {event.projectName}
                        </p>
                      )}
                    </div>

                    <div className="event-details">
                      <div className="time-info">
                        <Clock size={14} />
                        <span>
                          {event.startTime}
                          {event.endTime && ` - ${event.endTime}`}
                        </span>
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
                          <span>{event.attendees.slice(0, 3).join(", ")}
                            {event.attendees.length > 3 && ` +${event.attendees.length - 3}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="event-action">
                      <button
                        className="action-btn meeting-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinMeeting(event.id);
                        }}
                      >
                        <span>Join Meeting</span>
                        <Phone size={16} />
                      </button>
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
                      <span>
                        View {selectedDateEvents.length - 3} more {selectedDateEvents.length - 3 === 1 ? "meeting" : "meetings"}
                      </span>
                      <ChevronDown size={16} />
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
                      <span>Collapse</span>
                      <ChevronUp size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
