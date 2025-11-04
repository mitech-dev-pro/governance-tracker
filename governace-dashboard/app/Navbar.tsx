"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { UserCircle } from "lucide-react";

//interface
interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar = ({ onToggleSidebar }: NavbarProps) => {
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

      <ul className="hidden md:flex space-x-6">
        <li>
          <Link
            className="text-zinc-500 hover:text-zinc-800"
            href="/components"
          >
            Components
          </Link>
        </li>
        <li>
          <Link className="text-zinc-500 hover:text-zinc-800" href="/dashboard">
            Dashboard
          </Link>
        </li>
      </ul>
      <div className="ml-auto flex items-center space-x-2">
        <UserCircle className="w-6 h-6 text-gray-500" />
        <span className="hidden md:block">Andrew Laryea</span>
      </div>
    </nav>
  );
};

export default Navbar;
