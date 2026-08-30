"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface RoleContextType {
  isClient: boolean;
  setIsClient: (value: boolean) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  return (
    <RoleContext.Provider value={{ isClient, setIsClient }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
