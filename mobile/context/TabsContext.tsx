import React, { createContext, useContext, useState, useMemo, useCallback } from "react";

export type TabKey = "index" | "search" | "videos" | "notifications" | "profile";

interface TabsContextValue {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export const TabsProvider = ({ children, initialTab = "index" as TabKey }: { children: React.ReactNode; initialTab?: TabKey }) => {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const setActiveTabOptimized = useCallback((tab: TabKey) => {
    setActiveTab((current) => (current === tab ? current : tab));
  }, []);
  const value = useMemo(() => ({ activeTab, setActiveTab: setActiveTabOptimized }), [activeTab, setActiveTabOptimized]);
  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
};

export const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("useTabs must be used within TabsProvider");
  return ctx;
};

