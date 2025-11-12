"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Package,
  Monitor,
  Laptop,
  Printer,
  HardDrive,
  Headphones,
} from "lucide-react";
import CreateAssetModal from "../components/CreateAssetModal";
import Dropdown from "../components/Dropdown";

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
  department?: { id: number; name: string };
  assignedToName?: string; // Free text name
  assignedTo?: { id: number; name: string; email: string };
  purchaseDate?: string;
  purchaseCost?: number;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const CATEGORY_OPTIONS: { label: string; value: string }[] = [
    { value: "", label: "All Categories" },
    { value: "COMPUTER", label: "Computers" },
    { value: "LAPTOP", label: "Laptops" },
    { value: "MONITOR", label: "Monitors" },
    { value: "PRINTER", label: "Printers" },
    { value: "NETWORKING", label: "Networking (Turbonets)" },
    { value: "PERIPHERAL", label: "Peripherals (Headsets)" },
    { value: "CONSUMABLE", label: "Consumables (Toner)" },
  ];

  const STATUS_OPTIONS: { label: string; value: string }[] = [
    { value: "", label: "All Status" },
    { value: "AVAILABLE", label: "Available" },
    { value: "IN_USE", label: "In Use" },
    { value: "MAINTENANCE", label: "Maintenance" },
    { value: "RETIRED", label: "Retired" },
    { value: "DAMAGED", label: "Damaged" },
  ];

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (categoryFilter) params.append("category", categoryFilter);
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`/api/asset?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setAssets(data.assets || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "LAPTOP":
        return <Laptop className="w-5 h-5" />;
      case "COMPUTER":
        return <Monitor className="w-5 h-5" />;
      case "PRINTER":
        return <Printer className="w-5 h-5" />;
      case "PERIPHERAL":
        return <Headphones className="w-5 h-5" />;
      case "STORAGE":
        return <HardDrive className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800 border-green-300";
      case "IN_USE":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "RETIRED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "DAMAGED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "EXCELLENT":
        return "text-green-600";
      case "GOOD":
        return "text-blue-600";
      case "FAIR":
        return "text-yellow-600";
      case "POOR":
        return "text-orange-600";
      case "NEEDS_REPAIR":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading && assets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                <Package className="w-8 h-8 text-blue-600" />
                <span>Asset Management</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Track and manage IT assets, inventory, and equipment
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Asset</span>
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Dropdown
                onChange={(e) => setCategoryFilter(e)}
                options={CATEGORY_OPTIONS.map((cat) => ({
                  label: cat.label,
                  value: cat.value,
                }))}
                value={categoryFilter}
                borderShade="blue"
              />
              {/* <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="COMPUTER">Computers</option>
                <option value="LAPTOP">Laptops</option>
                <option value="MONITOR">Monitors</option>
                <option value="PRINTER">Printers</option>
                <option value="NETWORKING">Networking (Turbonets)</option>
                <option value="PERIPHERAL">Peripherals (Headsets)</option>
                <option value="CONSUMABLE">Consumables (Toner)</option>
              </select> */}
              <Dropdown
                onChange={(e) => setStatusFilter(e)}
                options={STATUS_OPTIONS.map((stat) => ({
                  label: stat.label,
                  value: stat.value,
                }))}
                value={categoryFilter}
                borderShade="blue"
              />
              {/* <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="IN_USE">In Use</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="RETIRED">Retired</option>
                <option value="DAMAGED">Damaged</option>
              </select> */}
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>More Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    {getCategoryIcon(asset.category)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {asset.name}
                    </h3>
                    <p className="text-sm text-gray-500">{asset.assetTag}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(
                    asset.status
                  )}`}
                >
                  {asset.status.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {asset.brand && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Brand:</span>
                    <span className="font-medium text-gray-800">
                      {asset.brand}
                    </span>
                  </div>
                )}
                {asset.model && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Model:</span>
                    <span className="font-medium text-gray-800">
                      {asset.model}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Condition:</span>
                  <span
                    className={`font-medium ${getConditionColor(
                      asset.condition
                    )}`}
                  >
                    {asset.condition.replace("_", " ")}
                  </span>
                </div>
                {asset.location && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-medium text-gray-800">
                      {asset.location}
                    </span>
                  </div>
                )}
                {(asset.assignedTo || asset.assignedToName) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Assigned To:</span>
                    <span className="font-medium text-gray-800">
                      {asset.assignedTo?.name || asset.assignedToName}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {asset.category.replace("_", " ")}
                </span>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && assets.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No assets found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first asset
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add Asset
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center space-x-2">
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
        )}
      </div>

      <CreateAssetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchAssets}
      />
    </div>
  );
}
