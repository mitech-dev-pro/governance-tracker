import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="flex justify-center items-center py-4 px-6">
        <p className="text-gray-500 text-sm">
          IT Governance © {currentYear} | v.0.0.1
        </p>
      </div>
    </footer>
  );
}
