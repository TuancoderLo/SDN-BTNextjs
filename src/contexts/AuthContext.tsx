"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authAPI, setAuthToken, setUser, removeAuthToken } from "../utils/api";
import toast from "react-hot-toast";

interface BackendUser {
  _id: string;
  email: string;
  name: string;
  YOB?: number;
  gender?: boolean;
  isAdmin?: boolean;
}

interface AuthContextType {
  backendUser: BackendUser | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: BackendUser) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const hasBackendSessionRef = React.useRef(false);

  useEffect(() => {
    // Check for stored backend user on app load
    const checkStoredUser = () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setAuthToken(storedToken);
      }
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setBackendUser(userData);
          if (storedToken) {
            hasBackendSessionRef.current = true;
          }
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem("user");
        }
      }
    };

    checkStoredUser();
    // No Firebase listener; rely solely on stored backend session
    setLoading(false);
    return () => {};
  }, []);

  // Google sign-in disabled
  const signInWithGoogle = async () => {
    toast.error("Google sign-in is disabled. Please use email/password.");
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Call backend login API
      const response = await authAPI.login({ email, password });

      const { token, user } = response.data;

      // Store token and user data
      setAuthToken(token);
      setUser(user);
      setBackendUser(user);

      toast.success("Login successful!");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    removeAuthToken();
    setBackendUser(null);
    toast.success("Successfully signed out!");
  };

  const updateUser = (user: BackendUser) => {
    setUser(user);
    setBackendUser(user);
  };

  const value = {
    backendUser,
    loading,
    signInWithGoogle,
    loginWithEmail,
    logout,
    updateUser,
    isAuthenticated: !!backendUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
