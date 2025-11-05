import React from "react";
import { RefreshCw, Download } from "lucide-react";

const AssetsHome = () => {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 lg:p-6 pb-8 min-h-full">
      <div className="mx-auto">
        {/* <div className="bg-amber-800 mt-2 p-5 rounded-lg">Some</div> */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                Asset Tracker
              </h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                Manage and track all assets across your organization
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                // onClick={handleRefresh}
                className="inline-flex items-center px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 shadow-sm text-sm"
                // disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 {loading ? "animate-spin" : ""} sm:mr-2`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button className="inline-flex items-center px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 shadow-sm text-sm">
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsHome;
