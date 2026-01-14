import React, { createContext, useContext, useState } from 'react';

interface UserContextType {
    username: string;
    setUsername: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [username, setUsernameState] = useState(() => {
        return localStorage.getItem('latam_username') || `Trader_${Math.floor(1000 + Math.random() * 9000)}`;
    });

    const setUsername = (name: string) => {
        setUsernameState(name);
        localStorage.setItem('latam_username', name);
    };

    return (
        <UserContext.Provider value={{ username, setUsername }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within UserProvider');
    return context;
};
