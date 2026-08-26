import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  username: string;
  avatar: string;
  rank: 'NOVICE' | 'VERIFIED' | 'ELITE' | 'COKEBOY';
  bio: string;
}

interface AuthProfileContextType {
  profile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  isAdmin: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  username: 'Gamer',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  rank: 'NOVICE',
  bio: 'Just another gamer.',
};

const AuthProfileContext = createContext<AuthProfileContextType | undefined>(undefined);

export function AuthProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse user profile', e);
    }
    return DEFAULT_PROFILE;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('admin_session') === 'authenticated';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (isAdmin) sessionStorage.setItem('admin_session', 'authenticated');
    else sessionStorage.removeItem('admin_session');
  }, [isAdmin]);

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updated }));
  };

  const loginAdmin = (password: string): boolean => {
    if (password === 'Creativity') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => setIsAdmin(false);

  return (
    <AuthProfileContext.Provider value={{ profile, updateProfile, isAdmin, loginAdmin, logoutAdmin }}>
      {children}
    </AuthProfileContext.Provider>
  );
}

export function useAuthProfile() {
  const context = useContext(AuthProfileContext);
  if (!context) throw new Error('useAuthProfile must be used within an AuthProfileProvider');
  return context;
}
