import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") || false;

    if (!isAuthenticated) {
        // Redirect to login page while preserving the attempted URL
        return <Navigate to="/auth/login" />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
