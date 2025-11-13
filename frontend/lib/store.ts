import { create } from 'zustand';
import api from './api';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  tenant_id?: number;
  tenant?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/login', { email, password });
      const { user, token } = response.data;
      localStorage.setItem('auth_token', token);
      set({ user, token, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data: any) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/register', data);
      const { user, token } = response.data;
      localStorage.setItem('auth_token', token);
      set({ user, token, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/me');
      set({ user: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      localStorage.removeItem('auth_token');
      set({ user: null, token: null });
    }
  },
}));

