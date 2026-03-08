'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * UIContext provides global UI state management
 * Handles loading states, modals, notifications at app level
 * Prevents prop drilling for UI-level state
 */

export interface ModalState {
  isOpen: boolean;
  type: 'confirmation' | 'form' | 'info' | 'custom';
  title?: string;
  message?: string;
  actionLabel?: string;
  onConfirm?: () => Promise<void> | void;
  onCancel?: () => void;
}

interface UIContextType {
  // Loading states
  isPageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
  
  isSectionLoading: boolean;
  setSectionLoading: (loading: boolean) => void;
  
  // Modal management
  modal: ModalState;
  openModal: (config: Omit<ModalState, 'isOpen'>) => void;
  closeModal: () => void;
  
  // Sidebar state
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Global error state (separate from component-level errors)
  globalError: string | null;
  setGlobalError: (error: string | null) => void;
  clearError: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

export function UIProvider({ children }: UIProviderProps) {
  const [isPageLoading, setPageLoading] = useState(false);
  const [isSectionLoading, setSectionLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'confirmation',
  });

  const openModal = useCallback((config: Omit<ModalState, 'isOpen'>) => {
    setModal({ ...config, isOpen: true });
  }, []);

  const closeModal = useCallback(() => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const clearError = useCallback(() => {
    setGlobalError(null);
  }, []);

  const value: UIContextType = {
    isPageLoading,
    setPageLoading,
    isSectionLoading,
    setSectionLoading,
    modal,
    openModal,
    closeModal,
    isSidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    globalError,
    setGlobalError,
    clearError,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

/**
 * Hook to access UI context
 * Must be used within UIProvider
 */
export function useUIContext() {
  const context = useContext(UIContext);
  
  if (!context) {
    throw new Error('useUIContext must be used within UIProvider');
  }
  
  return context;
}

/**
 * Convenience hooks for specific UI concerns
 */

export function usePageLoading() {
  const { isPageLoading, setPageLoading } = useUIContext();
  return { isPageLoading, setPageLoading };
}

export function useSectionLoading() {
  const { isSectionLoading, setSectionLoading } = useUIContext();
  return { isSectionLoading, setSectionLoading };
}

export function useModal() {
  const { modal, openModal, closeModal } = useUIContext();
  return { modal, openModal, closeModal };
}

export function useSidebar() {
  const { isSidebarOpen, setSidebarOpen, toggleSidebar } = useUIContext();
  return { isSidebarOpen, setSidebarOpen, toggleSidebar };
}

export function useGlobalError() {
  const { globalError, setGlobalError, clearError } = useUIContext();
  return { globalError, setGlobalError, clearError };
}
