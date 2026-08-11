import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  allUsers: User[];
  demoUsers: User[];
  isLoading: boolean;
  register: (data: {
    email: string;
    username: string;
    fullName: string;
    password?: string;
    avatarUrl?: string;
    bio?: string;
  }) => Promise<User>;
  login: (emailOrUsername: string, password?: string) => Promise<User>;
  logout: () => void;
  switchUser: (userId: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  requireAuthAction: (action: Function) => (...args: any[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAuthData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [currentUser, userList] = await Promise.all([
        authService.getMe(),
        authService.getAllUsers(),
      ]);
      setUser(currentUser);
      setAllUsers(userList);
    } catch (err) {
      console.error('Failed to load user info:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthData();
  }, [fetchAuthData]);

  const register = async (data: {
    email: string;
    username: string;
    fullName: string;
    password?: string;
    avatarUrl?: string;
    bio?: string;
  }) => {
    const res = await authService.register(data);
    localStorage.setItem('promptcanvas_jwt', res.token);
    localStorage.setItem('promptcanvas_user_id', res.user.id); // for backward compatibility fallback
    setUser(res.user);
    setAllUsers((prev) => [...prev, res.user]);
    return res.user;
  };

  const login = async (emailOrUsername: string, password?: string) => {
    const res = await authService.login(emailOrUsername, password);
    localStorage.setItem('promptcanvas_jwt', res.token);
    localStorage.setItem('promptcanvas_user_id', res.user.id);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('promptcanvas_jwt');
    localStorage.removeItem('promptcanvas_user_id');
    setUser(null);
  };

  const switchUser = async (userId: string) => {
    localStorage.setItem('promptcanvas_user_id', userId);
    await fetchAuthData();
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = await authService.syncProfile({ ...data, id: user.id });
    setUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const requireAuthAction = (action: Function) => {
    return (...args: any[]) => {
      if (!user) {
        window.dispatchEvent(new Event('require-login'));
        return;
      }
      return action(...args);
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        allUsers,
        demoUsers: allUsers,
        isLoading,
        register,
        login,
        logout,
        switchUser,
        updateProfile,
        requireAuthAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
