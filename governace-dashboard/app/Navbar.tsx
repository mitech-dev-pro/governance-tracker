"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

//interface
interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  return (
    <nav className="flex space-x-6 border-b px-5 md:ml-4 items-center h-14">
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

      <ul className="flex space-x-6  ">
        <li>Components</li>
        <li>Dashboard</li>
      </ul>
      <div className="ml-auto">Andrew Laryea</div>
    </nav>
  );
};

export default Navbar;
