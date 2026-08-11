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
    avatarUrl?: string;
    bio?: string;
  }) => Promise<User>;
  login: (emailOrUsername: string) => Promise<User>;
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
    avatarUrl?: string;
    bio?: string;
  }) => {
    const newUser = await authService.register(data);
    localStorage.setItem('promptcanvas_user_id', newUser.id);
    setUser(newUser);
    setAllUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const login = async (emailOrUsername: string) => {
    const loggedInUser = await authService.login(emailOrUsername);
    localStorage.setItem('promptcanvas_user_id', loggedInUser.id);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
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
