"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PanelLeft, X } from "lucide-react";
import * as React from "react";

// Simple sidebar context
const SidebarContext = React.createContext(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

// Simplified provider
const SidebarProvider = ({ children, defaultOpen = true }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Check if we're on mobile
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        mobileOpen,
        setMobileOpen,
        isMobile,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

// Simplified sidebar
const Sidebar = ({ className, children, ...props }) => {
  const { open, setOpen, mobileOpen, setMobileOpen, isMobile } = useSidebar();

  // For mobile: show/hide based on mobileOpen state with overlay
  if (isMobile) {
    return (
      <>
        {/* Overlay when sidebar is open on mobile */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div
          className={cn(
            "fixed top-0 left-0 bottom-0 w-64 bg-netflix-black text-white z-50 transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
            className
          )}
          {...props}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          {children}
        </div>
      </>
    );
  }

  // For desktop: fixed position with adjustable width
  return (
    <div
      className={cn(
        "fixed top-0 left-0 bottom-0 bg-netflix-black text-white z-40 transition-all duration-300 border-r border-neutral-800",
        open ? "w-64" : "w-0 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Simplified sidebar components
const SidebarHeader = ({ className, ...props }) => (
  <div className={cn("p-4", className)} {...props} />
);

const SidebarContent = ({ className, ...props }) => (
  <div className={cn("flex-1 overflow-auto", className)} {...props} />
);

const SidebarFooter = ({ className, ...props }) => (
  <div
    className={cn("p-4 border-t border-neutral-800", className)}
    {...props}
  />
);

const SidebarMenu = ({ className, ...props }) => (
  <ul className={cn("space-y-1 p-2", className)} {...props} />
);

const SidebarMenuItem = ({ className, ...props }) => (
  <li className={cn("relative", className)} {...props} />
);

const SidebarMenuButton = ({ className, isActive, ...props }) => {
  const { open } = useSidebar();

  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-neutral-800 hover:text-netflix-red",
        isActive && "bg-neutral-800 text-netflix-red font-medium",
        !open && "justify-center px-0",
        className
      )}
      {...props}
    />
  );
};

const SidebarTrigger = ({ className, ...props }) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={toggleSidebar}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
};

// Sidebar inset (main content)
const SidebarInset = ({ className, ...props }) => {
  const { open, isMobile } = useSidebar();

  // Only add margin on desktop, and only when sidebar is open
  const marginLeft = !isMobile ? (open ? "ml-64" : "ml-0") : "ml-0";

  return (
    <main
      className={cn(
        "transition-all duration-300 min-h-screen",
        marginLeft,
        className
      )}
      {...props}
    />
  );
};

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
