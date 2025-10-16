import { api } from './api';
import type { 
    Project, 
    ProjectMember,
    ProjectMemberResponse,
    CreateProjectRequest,
    UpdateProjectRequest,
    CreateTaskRequest,
    UpdateTaskRequest,
    PagingRequest,
    PagingResponse
} from '@/types/project';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

export const projectService = {
    // Create new project
    async createProject(data: CreateProjectRequest): Promise<{ success: boolean; data?: Project; error?: string }> {
        try {
            const response = await api.post<ApiResponse<Project>>('/projects', data);
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to create project'
                };
            }
        } catch (error: any) {
            console.error('Create project error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to create project'
            };
        }
    },

    // Update project
    async updateProject(data: UpdateProjectRequest): Promise<{ success: boolean; data?: Project; error?: string }> {
        try {
            const response = await api.put<ApiResponse<Project>>('/projects', data);
            return {
                success: response.data.success,
                data: response.data.data,
                error: response.data.success ? undefined : response.data.message
            };
        } catch (error: any) {
            console.error('Update project error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to update project'
            };
        }
    },

    // Delete project
    async deleteProject(projectId: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await api.delete<ApiResponse>(`/projects/${projectId}`);
            return {
                success: response.data.success,
                message: response.data.message,
                error: response.data.success ? undefined : response.data.message
            };
        } catch (error: any) {
            console.error('Delete project error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to delete project'
            };
        }
    },

    // Get project by ID
    async getProjectById(projectId: string): Promise<{ success: boolean; data?: Project; error?: string }> {
        try {
            const response = await api.get<ApiResponse<Project>>(`/projects/${projectId}`);
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to fetch project'
                };
            }
        } catch (error: any) {
            console.error('Get project error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch project'
            };
        }
    },

    // Get all projects with paging
    async getAllProjects(params?: PagingRequest): Promise<{ success: boolean; data?: PagingResponse<Project>; error?: string }> {
        try {
            console.log('Calling GET /projects...');
            const response = await api.get<ApiResponse<any>>('/projects');
            console.log('Full response:', response);
            console.log('Response data:', response.data);
            console.log('Response data type:', typeof response.data);
            console.log('Response data.data:', response.data?.data);
            
            // Handle case where response.data is the actual data (not wrapped in ApiResponse)
            if (Array.isArray(response.data)) {
                console.log('Response is direct array (no wrapper)');
                return {
                    success: true,
                    data: {
                        items: response.data,
                        totalItems: response.data.length,
                        pageIndex: 0,
                        pageSize: response.data.length
                    }
                };
            }
            
            // Handle standard ApiResponse format
            if (response.data && response.data.success) {
                // Check if response is paginated or direct array
                if (response.data.data) {
                    // If it's already a PagingResponse
                    if (response.data.data.items && Array.isArray(response.data.data.items)) {
                        console.log('Response format: PagingResponse with items array');
                        return {
                            success: true,
                            data: response.data.data
                        };
                    }
                    // If it's a direct array
                    else if (Array.isArray(response.data.data)) {
                        console.log('Response format: Direct array, converting to PagingResponse');
                        return {
                            success: true,
                            data: {
                                items: response.data.data,
                                totalItems: response.data.data.length,
                                pageIndex: 0,
                                pageSize: response.data.data.length
                            }
                        };
                    }
                }
                console.error('Invalid response format:', response.data);
                return {
                    success: false,
                    error: 'Invalid response format from API'
                };
            } 
            
            // Handle error response
            if (response.data && !response.data.success) {
                console.error('API returned success: false', response.data);
                return {
                    success: false,
                    error: response.data.message || 'Failed to fetch projects'
                };
            }
            
            // Unknown format
            console.error('Unknown response format:', response);
            return {
                success: false,
                error: 'Unknown response format from API'
            };
        } catch (error: any) {
            console.error('Get all projects error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error message:', error.message);
            
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch projects'
            };
        }
    },

    // Get projects by manager ID
    async getProjectsByManagerId(managerId: string, params?: PagingRequest): Promise<{ success: boolean; data?: PagingResponse<Project>; error?: string }> {
        try {
            const response = await api.get<ApiResponse<PagingResponse<Project>>>(`/projects/by-manager/${managerId}`, { params });
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to fetch manager projects'
                };
            }
        } catch (error: any) {
            console.error('Get manager projects error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch manager projects'
            };
        }
    },

    // Get projects by Business Owner ID
    async getProjectsByBOId(boId: string, params?: PagingRequest): Promise<{ success: boolean; data?: PagingResponse<Project>; error?: string }> {
        try {
            const response = await api.get<ApiResponse<PagingResponse<Project>>>(`/projects/by-bo/${boId}`, { params });
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to fetch BO projects'
                };
            }
        } catch (error: any) {
            console.error('Get BO projects error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch BO projects'
            };
        }
    },

    // Add project member
    async addProjectMember(projectId: string, userId: string): Promise<{ success: boolean; data?: ProjectMember; error?: string }> {
        try {
            console.log('addProjectMember - Request:', { projectId, userId });
            const response = await api.post<ApiResponse<ProjectMember>>('/projects/project-member', { projectId, userId });
            console.log('addProjectMember - Response:', response.data);
            return {
                success: response.data.success,
                data: response.data.data,
                error: response.data.success ? undefined : response.data.message
            };
        } catch (error: any) {
            console.error('Add project member error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to add project member'
            };
        }
    },

    // Remove project member
    async removeProjectMember(pmId: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await api.delete<ApiResponse>(`/projects/project-member/${pmId}`);
            return {
                success: response.data.success,
                message: response.data.message,
                error: response.data.success ? undefined : response.data.message
            };
        } catch (error: any) {
            console.error('Remove project member error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to remove project member'
            };
        }
    },

    // Get project members
    async getProjectMembers(projectId: string): Promise<{ success: boolean; data?: ProjectMember[]; error?: string }> {
        try {
            const response = await api.get<ApiResponse<ProjectMember[]>>(`/projects/project-member/${projectId}`);
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to fetch project members'
                };
            }
        } catch (error: any) {
            console.log('Get project members error:', error.response?.status, error.response?.data);
            
            // Handle 400/404 as empty result (no members found) - giống taskService
            if (error.response?.status === 400 || error.response?.status === 404) {
                console.log('No members found for project, returning empty array');
                return {
                    success: true,
                    data: []
                };
            }
            
            console.error('Get project members error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch project members'
            };
        }
    },

};
