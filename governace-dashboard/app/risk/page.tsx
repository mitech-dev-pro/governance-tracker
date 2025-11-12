"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
} from "lucide-react";
import { Risk, RISK_STATUSES, getRiskColor, getRiskLevel } from "../types/risk";
import RiskMatrix from "../components/RiskMatrix";
import CreateRiskModal from "./CreateRiskModal";
import EditRiskModal from "./EditRiskModal";

export default function RiskManagementPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [filteredRisks, setFilteredRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "matrix">("list");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [riskLevelFilter, setRiskLevelFilter] = useState("");

  // For dropdowns
  const [departments, setDepartments] = useState<
    Array<{ id: number; name: string }>
  >([]);

  useEffect(() => {
    fetchRisks();
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [risks, searchTerm, statusFilter, departmentFilter, riskLevelFilter]);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/risk");
      if (response.ok) {
        const data = await response.json();
        setRisks(data.risks || []);
      }
    } catch (error) {
      console.error("Error fetching risks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...risks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (risk) =>
          risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          risk.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((risk) => risk.status === statusFilter);
    }

    // Department filter
    if (departmentFilter) {
      filtered = filtered.filter(
        (risk) => risk.departmentId === parseInt(departmentFilter)
      );
    }

    // Risk level filter
    if (riskLevelFilter) {
      filtered = filtered.filter((risk) => {
        const level = getRiskLevel(risk.rating);
        return level === riskLevelFilter;
      });
    }

    setFilteredRisks(filtered);
  };

  const handleEditRisk = (risk: Risk) => {
    setSelectedRisk(risk);
    setShowEditModal(true);
  };

  const handleDeleteRisk = () => {
    fetchRisks();
  };

  // Calculate statistics
  const stats = {
    total: risks.length,
    critical: risks.filter((r) => r.rating >= 20).length,
    high: risks.filter((r) => r.rating >= 15 && r.rating < 20).length,
    medium: risks.filter((r) => r.rating >= 10 && r.rating < 15).length,
    inProgress: risks.filter((r) => r.status === "IN_PROGRESS").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
                <span>Risk Management</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Identify, assess, and manage organizational risks
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Risk</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Risks</p>
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
                  <p className="text-sm text-gray-600">Critical</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.critical}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">High</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.high}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Medium</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.medium}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.inProgress}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Filters and View Toggle */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search risks..."
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
                  {RISK_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Risk Level Filter */}
              <div>
                <select
                  value={riskLevelFilter}
                  onChange={(e) => setRiskLevelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Risk Levels</option>
                  <option value="Critical">Critical (20-25)</option>
                  <option value="High">High (15-19)</option>
                  <option value="Medium">Medium (10-14)</option>
                  <option value="Low">Low (5-9)</option>
                  <option value="Very Low">Very Low (1-4)</option>
                </select>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">View:</span>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode("matrix")}
                className={`px-3 py-1 rounded ${
                  viewMode === "matrix"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Risk Matrix
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading risks...</p>
          </div>
        ) : viewMode === "matrix" ? (
          <RiskMatrix risks={filteredRisks} onRiskClick={handleEditRisk} />
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impact
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Likelihood
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRisks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No risks found. Create one to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredRisks.map((risk) => {
                      const riskColor = getRiskColor(risk.rating);
                      const riskLevel = getRiskLevel(risk.rating);
                      const status = RISK_STATUSES.find(
                        (s) => s.value === risk.status
                      );

                      return (
                        <tr
                          key={risk.id}
                          onClick={() => handleEditRisk(risk)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {risk.title}
                            </div>
                            {risk.notes && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {risk.notes}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {risk.owner
                              ? risk.owner.name || risk.owner.email
                              : "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {risk.department?.name || "—"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-semibold">
                              {risk.impact}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-semibold">
                              {risk.likelihood}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-center">
                              <span
                                className={`text-lg font-bold text-${riskColor}-700`}
                              >
                                {risk.rating}
                              </span>
                              <span className={`text-xs text-${riskColor}-600`}>
                                {riskLevel}
                              </span>
                            </div>
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
      <CreateRiskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchRisks}
      />

      <EditRiskModal
        isOpen={showEditModal}
        risk={selectedRisk}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRisk(null);
        }}
        onSuccess={fetchRisks}
        onDelete={handleDeleteRisk}
      />
    </div>
  );
}
