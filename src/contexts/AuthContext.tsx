import React, { createContext, useContext, useState, useEffect } from "react";
import useFetch from "@/utils/useFetch";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    accessToken: string | false;
    setUser: (user: object) => void;
    user: object;
}

const root_url = import.meta.env.VITE_BASE_URL;

const AuthContext = createContext<AuthContextType | undefined>(undefined);
let loadUser;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessToken, setAccessToken] = useState(false);
    const [user, setUser] = useState(false);
    const [userError, setUserError] = useState(false);

    loadUser = () => {
        const token = localStorage.getItem("accessToken");
        const acct_type = localStorage.getItem("acct_type");
        let url;

        if (acct_type == "donor") {
            url = `${root_url}/request/dashboard/stats`;
        } else {
            url = `${root_url}/request/dashboard/donations`;
        }
        const headers = {
            Authorization: `Bearer ${token}`,
        };

        setUser(false);
        setUserError(false);
        useFetch(url, false, headers, "get")
            .then(({ data, error }) => {
                console.log(data);
                if (data) {
                    setUserError(false);
                    setUser(data);
                } else {
                }
            })
            .catch((err) => {
                if (err.response) {
                    if (err.response.data.message == "Unauthorized") {
                        setUserError(false);
                        logout();
                    } else {
                        setUserError(true);
                    }
                } else {
                    setUserError(true);
                }
            });
    };

    useEffect(() => {
        // Check if token exists on mount
        const token = localStorage.getItem("accessToken");
        if (token) {
            setAccessToken(token);
            setIsAuthenticated(true);
            loadUser();
        }
    }, []);

    const login = (accessToken, acct_type) => {
        // store in localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("acct_type", acct_type);

        // update your state
        setAccessToken(accessToken);
        setIsAuthenticated(true);
        let url;

        if (acct_type == "donor") {
            url = `${root_url}/request/dashboard/stats`;
        } else {
            url = `${root_url}/request/dashboard/donations`;
        }

        const headers = {
            Authorization: `Bearer ${accessToken}`,
        };

        useFetch(url, false, headers, "get")
            .then(({ data, error }) => {
                if (data) {
                    setUser(data);
                } else {
                    // handle error if needed
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("acct_type");
        localStorage.removeItem("authData");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("isAuthenticated");
        setAccessToken(false);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                login,
                logout,
                accessToken,
                setIsAuthenticated,
                user,
                userError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export { root_url, loadUser };
