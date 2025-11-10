"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import Footer from "../Footer";
import { UserProvider } from "../contexts/UserContext";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Pages that should not show navbar/sidebar/footer
  const authPages = ["/login", "/logout"];
  const isAuthPage = authPages.includes(pathname);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // If it's an auth page, render children without layout
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <UserProvider>
      <div className="flex flex-col h-screen">
        {/* Fixed Navbar */}
        <div className="flex-shrink-0">
          <Navbar onToggleSidebar={toggleSidebar} />
        </div>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Fixed Sidebar */}
          <div className="flex-shrink-0">
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
          </div>

          {/* Main content with footer */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Scrollable main content */}
            <main className="flex-1 bg-gray-50 overflow-auto">{children}</main>

            {/* Footer */}
            <Footer />
          </div>
        </div>
      </div>
    </UserProvider>
  );
}
