import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="flex space-x-4">
      <Link href="/">Logo</Link>
      <ul className="flex  ">
        <li>Components</li>
        <li>Dashboard</li>
      </ul>
    </nav>
  );
};

export default Navbar;
