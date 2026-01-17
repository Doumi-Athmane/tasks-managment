
import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: 'fa-circle-check text-green-500',
    error: 'fa-circle-exclamation text-red-500',
    info: 'fa-circle-info text-blue-500',
  };

  const colors = {
    success: 'bg-green-50 border-green-100',
    error: 'bg-red-50 border-red-100',
    info: 'bg-blue-50 border-blue-100',
  };

  return (
    <div 
      className={`pointer-events-auto flex items-center p-4 rounded-2xl border shadow-lg min-w-[300px] animate-in slide-in-from-right-10 duration-300 ${colors[toast.type]}`}
      role="alert"
    >
      <div className="flex-shrink-0">
        <i className={`fas ${icons[toast.type]} text-lg`}></i>
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-bold text-gray-900">{toast.message}</p>
      </div>
      <button 
        onClick={() => onRemove(toast.id)}
        className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Toast;
