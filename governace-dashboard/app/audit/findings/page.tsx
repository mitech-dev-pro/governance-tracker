"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import {
  AuditFinding,
  FINDING_SEVERITIES,
  FINDING_STATUSES,
  FINDING_CATEGORIES,
} from "../../types/audit";
import CreateFindingModal from "./CreateFindingModal";
import EditFindingModal from "./EditFindingModal";

export default function FindingsPage() {
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [filteredFindings, setFilteredFindings] = useState<AuditFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<AuditFinding | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchFindings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/audit/findings");
      if (response.ok) {
        const data = await response.json();
        setFindings(data.findings || []);
      }
    } catch (error) {
      console.error("Error fetching findings:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...findings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (finding) =>
          finding.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          finding.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          finding.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Severity filter
    if (severityFilter) {
      filtered = filtered.filter(
        (finding) => finding.severity === severityFilter
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((finding) => finding.status === statusFilter);
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(
        (finding) => finding.category === categoryFilter
      );
    }

    setFilteredFindings(filtered);
  }, [findings, searchTerm, severityFilter, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchFindings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleEditFinding = (finding: AuditFinding) => {
    setSelectedFinding(finding);
    setShowEditModal(true);
  };

  const handleDeleteFinding = () => {
    fetchFindings();
  };

  // Calculate statistics
  const stats = {
    total: findings.length,
    critical: findings.filter((f) => f.severity === "CRITICAL").length,
    high: findings.filter((f) => f.severity === "HIGH").length,
    medium: findings.filter((f) => f.severity === "MEDIUM").length,
    open: findings.filter((f) => f.status === "OPEN").length,
    resolved: findings.filter((f) => f.status === "RESOLVED").length,
  };

  // Get severity icon and color
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertTriangle className="w-4 h-4" />;
      case "HIGH":
        return <AlertCircle className="w-4 h-4" />;
      case "MEDIUM":
        return <Info className="w-4 h-4" />;
      case "LOW":
        return <Info className="w-4 h-4" />;
      case "INFORMATIONAL":
        return <Info className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Link
                  href="/audit"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <span>Audit Findings</span>
                </h1>
              </div>
              <p className="text-gray-600 ml-12">
                Track and manage audit findings with severity-based
                prioritization
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Finding</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.total}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-gray-600" />
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
                <AlertTriangle className="w-8 h-8 text-red-600" />
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
                <AlertCircle className="w-8 h-8 text-orange-600" />
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
                <Info className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.open}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.resolved}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search findings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Severity Filter */}
              <div>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">All Severities</option>
                  {FINDING_SEVERITIES.map((severity) => (
                    <option key={severity.value} value={severity.value}>
                      {severity.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  {FINDING_STATUSES.map((status) => (
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {FINDING_CATEGORIES.map((category) => (
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading findings...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Finding
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Audit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsible
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFindings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No findings found. Create one to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredFindings.map((finding) => {
                      const severity = FINDING_SEVERITIES.find(
                        (s) => s.value === finding.severity
                      );
                      const status = FINDING_STATUSES.find(
                        (s) => s.value === finding.status
                      );

                      return (
                        <tr
                          key={finding.id}
                          onClick={() => handleEditFinding(finding)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 truncate max-w-xs">
                              {finding.title}
                            </div>
                            <div className="text-sm text-gray-600 truncate max-w-xs">
                              {finding.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {finding.audit
                              ? `${finding.audit.code} - ${finding.audit.title}`
                              : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${severity?.color}-100 text-${severity?.color}-800 space-x-1`}
                            >
                              {getSeverityIcon(finding.severity)}
                              <span>{severity?.label}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {finding.category}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {finding.responsible
                              ? finding.responsible.name ||
                                finding.responsible.email
                              : "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {finding.dueDate
                              ? new Date(finding.dueDate).toLocaleDateString()
                              : "—"}
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
      <CreateFindingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchFindings}
      />

      <EditFindingModal
        isOpen={showEditModal}
        finding={selectedFinding}
        onClose={() => {
          setShowEditModal(false);
          setSelectedFinding(null);
        }}
        onSuccess={fetchFindings}
        onDelete={handleDeleteFinding}
      />
    </div>
  );
}
