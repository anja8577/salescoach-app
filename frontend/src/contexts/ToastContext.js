import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "@/components/ui/Toast";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ open: false, message: "", type: "info" });

  const showToast = useCallback(({ message, type = "info", duration = 2000 }) => {
    setToast({ open: true, message, type });
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => setToast(t => ({ ...t, open: false })), duration);
  }, []);

  const closeToast = () => setToast(t => ({ ...t, open: false }));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={closeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
