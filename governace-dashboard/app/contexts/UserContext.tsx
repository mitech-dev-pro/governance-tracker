"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  userrole?: {
    role: {
      id: number;
      name: string;
      rolepermission: {
        permission: {
          id: number;
          key: string;
          label: string;
        };
      }[];
    };
  }[];
  userdepartment?: {
    department: {
      id: number;
      name: string;
      code: string | null;
    };
  }[];
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/auth/me");

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, clear user
          setUser(null);
          return;
        }
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error("Error fetching user:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // Listen for user profile updates from other parts of the app
    const handleUserUpdate = () => {
      fetchUser();
    };

    window.addEventListener("userProfileUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("userProfileUpdated", handleUserUpdate);
    };
  }, []);

  return (
    <UserContext.Provider
      value={{ user, isLoading, error, refetchUser: fetchUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
