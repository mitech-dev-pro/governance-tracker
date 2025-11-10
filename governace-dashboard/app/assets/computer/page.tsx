"use client";

import { useState, useEffect } from "react";
import { Laptop, Monitor, Search, Plus, Download, Package } from "lucide-react";
import Link from "next/link";

interface Asset {
  id: number;
  assetTag: string;
  name: string;
  category: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  status: string;
  condition: string;
  location?: string;
  assignedToName?: string; // Free text name
  assignedTo?: {
    id: number;
    name: string;
    email: string;
  };
  department?: {
    id: number;
    name: string;
  };
  purchaseDate?: string;
  purchaseCost?: number;
}

export default function ComputersPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(""); // COMPUTER, LAPTOP, MONITOR
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });

      // Filter only computer-related categories
      if (categoryFilter) {
        params.append("category", categoryFilter);
      } else {
        // If no specific filter, search for all computer types
        params.append("categories", "COMPUTER,LAPTOP,MONITOR");
      }

      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/asset?${params}`);
      const data = await response.json();

      setAssets(data.assets || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, statusFilter, categoryFilter]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "LAPTOP":
        return <Laptop className="w-12 h-12 text-blue-500" />;
      case "MONITOR":
        return <Monitor className="w-12 h-12 text-purple-500" />;
      case "COMPUTER":
        return <Package className="w-12 h-12 text-indigo-500" />;
      default:
        return <Package className="w-12 h-12 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      AVAILABLE: "border-green-500 bg-green-50 text-green-700",
      IN_USE: "border-blue-500 bg-blue-50 text-blue-700",
      MAINTENANCE: "border-yellow-500 bg-yellow-50 text-yellow-700",
      RETIRED: "border-gray-500 bg-gray-50 text-gray-700",
      LOST: "border-red-500 bg-red-50 text-red-700",
      DAMAGED: "border-red-500 bg-red-50 text-red-700",
      RESERVED: "border-purple-500 bg-purple-50 text-purple-700",
    };
    return (
      colors[status as keyof typeof colors] ||
      "border-gray-300 bg-gray-50 text-gray-700"
    );
  };

  const getConditionColor = (condition: string) => {
    const colors = {
      EXCELLENT: "text-green-600",
      GOOD: "text-blue-600",
      FAIR: "text-yellow-600",
      POOR: "text-orange-600",
      NEEDS_REPAIR: "text-red-600",
    };
    return colors[condition as keyof typeof colors] || "text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Computers & Laptops
              </h1>
            </div>
            <div className="flex gap-3">
              <Link href="/assets">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Back to All Assets
                </button>
              </Link>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search computers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="COMPUTER">Desktop Computers</option>
              <option value="LAPTOP">Laptops</option>
              <option value="MONITOR">Monitors</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="IN_USE">In Use</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="RETIRED">Retired</option>
              <option value="DAMAGED">Damaged</option>
              <option value="LOST">Lost</option>
              <option value="RESERVED">Reserved</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              More Filters
            </button>
          </div>
        </div>

        {/* Asset Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : assets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No computers found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters
            </p>
            <Link href="/assets">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto">
                <Plus className="w-5 h-5" />
                <span>View All Assets</span>
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    {/* Icon and Title */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(asset.category)}
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {asset.name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {asset.assetTag}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      {asset.brand && asset.model && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Model:</span>{" "}
                          {asset.brand} {asset.model}
                        </p>
                      )}
                      {asset.serialNumber && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">S/N:</span>{" "}
                          {asset.serialNumber}
                        </p>
                      )}
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">
                          Condition:
                        </span>{" "}
                        <span
                          className={`font-medium ${getConditionColor(
                            asset.condition
                          )}`}
                        >
                          {asset.condition}
                        </span>
                      </p>
                      {asset.location && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Location:</span>{" "}
                          {asset.location}
                        </p>
                      )}
                      {(asset.assignedTo || asset.assignedToName) && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Assigned to:</span>{" "}
                          {asset.assignedTo?.name || asset.assignedToName}
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          asset.status
                        )}`}
                      >
                        {asset.status.replace("_", " ")}
                      </span>
                      <Link
                        href={`/assets/${asset.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
