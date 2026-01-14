import React, { createContext, useContext, useState } from 'react';

interface ToastContextType {
    showToast: (msg: string) => void;
    toastMsg: string | null;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast, toastMsg }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
