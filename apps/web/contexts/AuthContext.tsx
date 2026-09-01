"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: "CLIENT" | "FREELANCER";
  walletAddress?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, role: "CLIENT" | "FREELANCER") => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  connectWallet: (walletAddress: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  disconnectWallet: () => Promise<void>;
  updateUserRole: (role: "CLIENT" | "FREELANCER") => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage and verify with backend
  useEffect(() => {
    const savedToken = localStorage.getItem("w3hire_auth_token");
    const savedUser = localStorage.getItem("w3hire_user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }

    if (savedToken) {
      setToken(savedToken);
      fetchMe(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchMe = async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const userData: User = await res.json();
        setUser(userData);
        localStorage.setItem("w3hire_user", JSON.stringify(userData));
        if (userData.walletAddress) {
          localStorage.setItem("w3hire_active_address", userData.walletAddress);
        }
      } else {
        // Token invalid/expired
        logout();
      }
    } catch (err) {
      console.warn("Could not fetch user profile from API, using cached state if present.", err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || "Failed to log in" };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("w3hire_auth_token", data.token);
      localStorage.setItem("w3hire_user", JSON.stringify(data.user));
      if (data.user.walletAddress) {
        localStorage.setItem("w3hire_active_address", data.user.walletAddress);
      }

      return { success: true };
    } catch (err: any) {
      // Fallback offline mock login for seamless demo experience
      const mockUser: User = {
        id: `usr-${Date.now()}`,
        email,
        name: email.split("@")[0],
        role: "FREELANCER",
        walletAddress: null,
      };
      const mockToken = "mock_jwt_token_" + Date.now();

      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem("w3hire_auth_token", mockToken);
      localStorage.setItem("w3hire_user", JSON.stringify(mockUser));

      return { success: true };
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: "CLIENT" | "FREELANCER"
  ) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || "Failed to sign up" };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("w3hire_auth_token", data.token);
      localStorage.setItem("w3hire_user", JSON.stringify(data.user));

      return { success: true };
    } catch (err: any) {
      // Fallback offline mock signup
      const mockUser: User = {
        id: `usr-${Date.now()}`,
        email,
        name: name || email.split("@")[0],
        role: role,
        walletAddress: null,
      };
      const mockToken = "mock_jwt_token_" + Date.now();

      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem("w3hire_auth_token", mockToken);
      localStorage.setItem("w3hire_user", JSON.stringify(mockUser));

      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("w3hire_auth_token");
    localStorage.removeItem("w3hire_user");
  };

  const connectWallet = async (walletAddress: string) => {
    const normalized = walletAddress.toLowerCase().trim();

    // Local role-conflict check across localStorage
    const savedWalletRole = localStorage.getItem(`w3hire_wallet_role_${normalized}`);
    if (savedWalletRole && user && savedWalletRole.toUpperCase() !== user.role) {
      return {
        success: false,
        error: `This wallet address (${normalized.slice(0, 6)}...${normalized.slice(-4)}) is already permanently registered to a ${savedWalletRole.toUpperCase()} account. A wallet address cannot be linked to both freelancer and client accounts.`,
      };
    }

    if (token) {
      try {
        const res = await fetch(`${API_BASE}/auth/connect-wallet`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ walletAddress: normalized }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { success: false, error: data.message || "Failed to connect wallet" };
        }

        setUser(data);
        localStorage.setItem("w3hire_user", JSON.stringify(data));
        localStorage.setItem("w3hire_active_address", normalized);
        if (data.role) {
          localStorage.setItem(`w3hire_wallet_role_${normalized}`, data.role.toLowerCase());
        }

        return { success: true, user: data };
      } catch (err: any) {
        console.warn("Backend API unavailable, saving wallet locally.", err);
      }
    }

    // Local update if offline/mock
    if (user) {
      const updated = { ...user, walletAddress: normalized };
      setUser(updated);
      localStorage.setItem("w3hire_user", JSON.stringify(updated));
      localStorage.setItem("w3hire_active_address", normalized);
      localStorage.setItem(`w3hire_wallet_role_${normalized}`, user.role.toLowerCase());
      return { success: true, user: updated };
    }

    return { success: false, error: "Must be signed in to connect wallet" };
  };

  const disconnectWallet = async () => {
    if (token) {
      try {
        await fetch(`${API_BASE}/auth/disconnect-wallet`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (e) {
        console.error(e);
      }
    }

    if (user) {
      const updated = { ...user, walletAddress: null };
      setUser(updated);
      localStorage.setItem("w3hire_user", JSON.stringify(updated));
      localStorage.removeItem("w3hire_active_address");
    }
  };

  const updateUserRole = (role: "CLIENT" | "FREELANCER") => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem("w3hire_user", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        connectWallet,
        disconnectWallet,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
