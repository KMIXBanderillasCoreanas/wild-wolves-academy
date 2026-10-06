'use client';

import React, { createContext, useContext, useState } from 'react';
import { UserRole, UserSession } from '@/types/basketball';
import { INITIAL_COACH, INITIAL_ALUMNO } from '@/data/mockData';

interface AuthContextType {
  currentUser: UserSession;
  role: UserRole;
  isCoach: boolean;
  isAlumno: boolean;
  canEdit: boolean;
  switchRole: (newRole: UserRole) => void;
  showPermissionDeniedModal: boolean;
  triggerDeniedAction: () => void;
  closeDeniedModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession>(INITIAL_COACH);
  const [showPermissionDeniedModal, setShowPermissionDeniedModal] = useState(false);

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'coach') {
      setCurrentUser(INITIAL_COACH);
    } else {
      setCurrentUser(INITIAL_ALUMNO);
    }
  };

  const triggerDeniedAction = () => {
    setShowPermissionDeniedModal(true);
  };

  const closeDeniedModal = () => {
    setShowPermissionDeniedModal(false);
  };

  const isCoach = currentUser.role === 'coach';
  const isAlumno = currentUser.role === 'alumno';
  const canEdit = isCoach;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser.role,
        isCoach,
        isAlumno,
        canEdit,
        switchRole,
        showPermissionDeniedModal,
        triggerDeniedAction,
        closeDeniedModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
