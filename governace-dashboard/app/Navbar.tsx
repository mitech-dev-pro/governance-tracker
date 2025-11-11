"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LogOut,
  ChevronDown,
  User,
  Key,
  Menu,
  Bell,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "./contexts/UserContext";

//interface
interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleLogout = () => {
    router.push("/logout");
  };

  // Show loading state or default while user data is being fetched
  const displayName = user?.name || "User";
  const displayImage = user?.image || null;

  // State to track if image failed to load
  const [imageError, setImageError] = useState(false);

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.image]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showUserMenu &&
        !(event.target as Element).closest(".user-menu-container")
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  return (
    <nav className="flex items-center justify-between h-16 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Hamburger Menu Button - Only visible on mobile */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200 hover:scale-105"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <Image
            src="/milife_logo.png"
            alt="Logo"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search Button */}
        {/* <button
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all duration-200 border border-slate-200 dark:border-slate-700"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm">Search...</span>
          <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded">
            ⌘K
          </kbd>
        </button> */}
        {/* Notifications */}
        {/* <button
          className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200 hover:scale-105"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
        </button> */}
        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
        {/* User Menu */}
        <div className="relative user-menu-container">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group"
          >
            {/* User Profile Picture or Avatar */}
            {displayImage && !imageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImage}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 transition-transform duration-200 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-lg transition-transform duration-200 group-hover:scale-105">
                {displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
            <span className="hidden lg:block font-medium text-sm text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                showUserMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href="/setup/user-account"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <span>User Account</span>
                </Link>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push("/change-password");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                >
                  <Key className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <span>Change Password</span>
                </button>
              </div>

              {/* Logout Section */}
              <div className="border-t border-slate-100 dark:border-slate-700 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                >
                  <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
