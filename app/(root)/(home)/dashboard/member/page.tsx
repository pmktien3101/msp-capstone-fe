"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Project } from "@/types/project";
import { MemberTaskCard } from "@/components/tasks/MemberTaskCard";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { meetingService } from "@/services/meetingService";
import {
  getProjectStatusLabel,
  getProjectStatusColor,
} from "@/constants/status";
import {
  CheckCircle,
  Layers,
  Clock,
  FolderOpen,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Users,
  Video,
  Calendar,
  ArrowRight,
  Briefcase,
} from "lucide-react";
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
        const projects: Project[] =
          projRes.success && projRes.data ? projRes.data.items : [];

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
          project:
            (projects.find((p) => p.id === t.projectId) as any)?.name ||
            t.projectId,
          status: t.status,
          dueDate: t.endDate || t.startDate,
          priority: (t.priority as any) || undefined,
        }));

        if (mounted) setMyTasks(cleanedTasks);

        // 3. For meetings, fetch meetings for each project and pick upcoming ones
        const meetingPromises = projects.map((p) =>
          meetingService.getMeetingsByProjectId(p.id)
        );
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
            if (status === "finished" || status === "cancel") return false;

            // Filter meetings where current user is an attendee
            const isAttendee = m.attendees?.some(
              (a: any) => a.id === userId || a.email === email
            );
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
                ? `${start.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} - ${end.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : start.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
              location: m.recordUrl || m.projectName || "Online",
              attendees: (m.attendees || []).map(
                (a: any) => a.fullName || a.email || a.id
              ),
            };
          })
          .filter((m) => new Date(m.date) >= now)
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

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
      task.dueDate &&
      new Date(task.dueDate) < now &&
      !(task.status === "Done" || task.status === "Cancelled")
  ).length;

  // Get current hour for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="member-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your workspace...</p>
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
            <span className="greeting-text">{getGreeting()}</span>
            <h1>{fullName}</h1>
            <p>Here's what's happening with your projects today</p>
          </div>
          <button
            className="view-all-projects-btn"
            onClick={() => router.push("/projects")}
          >
            <Briefcase size={18} />
            <span>All Projects</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card completed">
          <div className="stat-icon">
            <CheckCircle size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{completedTasks}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-decoration"></div>
        </div>

        <div className="stat-card in-progress">
          <div className="stat-icon">
            <Layers size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{inProgressTasks}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-decoration"></div>
        </div>

        <div className="stat-card overdue">
          <div className="stat-icon">
            <Clock size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{overdueTasks}</div>
            <div className="stat-label">Overdue</div>
          </div>
          <div className="stat-decoration"></div>
        </div>

        <div className="stat-card projects">
          <div className="stat-icon">
            <FolderOpen size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{assignedProjects.length}</div>
            <div className="stat-label">Projects</div>
          </div>
          <div className="stat-decoration"></div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* My Tasks */}
        <div className="content-card tasks-card">
          <div className="card-header">
            <div className="header-left">
              <div className="header-icon">
                <Layers size={18} />
              </div>
              <h3>My Tasks</h3>
            </div>
            <span className="badge">{totalTasks}</span>
          </div>
          <div className="card-content">
            {myTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <CheckCircle size={40} />
                </div>
                <p>No tasks assigned yet</p>
                <span>Tasks will appear here once assigned</span>
              </div>
            ) : (
              <div className="tasks-list">
                {(showAllTasks ? myTasks : myTasks.slice(0, 4)).map(
                  (task, index) => (
                    <MemberTaskCard key={task.id} task={task} index={index} />
                  )
                )}
                {myTasks.length > 4 && !showAllTasks && (
                  <div className="view-more">
                    <button
                      className="view-more-button"
                      onClick={() => setShowAllTasks(true)}
                    >
                      <span>Show {myTasks.length - 4} more</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
                {showAllTasks && myTasks.length > 4 && (
                  <div className="view-more">
                    <button
                      className="view-less-button"
                      onClick={() => setShowAllTasks(false)}
                    >
                      <span>Show less</span>
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
          <div className="content-card projects-card">
            <div className="card-header">
              <div className="header-left">
                <div className="header-icon">
                  <Briefcase size={18} />
                </div>
                <h3>My Projects</h3>
              </div>
              <span className="badge">{assignedProjects.length}</span>
            </div>
            <div className="card-content">
              {assignedProjects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <FolderOpen size={40} />
                  </div>
                  <p>No projects yet</p>
                  <span>You'll see projects here once assigned</span>
                </div>
              ) : (
                <div className="projects-list">
                  {assignedProjects.slice(0, 3).map((project) => (
                    <div
                      key={project.id}
                      className="project-item"
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(`/projects/${project.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          router.push(`/projects/${project.id}`);
                        }
                      }}
                    >
                      <div className="project-info">
                        <div className="project-name">{project.name}</div>
                        {project.endDate && (
                          <div className="project-deadline">
                            <Calendar size={12} />
                            <span>{formatDate(project.endDate)}</span>
                          </div>
                        )}
                      </div>
                      <div
                        className="project-status-badge"
                        style={{
                          background: getProjectStatusColor(project.status),
                        }}
                      >
                        {getProjectStatusLabel(project.status)}
                      </div>
                    </div>
                  ))}
                  {assignedProjects.length > 3 && (
                    <div className="view-more">
                      <button
                        className="view-more-button"
                        onClick={() => router.push("/projects")}
                      >
                        <span>View all projects</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="content-card meetings-card">
            <div className="card-header">
              <div className="header-left">
                <div className="header-icon">
                  <Video size={18} />
                </div>
                <h3>Upcoming Meetings</h3>
              </div>
              <span className="badge">{upcomingMeetings.length}</span>
            </div>
            <div className="card-content">
              {upcomingMeetings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Calendar size={40} />
                  </div>
                  <p>No upcoming meetings</p>
                  <span>Your schedule is clear</span>
                </div>
              ) : (
                <div className="meetings-list">
                  {upcomingMeetings.slice(0, 3).map((meeting) => (
                    <div
                      key={meeting.id}
                      className="meeting-item"
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(`/meeting/${meeting.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          router.push(`/meeting/${meeting.id}`);
                      }}
                    >
                      <div className="meeting-left">
                        <div className="meeting-date-box">
                          <span className="day">
                            {new Date(meeting.date).getDate()}
                          </span>
                          <span className="month">
                            {new Date(meeting.date).toLocaleString("en-US", {
                              month: "short",
                            })}
                          </span>
                        </div>
                        <div className="meeting-info">
                          <h4 className="meeting-title">{meeting.title}</h4>
                          <div className="meeting-meta">
                            <span className="meeting-time">
                              <Clock size={12} />
                              {meeting.time}
                            </span>
                            <span className="meeting-attendees">
                              <Users size={12} />
                              {meeting.attendees.length}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        className="join-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/meeting/${meeting.id}`);
                        }}
                      >
                        <Video size={14} />
                        <span>Join</span>
                      </button>
                    </div>
                  ))}

                  {upcomingMeetings.length > 3 && (
                    <div className="view-more">
                      <button
                        className="view-more-button"
                        onClick={() => router.push("/calendar")}
                      >
                        <span>View all meetings</span>
                        <ArrowRight size={14} />
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
