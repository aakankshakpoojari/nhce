"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { myApplications as initialApplications, MockApplication } from "@/lib/mock-data";

interface ApplicationContextType {
  applications: MockApplication[];
  applyToBounty: (bountyId: string, bountyTitle: string) => void;
  hasApplied: (bountyId: string) => boolean;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<MockApplication[]>(initialApplications);

  const applyToBounty = (bountyId: string, bountyTitle: string) => {
    if (applications.some(app => app.bountyId === bountyId)) return;
    
    const newApp: MockApplication = {
      id: `app-new-${Date.now()}`,
      bountyId,
      bountyTitle,
      appliedAt: "Just now",
      status: "Pending Review"
    };
    
    setApplications(prev => [newApp, ...prev]);
  };

  const hasApplied = (bountyId: string) => {
    return applications.some(app => app.bountyId === bountyId);
  };

  return (
    <ApplicationContext.Provider value={{ applications, applyToBounty, hasApplied }}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplications() {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error("useApplications must be used within an ApplicationProvider");
  }
  return context;
}
