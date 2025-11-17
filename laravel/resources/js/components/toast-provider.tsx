import { Toast, ToastClose, ToastDescription, ToastTitle } from '@/components/ui/toast';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import React, { createContext, useContext, useState } from 'react';

interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    duration?: number;
}

interface ToastContextType {
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (toast: Omit<ToastMessage, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: ToastMessage = { ...toast, id };

        setToasts((prev) => [...prev, newToast]);

        // Auto-remove toast after duration
        if (toast.duration) {
            setTimeout(() => {
                removeToast(id);
            }, toast.duration);
        }
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const getToastIcon = (type: ToastMessage['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-600" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-yellow-600" />;
            case 'info':
                return <Info className="h-5 w-5 text-blue-600" />;
            default:
                return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const getToastVariant = (type: ToastMessage['type']) => {
        switch (type) {
            case 'success':
                return 'success';
            case 'error':
                return 'destructive';
            case 'warning':
                return 'warning';
            case 'info':
                return 'info';
            default:
                return 'default';
        }
    };

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 flex max-w-sm flex-col gap-2">
                {toasts.map((toast) => (
                    <Toast key={toast.id} variant={getToastVariant(toast.type)} className="min-w-[300px]">
                        <div className="flex items-start gap-3">
                            {getToastIcon(toast.type)}
                            <div className="flex-1">
                                <ToastTitle>{toast.title}</ToastTitle>
                                {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
                            </div>
                        </div>
                        <ToastClose onClick={() => removeToast(toast.id)} />
                    </Toast>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
