"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  X,
  LayoutDashboard,
  Users,
  FolderOpen,
  Monitor,
  AppWindow,
  AlertTriangle,
  Shield,
  CheckSquare,
  FileText,
  ClipboardList,
  Briefcase,
  Calendar,
  FileBarChart,
  Settings,
  UserCircle,
  UsersRound,
  Building2,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();

  // Check dark mode on mount and listen for changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    // Listen for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) => {
      if (prev.includes(itemName)) {
        return prev.filter((item) => item !== itemName);
      }
      return [itemName];
    });
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      hasSubmenu: false,
    },
    {
      name: "Governance Tracker",
      icon: Users,
      href: "/governance",
      hasSubmenu: false,
    },
    {
      name: "Asset Management",
      icon: FolderOpen,
      href: "/assets",
      hasSubmenu: true,
      submenu: [
        { name: "Computer", href: "/assets/computer", icon: Monitor },
        { name: "Applications", href: "/assets/applications", icon: AppWindow },
      ],
    },
    {
      name: "Risk Management",
      icon: AlertTriangle,
      href: "/risk",
      hasSubmenu: false,
    },
    {
      name: "Compliance",
      icon: Shield,
      href: "/compliance",
      hasSubmenu: true,
      submenu: [
        { name: "Controls", href: "/compliance/controls", icon: CheckSquare },
        { name: "Policies", href: "/compliance/policies", icon: FileText },
        {
          name: "Assessments",
          href: "/compliance/assessments",
          icon: ClipboardList,
        },
      ],
    },
    {
      name: "Audit",
      icon: Briefcase,
      href: "/audit",
      hasSubmenu: true,
      submenu: [
        { name: "Findings", href: "/audit/findings", icon: FileBarChart },
        { name: "Schedule", href: "/audit/schedule", icon: Calendar },
      ],
    },
    {
      name: "Reports",
      icon: FileBarChart,
      href: "/reports",
      hasSubmenu: false,
    },
    {
      name: "Setup",
      icon: Settings,
      href: "/setup",
      hasSubmenu: true,
      submenu: [
        { name: "Users", href: "/setup/users", icon: UsersRound },
        { name: "Roles", href: "/setup/roles", icon: Shield },
        { name: "Departments", href: "/setup/departments", icon: Building2 },
        { name: "User Account", href: "/setup/user-account", icon: UserCircle },
        { name: "User Role", href: "/setup/user-role", icon: Users },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-64 md:w-64 ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          } border-r h-screen overflow-y-auto
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          shadow-lg
        `}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            isDarkMode ? "border-slate-800" : "border-slate-200"
          } transition-colors duration-200`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span
              className={`font-semibold ${
                isDarkMode ? "text-white" : "text-slate-900"
              } text-sm transition-colors duration-200`}
            >
              GRC Dashboard
            </span>
          </div>
          <button
            onClick={onClose}
            className={`md:hidden p-1.5 rounded-lg ${
              isDarkMode
                ? "hover:bg-slate-800 text-slate-400"
                : "hover:bg-slate-100 text-slate-500"
            } transition-all duration-200`}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1" role="navigation">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <div key={item.name}>
                <div className="flex items-center group">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 ${
                      isActive
                        ? `${
                            isDarkMode
                              ? "bg-blue-900/20 text-blue-400"
                              : "bg-blue-50 text-blue-600"
                          } shadow-sm`
                        : `${
                            isDarkMode
                              ? "text-slate-300 hover:bg-slate-800/50"
                              : "text-slate-700 hover:bg-slate-50"
                          } hover:translate-x-0.5`
                    }`}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        onClose();
                      }
                    }}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                        isActive ? "scale-110" : "group-hover:scale-105"
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                  {item.hasSubmenu && (
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={`p-2 ${
                        isDarkMode
                          ? "hover:bg-slate-800 text-slate-400"
                          : "hover:bg-slate-100 text-slate-500"
                      } rounded-lg transition-all duration-200 hover:scale-110`}
                      aria-expanded={expandedItems.includes(item.name)}
                      aria-label={`Toggle ${item.name} submenu`}
                    >
                      <ChevronRight
                        className={`w-4 h-4 transition-transform duration-300 ${
                          expandedItems.includes(item.name) ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Submenu with animation */}
                {item.hasSubmenu && item.submenu && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedItems.includes(item.name)
                        ? "max-h-96 opacity-100 mt-1"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="ml-7 space-y-1">
                      {item.submenu.map((subItem, index) => {
                        const isSubActive = pathname === subItem.href;
                        const SubIcon = subItem.icon;

                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`flex items-center gap-2.5 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                              isSubActive
                                ? `${
                                    isDarkMode
                                      ? "bg-blue-900/20 text-blue-400"
                                      : "bg-blue-50 text-blue-600"
                                  } font-medium translate-x-1`
                                : `${
                                    isDarkMode
                                      ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                  } hover:translate-x-1`
                            }`}
                            style={{
                              animationDelay: `${index * 50}ms`,
                            }}
                            onClick={() => {
                              if (window.innerWidth < 768) {
                                onClose();
                              }
                            }}
                          >
                            <SubIcon
                              className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
                                isSubActive ? "scale-110" : ""
                              }`}
                            />
                            <span className="truncate">{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}
