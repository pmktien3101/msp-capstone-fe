import { api } from './api';
import type { LoginCredentials, RegisterData } from '@/types';
import { clearAllAuthData } from '@/lib/auth';

export const authService = {
    async login(credentials: LoginCredentials) {
        const response = await api.post('/auth/login', credentials);
        console.log('Login response:', response.data);
        return response.data.data;
    },

    async register(data: RegisterData) {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    async logout() {
        try {
            // Use utility function to clear all auth data
            clearAllAuthData();
            
            console.log('All user data cleared from storage');
            return { success: true, message: 'Logged out successfully' };
        } catch (error) {
            console.error('Error during logout:', error);
            return { success: false, message: 'Logout failed' };
        }
    },

    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data;
    }
};
