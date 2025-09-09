import { api } from './api';
import type { LoginCredentials, RegisterData } from '@/types';

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
        localStorage.removeItem('accessToken');
    },

    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data;
    }
};
