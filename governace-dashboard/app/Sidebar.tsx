"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

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
      name: "Commission",
      icon: "💹",
      href: "/commission",
      hasSubmenu: true,
      submenu: [
        { name: "Calculations", href: "/commission/calculations" },
        { name: "Payments", href: "/commission/payments" },
        { name: "Reports", href: "/commission/reports" },
      ],
    },
    {
      name: "Reports",
      icon: "👤",
      href: "/reports",
      hasSubmenu: false,
    },
    {
      name: "Setup",
      icon: "🔧",
      href: "/setup",
      hasSubmenu: true,
      submenu: [
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
          className="fixed inset-0  bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed md:static inset-y-0 left-0 z-30
        w-64 bg-slate-700 text-white h-screen overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
      >
        {/* Mobile close button */}
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-600"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => (
            <div key={item.name}>
              <div className="flex items-center justify-between">
                <Link
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded hover:bg-slate-600 text-sm flex-1"
                  onClick={() => {
                    // Close sidebar on mobile when clicking a link
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
                  >
                    {expandedItems.includes(item.name) ? (
                      <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Submenu */}
              {item.hasSubmenu &&
                expandedItems.includes(item.name) &&
                item.submenu && (
                  <div className="ml-6 border-l border-slate-500">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block p-2 pl-4 text-sm text-slate-300 hover:text-white hover:bg-slate-600 rounded"
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            onClose();
                          }
                        }}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
