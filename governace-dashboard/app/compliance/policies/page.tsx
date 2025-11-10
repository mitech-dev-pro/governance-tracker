"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
} from "lucide-react";
import {
  Policy,
  POLICY_STATUSES,
  POLICY_CATEGORIES,
} from "../../types/compliance";
import CreatePolicyModal from "./CreatePolicyModal";
import EditPolicyModal from "./EditPolicyModal";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/compliance/policies");
      if (response.ok) {
        const data = await response.json();
        setPolicies(data.policies || []);
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...policies];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (policy) =>
          policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          policy.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          policy.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((policy) => policy.status === statusFilter);
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(
        (policy) => policy.category === categoryFilter
      );
    }

    setFilteredPolicies(filtered);
  }, [policies, searchTerm, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchPolicies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleEditPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setShowEditModal(true);
  };

  const handleDeletePolicy = () => {
    fetchPolicies();
  };

  // Calculate statistics
  const stats = {
    total: policies.length,
    published: policies.filter((p) => p.status === "PUBLISHED").length,
    draft: policies.filter((p) => p.status === "DRAFT").length,
    underReview: policies.filter((p) => p.status === "UNDER_REVIEW").length,
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusObj = POLICY_STATUSES.find((s) => s.value === status);
    return statusObj?.color || "gray";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-blue-600" />
              Policies Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage organizational policies and documentation
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>New Policy</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Policies
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats.total}
                </p>
              </div>
              <FileText className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Published</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats.published}
                </p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Under Review
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats.underReview}
                </p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Draft</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats.draft}
                </p>
              </div>
              <FileCheck className="w-12 h-12 text-gray-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {POLICY_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {POLICY_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Policies Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Policy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Effective Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPolicies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchTerm || statusFilter || categoryFilter
                          ? "No policies match your filters"
                          : "No policies found. Create your first policy to get started."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPolicies.map((policy) => (
                    <tr
                      key={policy.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleEditPolicy(policy)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {policy.code}
                          </div>
                          <div className="text-sm text-gray-500">
                            {policy.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {policy.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {policy.version}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {policy.owner?.name || policy.owner?.email || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {policy.effectiveDate
                            ? new Date(
                                policy.effectiveDate
                              ).toLocaleDateString()
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getStatusColor(
                            policy.status
                          )}-100 text-${getStatusColor(policy.status)}-800`}
                        >
                          {POLICY_STATUSES.find(
                            (s) => s.value === policy.status
                          )?.label || policy.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPolicy(policy);
                          }}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreatePolicyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchPolicies}
      />
      <EditPolicyModal
        isOpen={showEditModal}
        policy={selectedPolicy}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPolicy(null);
        }}
        onSuccess={fetchPolicies}
        onDelete={handleDeletePolicy}
      />
    </div>
  );
}
