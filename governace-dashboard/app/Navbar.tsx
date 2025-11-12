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
  Moon,
  Sun,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "./contexts/UserContext";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

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
    <nav
      className={`flex items-center justify-between h-16 px-4 md:px-6 ${
        isDarkMode
          ? "bg-slate-900 border-slate-800"
          : "bg-white border-slate-200"
      } border-b shadow-sm transition-colors duration-200`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Hamburger Menu Button - Only visible on mobile */}
        <button
          onClick={onToggleSidebar}
          className={`md:hidden p-2 rounded-lg ${
            isDarkMode
              ? "hover:bg-slate-800 text-slate-300"
              : "hover:bg-slate-100 text-slate-700"
          } transition-all duration-200 hover:scale-105`}
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
            src={isDarkMode ? "/milife_white.png" : "/milife_logo.png"}
            alt="Logo"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notifications */}
        <button
          className={`relative p-2 rounded-lg ${
            isDarkMode
              ? "hover:bg-slate-800 text-slate-300"
              : "hover:bg-slate-100 text-slate-700"
          } transition-all duration-200 hover:scale-105`}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span
            className={`absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ${
              isDarkMode ? "ring-slate-900" : "ring-white"
            } transition-colors duration-200`}
          ></span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`relative p-2 rounded-lg ${
            isDarkMode
              ? "hover:bg-slate-800 text-slate-300"
              : "hover:bg-slate-100 text-slate-700"
          } transition-all duration-200 hover:scale-105 group`}
          aria-label="Toggle dark mode"
        >
          <div className="relative w-5 h-5">
            <Sun
              className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
                isDarkMode
                  ? "opacity-0 rotate-90 scale-0"
                  : "opacity-100 rotate-0 scale-100"
              }`}
            />
            <Moon
              className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
                isDarkMode
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 -rotate-90 scale-0"
              }`}
            />
          </div>
        </button>

        {/* Divider */}
        <div
          className={`hidden md:block w-px h-6 ${
            isDarkMode ? "bg-slate-700" : "bg-slate-200"
          } transition-colors duration-200`}
        ></div>

        {/* User Menu */}
        <div className="relative user-menu-container">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg ${
              isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
            } transition-all duration-200 group`}
          >
            {/* User Profile Picture or Avatar */}
            {displayImage && !imageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImage}
                alt={displayName}
                className={`w-8 h-8 rounded-full object-cover border-2 ${
                  isDarkMode ? "border-slate-700" : "border-slate-200"
                } transition-transform duration-200 group-hover:scale-105`}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs shadow-lg transition-transform duration-200 group-hover:scale-105">
                {displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
            <span
              className={`hidden lg:block font-medium text-sm ${
                isDarkMode ? "text-slate-300" : "text-slate-700"
              } max-w-[120px] truncate transition-colors duration-200`}
            >
              {displayName}
            </span>
            <ChevronDown
              className={`w-4 h-4 ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              } transition-transform duration-200 ${
                showUserMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div
              className={`absolute right-0 top-full mt-2 w-56 ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-slate-200"
              } rounded-lg shadow-xl border py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200 transition-colors`}
            >
              {/* User Info Section */}
              <div
                className={`px-4 py-3 border-b ${
                  isDarkMode ? "border-slate-700" : "border-slate-100"
                } transition-colors duration-200`}
              >
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  } truncate transition-colors duration-200`}
                >
                  {displayName}
                </p>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  } truncate transition-colors duration-200`}
                >
                  {user?.email || "user@example.com"}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href="/setup/user-account"
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${
                    isDarkMode
                      ? "text-slate-300 hover:bg-slate-700/50"
                      : "text-slate-700 hover:bg-slate-50"
                  } transition-colors group`}
                  onClick={() => setShowUserMenu(false)}
                >
                  <User
                    className={`w-4 h-4 ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    } group-hover:text-blue-500 transition-colors`}
                  />
                  <span>User Account</span>
                </Link>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push("/change-password");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${
                    isDarkMode
                      ? "text-slate-300 hover:bg-slate-700/50"
                      : "text-slate-700 hover:bg-slate-50"
                  } transition-colors group`}
                >
                  <Key
                    className={`w-4 h-4 ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    } group-hover:text-blue-500 transition-colors`}
                  />
                  <span>Change Password</span>
                </button>
              </div>

              {/* Logout Section */}
              <div
                className={`border-t ${
                  isDarkMode ? "border-slate-700" : "border-slate-100"
                } py-1 transition-colors duration-200`}
              >
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${
                    isDarkMode
                      ? "text-red-400 hover:bg-red-900/20"
                      : "text-red-600 hover:bg-red-50"
                  } transition-colors group`}
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
