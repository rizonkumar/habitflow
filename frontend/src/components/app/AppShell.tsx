"use client";

import { ReactNode, useState, createContext, useContext } from "react";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useSidebarStore } from "@/store/sidebar";

type SidebarContextType = {
  isCollapsed: boolean;
};

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
});

export function useSidebarCollapsed() {
  return useContext(SidebarContext);
}

type AppShellProps = {
  sidebar?: ReactNode;
  children: ReactNode;
};

export function AppShell({ sidebar, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isCollapsed, toggle } = useSidebarStore();

  return (
    <div className="flex h-[calc(100vh-64px)] relative">
      {sidebar && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar - always expanded (isCollapsed: false) */}
      {sidebar && (
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-(--card) border-r border-(--border) transform transition-transform duration-300 ease-in-out lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ top: "64px" }}
        >
          <div className="flex items-center justify-between p-4 border-b border-(--border)">
            <span className="text-sm font-semibold text-(--foreground)">
              Menu
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-(--muted) hover:text-(--foreground) hover:bg-(--card-hover) transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto h-[calc(100%-60px)]">
            <SidebarContext.Provider value={{ isCollapsed: false }}>
              {sidebar}
            </SidebarContext.Provider>
          </div>
        </aside>
      )}

      {sidebar && (
        <aside
          className={`hidden lg:flex lg:flex-col border-r border-(--border) bg-(--card) h-full shrink-0 transition-all duration-300 ease-in-out overflow-visible ${
            isCollapsed ? "w-16" : "w-64 xl:w-72"
          }`}
        >
          <div className="flex-1 p-4 overflow-y-auto">
            <SidebarContext.Provider value={{ isCollapsed }}>
              {sidebar}
            </SidebarContext.Provider>
          </div>
          <div className="p-2 border-t border-(--border)">
            <button
              onClick={toggle}
              className="flex items-center justify-center w-full p-2 rounded-lg text-(--muted) hover:text-(--foreground) hover:bg-(--card-hover) transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          </div>
        </aside>
      )}

      <main className="flex-1 overflow-y-auto h-full">
        {sidebar && (
          <div className="sticky top-0 z-30 flex items-center gap-3 p-4 border-b border-(--border) bg-(--background)/80 backdrop-blur-xl lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-(--muted) hover:text-(--foreground) hover:bg-(--card-hover) transition-colors"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-medium text-(--foreground)">
              Menu
            </span>
          </div>
        )}
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}