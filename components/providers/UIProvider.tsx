"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import Toast, { ToastType } from "../ui/Toast";
import ConfirmModal from "../ui/ConfirmModal";

interface ToastState {
  message: string;
  type: ToastType;
}

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "info";
}

interface UIContextType {
  showToast: (message: string, type?: ToastType) => void;
  confirm: (options: Omit<ConfirmState, "isOpen">) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
  };

  const confirm = (options: Omit<ConfirmState, "isOpen">) => {
    setConfirmState({ ...options, isOpen: true });
  };

  const handleCloseConfirm = () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    confirmState.onConfirm();
    handleCloseConfirm();
  };

  return (
    <UIContext.Provider value={{ showToast, confirm }}>
      {children}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        type={confirmState.type}
        onConfirm={handleConfirm}
        onCancel={handleCloseConfirm}
      />
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
