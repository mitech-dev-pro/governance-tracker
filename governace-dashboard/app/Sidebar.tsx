"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronRight, ChevronDown, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((item) => item !== itemName)
        : [...prev, itemName]
    );
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: "📊",
      href: "/",
      hasSubmenu: false,
    },
    {
      name: "Governance Tracker",
      icon: "👤",
      href: "/governance",
      hasSubmenu: false,
    },
    {
      name: "Asset Management",
      icon: "🏪",
      href: "/assets",
      hasSubmenu: true,
      submenu: [
        { name: "Computer", href: "/assets/computer" },
        { name: "Applications", href: "/assets/applications" },
      ],
    },
    {
      name: "Risk Management",
      icon: "💰",
      href: "/risk-overview",
      hasSubmenu: true,
      submenu: [
        { name: "Risk Register", href: "/risk/risk-register" },
        { name: "Risk Matrix", href: "/risk/risk-matrix" },
        { name: "Treatments", href: "/risk/risk-treatment" },
      ],
    },
    {
      name: "Compliance",
      icon: "⚓",
      href: "/compliance",
      hasSubmenu: true,
      submenu: [
        { name: "Controls", href: "/compliance/controls" },
        { name: "Policies", href: "/compliance/policies" },
        { name: "Assessments", href: "/compliance/assessments" },
      ],
    },
    {
      name: "Audit",
      icon: "💼",
      href: "/audit",
      hasSubmenu: true,
      submenu: [
        { name: "Findings", href: "/audit/findings" },
        { name: "Schedule", href: "/audit/schedule" },
      ],
    },
    {
      name: "Reports",
      icon: "📄",
      href: "/reports",
      hasSubmenu: false,
    },
    {
      name: "Setup",
      icon: "🔧",
      href: "/setup",
      hasSubmenu: true,
      submenu: [
        { name: "Users", href: "/setup/users" },
        { name: "Roles", href: "/setup/roles" },
        { name: "Departments", href: "/setup/departments" },
        { name: "User Account", href: "/setup/user-account" },
        { name: "User Role", href: "/setup/user-role" },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-full md:w-72 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 text-white h-screen overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          rounded-r-xl shadow-xl backdrop-blur-md border-r border-slate-600
        `}
      >
        {/* Mobile close button */}
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-600"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2" role="navigation">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <div key={item.name}>
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 p-3 rounded text-sm transition-colors duration-200 flex-1 ${
                      isActive
                        ? "bg-slate-700 text-white"
                        : "hover:bg-slate-600 text-slate-300"
                    }`}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        onClose();
                      }
                    }}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </Link>
                  {item.hasSubmenu && (
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className="p-2 hover:bg-slate-600 rounded"
                      aria-expanded={expandedItems.includes(item.name)}
                      aria-label={`Toggle ${item.name} submenu`}
                    >
                      {expandedItems.includes(item.name) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Submenu */}
                {item.hasSubmenu &&
                  expandedItems.includes(item.name) &&
                  item.submenu && (
                    <div className="ml-6 border-l border-slate-500 pl-2 transition-all duration-300">
                      {item.submenu.map((subItem) => {
                        const isSubActive = pathname === subItem.href;

                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`block p-2 pl-4 text-sm rounded transition-colors duration-200 ${
                              isSubActive
                                ? "bg-slate-700 text-white"
                                : "text-slate-300 hover:text-white hover:bg-slate-600"
                            }`}
                            onClick={() => {
                              if (window.innerWidth < 768) {
                                onClose();
                              }
                            }}
                          >
                            {subItem.name}
                          </Link>
                        );
                      })}
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
