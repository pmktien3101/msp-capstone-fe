"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { EditProjectModal } from "@/components/projects/modals/EditProjectModal";
import { CreateProjectModal } from "@/components/projects/modals/CreateProjectModal";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { useProjectModal } from "@/contexts/ProjectModalContext";
import { projectService } from "@/services/projectService";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/rbac";
import "@/app/styles/projects.scss";
import "@/app/styles/projects-table.scss";
import { Project } from "@/types/project";
import { toast } from "react-toastify";

const ProjectsPage = () => {
  const router = useRouter();
  const { isCreateModalOpen, closeCreateModal } = useProjectModal();
  const { user, isAuthenticated } = useAuth();
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const hasFetchedRef = useRef(false);

  const fetchProjects = async () => {
    if (!user?.userId || !user?.role) {
      setError("User information not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      let result;

      // Fetch projects based on user role
      if (
        user.role === UserRole.PROJECT_MANAGER ||
        user.role === "ProjectManager"
      ) {
        console.log(
          "[ProjectsPage] Fetching projects managed by ProjectManager:",
          user.userId
        );
        result = await projectService.getProjectsByManagerId(user.userId);
      } else if (user.role === UserRole.MEMBER || user.role === "Member") {
        console.log(
          "[ProjectsPage] Fetching projects where Member participates:",
          user.userId
        );
        result = await projectService.getProjectsByMemberId(user.userId);
      } else {
        console.log("[ProjectsPage] Unknown role, fetching all projects");
        result = await projectService.getAllProjects();
      }

      if (result.success && result.data) {
        console.log(
          "[ProjectsPage] Projects fetched successfully:",
          result.data.items.length,
          "projects"
        );
        setProjects(result.data.items);
      } else {
        console.error("[ProjectsPage] Failed to fetch projects:", result.error);
        setError(result.error || "Unable to load project list");
      }
    } catch (error: any) {
      console.error("[ProjectsPage] Fetch projects error:", error);
      setError(error.message || "An error occurred while loading projects");
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects only once when user is authenticated - runs ONLY ONCE
  useEffect(() => {
    if (isAuthenticated && user?.userId && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProjects();
    } else if (!isAuthenticated) {
      setLoading(false);
      setError("Please login to view projects");
    }
  }, [isAuthenticated, user?.userId]); // Only depend on user.userId (stable value), not entire user object

  // Handlers
  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowEditProjectModal(true);
  };

  const handleCloseEditProject = () => {
    setSelectedProject(null);
    setShowEditProjectModal(false);
  };

  const handleUpdateProject = async (updatedProjectData: any) => {
    if (!selectedProject) return;

    try {
      const result = await projectService.updateProject({
        id: selectedProject.id,
        name: updatedProjectData.name,
        description: updatedProjectData.description,
        status: updatedProjectData.status,
        startDate: updatedProjectData.startDate,
        endDate: updatedProjectData.endDate,
      });

      if (result.success && result.data) {
        // Update local state
        setProjects((prevProjects) =>
          prevProjects.map((project) =>
            project.id === selectedProject.id ? result.data! : project
          )
        );
        setShowEditProjectModal(false);
        setSelectedProject(null);
        toast.success("Project updated successfully!");
      } else {
        toast.error(result.error || "Unable to update project");
      }
    } catch (error) {
      console.error("Update project error:", error);
      toast.error("An error occurred while updating project");
    }
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleCreateProject = async (newProject: Project) => {
    console.log("New project created:", newProject);

    // Refresh projects list to get updated data from backend
    await fetchProjects();

    closeCreateModal();
  };

  const handleAddMeeting = (project: Project) => {
    // Navigate to meeting page or open meeting modal
    router.push(`/meeting/new?projectId=${project.id}`);
  };

  if (loading) {
    return (
      <div className="projects-page">
        <ProjectHeader />
        <div className="projects-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-page">
        <ProjectHeader />
        <div className="projects-content">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={fetchProjects} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <ProjectHeader />

      <div className="projects-content">
        <ProjectsTable
          projects={projects}
          onEditProject={handleEditProject}
          onAddMeeting={handleAddMeeting}
          onViewProject={handleViewProject}
        />
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onCreateProject={handleCreateProject}
      />

      {showEditProjectModal && selectedProject && (
        <EditProjectModal
          isOpen={showEditProjectModal}
          onClose={handleCloseEditProject}
          project={selectedProject}
          onUpdateProject={handleUpdateProject}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
