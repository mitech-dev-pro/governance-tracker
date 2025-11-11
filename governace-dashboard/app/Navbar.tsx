"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, ChevronDown, User, Key } from "lucide-react";
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

  return (
    <nav className="flex space-x-6  px-5 md:ml-4 items-center h-14">
      {/* Hamburger Menu Button - Only visible on mobile */}
      <button
        onClick={onToggleSidebar}
        className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <span>
        {" "}
        <Link href="/">
          <Image src="/milife_logo.png" alt="Logo" width={150} height={150} />
        </Link>
      </span>
      <div className="ml-auto flex items-center space-x-2 relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
        >
          {/* User Profile Picture or Avatar */}
          {displayImage && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayImage}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              {displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
          )}
          <span className="hidden md:block font-medium text-gray-700">
            {displayName}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <Link
              href="/setup/user-account"
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-100"
              onClick={() => setShowUserMenu(false)}
            >
              <User className="w-4 h-4" />
              <span>User Account</span>
            </Link>
            <button
              onClick={() => {
                setShowUserMenu(false);
                router.push("/change-password");
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-100"
            >
              <Key className="w-4 h-4" />
              <span>Change Password</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
