/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem("auth"));
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => getStoredUser());

    useEffect(() => {
        if (user) {
            localStorage.setItem("auth", JSON.stringify(user));
            return;
        }

        localStorage.removeItem("auth");
    }, [user]);

    const value = useMemo(() => ({
        user,
        login: (username, password) => {
            if (username === "testuser" && password === "Test123") {
                const nextUser = { username };
                setUser(nextUser);
                return true;
            }

            return false;
        },
        logout: () => {
            setUser(null);
        }
    }), [user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
};