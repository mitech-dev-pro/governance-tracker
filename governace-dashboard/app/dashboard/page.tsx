import React from "react";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Dashboard content will go here */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Welcome to Governance Tracker
          </h3>
          <p className="text-gray-600">Your dashboard is ready to use.</p>
        </div>
      </div>
    </div>
  );
}
