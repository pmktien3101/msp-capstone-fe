"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Project } from "@/types/project";
import { MemberTaskCard } from "@/components/tasks/MemberTaskCard";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { meetingService } from "@/services/meetingService";
import { getProjectStatusLabel, getProjectStatusColor } from '@/constants/status';
import { CheckCircle, Layers, Clock, FolderOpen, ChevronRight, ChevronLeft, MapPin, Users, Phone } from 'lucide-react';
import "@/app/styles/member-dashboard.scss";
import { formatDate } from "@/lib/formatDate";

export default function MemberDashboardPage() {
  const router = useRouter();
  const { email, avatarUrl, fullName, userId } = useUser();
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllTasks, setShowAllTasks] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);

      try {
        // 1. Fetch projects where current user is a member

        if (!userId) {
          // No user yet, nothing to load
          if (mounted) setLoading(false);
          return;
        }

        const projRes = await projectService.getProjectsByMemberId(userId);
        const projects: Project[] = projRes.success && projRes.data ? projRes.data.items : [];

        if (mounted) setAssignedProjects(projects);

        // 2. For each project, fetch tasks assigned to this user (aggregate)
        const taskPromises = projects.map((p) =>
          taskService.getTasksByUserIdAndProjectId(userId, p.id)
        );

        const taskResults = await Promise.all(taskPromises);
        const aggregatedTasks: any[] = taskResults.reduce((acc, res) => {
          if (res.success && res.data && Array.isArray(res.data.items)) {
            return acc.concat(res.data.items);
          }
          return acc;
        }, [] as any[]);

        // Map tasks to a smaller UI-friendly shape so we don't store unnecessary fields
        const cleanedTasks = aggregatedTasks.map((t) => ({
          id: t.id,
          title: t.title,
          // find project name from fetched projects, fallback to projectId
          project: (projects.find((p) => p.id === t.projectId) as any)?.name || t.projectId,
          status: t.status,
          dueDate: t.endDate || t.startDate,
          priority: (t.priority as any) || undefined,
        }));

        if (mounted) setMyTasks(cleanedTasks);

        // 3. For meetings, fetch meetings for each project and pick upcoming ones
        const meetingPromises = projects.map((p) => meetingService.getMeetingsByProjectId(p.id));
        const meetingResults = await Promise.all(meetingPromises);
        const allMeetings: any[] = meetingResults.reduce((acc, res) => {
          if (res.success && Array.isArray(res.data)) {
            return acc.concat(res.data);
          }
          return acc;
        }, [] as any[]);

        // Map MeetingItem -> UI shape used by this page
        const now = new Date();
        const upcoming = allMeetings
          .filter((m) => {
            // Only show scheduled/ongoing meetings with valid startTime
            if (!m || !m.startTime) return false;
            const status = m.status?.toLowerCase();
            if (status === 'finished' || status === 'cancel') return false;
            
            // Filter meetings where current user is an attendee
            const isAttendee = m.attendees?.some((a: any) => a.id === userId || a.email === email);
            return isAttendee;
          })
          .map((m) => {
            const start = new Date(m.startTime);
            const end = m.endTime ? new Date(m.endTime) : undefined;
            return {
              id: m.id,
              title: m.title,
              date: start.toISOString(),
              time: end
                ? `${start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
                : start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
              location: m.recordUrl || m.projectName || "Online",
              attendees: (m.attendees || []).map((a: any) => a.fullName || a.email || a.id),
            };
          })
          .filter((m) => new Date(m.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (mounted) setUpcomingMeetings(upcoming);
      } catch (err) {
        console.error("Error loading member dashboard data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [userId]);

  // Calculate statistics
  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter(
    (task) => task.status === "Done"
  ).length;
  const inProgressTasks = myTasks.filter(
    (task) => task.status === "InProgress"
  ).length;
  const now = new Date();
  const overdueTasks = myTasks.filter(
    (task) =>
      task.dueDate && new Date(task.dueDate) < now &&
      !(task.status === "Done" || task.status === "Cancelled")
  ).length;

  if (loading) {
    return (
      <div className="member-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="member-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Welcome, {fullName}!</h1>
            <p>Here's an overview of your work</p>
          </div>
          <button
            className="view-all-projects-link"
            onClick={() => router.push("/projects")}
          >
            View All Projects
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)', color: '#fff' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12L11 14L15 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{completedTasks}</div>
            <div className="stat-label">Done</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)', color: '#fff' }}>
            <Layers size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{inProgressTasks}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)', color: '#fff' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{overdueTasks}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg,#ff7c3a 0%,#ff5e13 100%)', color: '#fff' }}>
            <FolderOpen size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{assignedProjects.length}</div>
            <div className="stat-label">Projects Joined</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* My Tasks */}
        <div className="content-card">
          <div className="card-header">
            <h3>Assigned Tasks</h3>
            <span className="task-count">{totalTasks} tasks</span>
          </div>
          <div className="card-content">
            {myTasks.length === 0 ? (
              <div className="empty-state">
                <p>You don't have any tasks yet</p>
              </div>
            ) : (
              <div className="tasks-list">
                {(showAllTasks ? myTasks : myTasks.slice(0, 3)).map(
                  (task, index) => (
                    <MemberTaskCard key={task.id} task={task} index={index} />
                  )
                )}
                {myTasks.length > 3 && !showAllTasks && (
                  <div className="view-more">
                    <button
                      className="view-more-button"
                      onClick={() => setShowAllTasks(true)}
                    >
                      <span>View {myTasks.length - 3} more tasks</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
                {showAllTasks && myTasks.length > 3 && (
                  <div className="view-more">
                    <button
                      className="view-less-button"
                      onClick={() => setShowAllTasks(false)}
                    >
                      <span>Collapse</span>
                      <ChevronLeft size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Projects and Meetings */}
        <div className="right-column">
          {/* Assigned Projects */}
          <div className="content-card">
            <div className="card-header">
              <h3>Recent Projects</h3>
              <span className="project-count">
                {assignedProjects.length} projects
              </span>
            </div>
            <div className="card-content">
              {assignedProjects.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't been assigned to any projects yet</p>
                </div>
              ) : (
                <div className="projects-list">
                  {assignedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="project-item"
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(`/projects/${project.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          router.push(`/projects/${project.id}`);
                        }
                      }}
                    >
                      <div className="project-left">
                        <div className="project-meta">
                          <div className="project-name">{project.name}</div>
                          {project.endDate && (
                            <div className="project-deadline">Due: {formatDate(project.endDate)}</div>
                          )}
                        </div>
                      </div>

                      <div className="project-actions">
                        <span className="project-status" style={{background: getProjectStatusColor(project.status)}}>
                          {getProjectStatusLabel(project.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="content-card">
            <div className="card-header">
              <h3>Upcoming Meetings</h3>
              <span className="meeting-count">
                {upcomingMeetings.length} meetings
              </span>
            </div>
            <div className="card-content">
              {upcomingMeetings.length === 0 ? (
                <div className="empty-state">
                  <p>You don't have any upcoming meetings</p>
                </div>
              ) : (
                <div className="meetings-list">
                  {upcomingMeetings.slice(0, 3).map((meeting, index) => (
                    <div
                      key={meeting.id}
                      className="meeting-item"
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(`/meetings/${meeting.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') router.push(`/meetings/${meeting.id}`);
                      }}
                    >
                      <div className="meeting-header">
                        <div className="meeting-type">
                          <div className={`type-icon`}>
                            <Phone size={16} />
                          </div>
                          <span className="type-label">Meeting</span>
                        </div>
                        <div className="meeting-date">
                          {formatDate(meeting.date)}
                        </div>
                      </div>

                      <div className="meeting-content">
                        <h4 className="meeting-title">{meeting.title}</h4>
                        <div className="meeting-details">
                          <div className="meeting-time">
                            <Clock size={14} />
                            <span>{meeting.time}</span>
                          </div>
                          <div className="meeting-location">
                            <MapPin size={14} />
                            <span>{meeting.location}</span>
                          </div>
                          <div className="meeting-attendees">
                            <Users size={14} />
                            <span>
                              {meeting.attendees.length} attendees
                            </span>
                          </div>
                        </div>

                        {/* Join Button */}
                        <div className="meeting-action">
                          <button
                            className="join-meeting-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (meeting.location?.includes("Online")) {
                                alert(
                                  `Join meeting: ${meeting.title}\nTime: ${meeting.time}\nLocation: ${meeting.location}`
                                );
                              } else {
                                alert(
                                  `Join meeting: ${meeting.title}\nTime: ${meeting.time}\nLocation: ${meeting.location}`
                                );
                              }
                            }}
                          >
                            <span>Join</span>
                            <Phone size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {upcomingMeetings.length > 3 && (
                    <div className="view-more">
                      <button
                        className="view-more-button"
                        onClick={() => router.push("/calendar")}
                      >
                        <span>View All Meetings</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
