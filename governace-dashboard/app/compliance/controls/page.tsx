"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Shield,
  TrendingUp,
  CheckCircle2,
  Clock,
  Activity,
} from "lucide-react";
import {
  Control,
  CONTROL_STATUSES,
  CONTROL_CATEGORIES,
} from "../../types/compliance";
import CreateControlModal from "./CreateControlModal";
import EditControlModal from "./EditControlModal";

export default function ControlsPage() {
  const [controls, setControls] = useState<Control[]>([]);
  const [filteredControls, setFilteredControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchControls = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/compliance/controls");
      if (response.ok) {
        const data = await response.json();
        setControls(data.controls || []);
      }
    } catch (error) {
      console.error("Error fetching controls:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...controls];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (control) =>
          control.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          control.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          control.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((control) => control.status === statusFilter);
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(
        (control) => control.category === categoryFilter
      );
    }

    setFilteredControls(filtered);
  }, [controls, searchTerm, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchControls();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleEditControl = (control: Control) => {
    setSelectedControl(control);
    setShowEditModal(true);
  };

  const handleDeleteControl = () => {
    fetchControls();
  };

  // Calculate statistics
  const stats = {
    total: controls.length,
    active: controls.filter((c) => c.status === "ACTIVE").length,
    underReview: controls.filter((c) => c.status === "UNDER_REVIEW").length,
    highEffectiveness: controls.filter((c) => (c.effectiveness || 0) >= 80)
      .length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                <Shield className="w-8 h-8 text-blue-600" />
                <span>Control Management</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and monitor organizational controls and their
                effectiveness
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Control</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Controls</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.total}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.active}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.underReview}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">High Effectiveness</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.highEffectiveness}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search controls..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  {CONTROL_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {CONTROL_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading controls...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Control
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Effectiveness
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredControls.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No controls found. Create one to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredControls.map((control) => {
                      const status = CONTROL_STATUSES.find(
                        (s) => s.value === control.status
                      );

                      return (
                        <tr
                          key={control.id}
                          onClick={() => handleEditControl(control)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {control.code}
                            </div>
                            <div className="text-sm text-gray-600 truncate max-w-xs">
                              {control.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {control.category}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {control.owner
                              ? control.owner.name || control.owner.email
                              : "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {control.frequency.replace("_", " ")}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {control.effectiveness ? (
                              <span
                                className={`text-sm font-semibold ${
                                  control.effectiveness >= 80
                                    ? "text-green-600"
                                    : control.effectiveness >= 60
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                {control.effectiveness}%
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${status?.color}-100 text-${status?.color}-800`}
                            >
                              {status?.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateControlModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchControls}
      />

      <EditControlModal
        isOpen={showEditModal}
        control={selectedControl}
        onClose={() => {
          setShowEditModal(false);
          setSelectedControl(null);
        }}
        onSuccess={fetchControls}
        onDelete={handleDeleteControl}
      />
    </div>
  );
}
