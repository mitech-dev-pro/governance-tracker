"use client";

import { useState, useEffect } from "react";
import {
  AppWindow,
  Search,
  Plus,
  Download,
  ExternalLink,
  User,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import CreateApplicationModal from "../../components/CreateApplicationModal";

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
  description?: string;
  notes?: string;
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
  warrantyExpiry?: string;
}

export default function ApplicationsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        category: "SOFTWARE_LICENSE", // Filter for software licenses only
      });

      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/asset?${params}`);
      const data = await response.json();

      setAssets(data.assets || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, statusFilter]);

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

  const extractUrl = (text?: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <AppWindow className="h-8 w-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Software Applications
              </h1>
            </div>
            <div className="flex gap-3">
              <Link href="/assets">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Back to All Assets
                </button>
              </Link>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Application</span>
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              More Filters
            </button>
          </div>
        </div>

        {/* Application Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : assets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AppWindow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No applications found
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first software application to get started
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Application</span>
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {assets.map((asset) => {
                const appUrl = extractUrl(asset.notes || asset.description);

                return (
                  <div
                    key={asset.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                            <AppWindow className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {asset.name}
                              </h3>
                              {appUrl && (
                                <a
                                  href={appUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700"
                                  title="Open application"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {asset.assetTag}
                            </span>
                            {asset.brand && (
                              <p className="text-sm text-gray-600 mt-1">
                                by {asset.brand}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(
                            asset.status
                          )}`}
                        >
                          {asset.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Description */}
                      {asset.description && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {asset.description}
                          </p>
                        </div>
                      )}

                      {/* Application Details */}
                      <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                        {asset.type && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700">
                              Type:
                            </span>
                            <span className="text-gray-600">{asset.type}</span>
                          </div>
                        )}

                        {(asset.assignedTo || asset.assignedToName) && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-700">
                              Owner:
                            </span>
                            <span className="text-gray-600">
                              {asset.assignedTo?.name || asset.assignedToName}
                            </span>
                          </div>
                        )}

                        {asset.department && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700">
                              Department:
                            </span>
                            <span className="text-gray-600">
                              {asset.department.name}
                            </span>
                          </div>
                        )}

                        {asset.serialNumber && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700">
                              License Key:
                            </span>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                              {asset.serialNumber}
                            </code>
                          </div>
                        )}

                        {appUrl && (
                          <div className="flex items-center gap-2 text-sm">
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-700">
                              URL:
                            </span>
                            <a
                              href={appUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 hover:underline truncate"
                            >
                              {appUrl.replace(/^https?:\/\//, "")}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* License & Purchase Info */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {asset.purchaseDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">
                                Purchase Date
                              </p>
                              <p className="text-gray-700 font-medium">
                                {new Date(
                                  asset.purchaseDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}

                        {asset.warrantyExpiry && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">
                                License Expiry
                              </p>
                              <p
                                className={`font-medium ${
                                  new Date(asset.warrantyExpiry) < new Date()
                                    ? "text-red-600"
                                    : "text-gray-700"
                                }`}
                              >
                                {new Date(
                                  asset.warrantyExpiry
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        {asset.purchaseCost && (
                          <span className="text-sm font-semibold text-gray-900">
                            ${asset.purchaseCost.toLocaleString()}
                          </span>
                        )}
                        <Link
                          href={`/assets/${asset.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-auto"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
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

      <CreateApplicationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchAssets}
      />
    </div>
  );
}
