"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  ClipboardCheck,
  TrendingUp,
  CheckCircle2,
  Clock,
  Activity,
  FileText,
  Calendar,
} from "lucide-react";
import { Audit, AUDIT_TYPES, AUDIT_STATUSES } from "../types/audit";
import Link from "next/link";
import CreateAuditModal from "./CreateAuditModal";
import EditAuditModal from "./EditAuditModal";

export default function AuditPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [filteredAudits, setFilteredAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/audit");
      if (response.ok) {
        const data = await response.json();
        setAudits(data.audits || []);
      }
    } catch (error) {
      console.error("Error fetching audits:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...audits];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (audit) =>
          audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          audit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          audit.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((audit) => audit.status === statusFilter);
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter((audit) => audit.type === typeFilter);
    }

    // Department filter
    if (departmentFilter) {
      filtered = filtered.filter(
        (audit) =>
          audit.department && audit.department.id === parseInt(departmentFilter)
      );
    }

    setFilteredAudits(filtered);
  }, [audits, searchTerm, statusFilter, typeFilter, departmentFilter]);

  useEffect(() => {
    fetchAudits();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleEditAudit = (audit: Audit) => {
    setSelectedAudit(audit);
    setShowEditModal(true);
  };

  const handleDeleteAudit = () => {
    fetchAudits();
  };

  // Calculate statistics
  const stats = {
    total: audits.length,
    inProgress: audits.filter((a) => a.status === "IN_PROGRESS").length,
    fieldWork: audits.filter((a) => a.status === "FIELD_WORK").length,
    completed: audits.filter((a) => a.status === "COMPLETED").length,
  };

  // Get unique departments from audits
  const departments = Array.from(
    new Map(
      audits
        .filter((a) => a.department)
        .map((a) => [a.department!.id, a.department!])
    ).values()
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                <ClipboardCheck className="w-8 h-8 text-purple-600" />
                <span>Audit Management</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Manage audits, findings, and schedules
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/audit/findings"
                className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors flex items-center space-x-2 border border-purple-300"
              >
                <FileText className="w-5 h-5" />
                <span>Findings</span>
              </Link>
              <Link
                href="/audit/schedules"
                className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors flex items-center space-x-2 border border-purple-300"
              >
                <Calendar className="w-5 h-5" />
                <span>Schedules</span>
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Audit</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Audits</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.total}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
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
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Field Work</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.fieldWork}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completed}
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
                    placeholder="Search audits..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  {AUDIT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {AUDIT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id.toString()}>
                      {dept.name}
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading audits...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Audit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead Auditor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAudits.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No audits found. Create one to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredAudits.map((audit) => {
                      const status = AUDIT_STATUSES.find(
                        (s) => s.value === audit.status
                      );
                      const type = AUDIT_TYPES.find(
                        (t) => t.value === audit.type
                      );

                      return (
                        <tr
                          key={audit.id}
                          onClick={() => handleEditAudit(audit)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {audit.code}
                            </div>
                            <div className="text-sm text-gray-600 truncate max-w-xs">
                              {audit.title}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${type?.color}-100 text-${type?.color}-800`}
                            >
                              {type?.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {audit.leadAuditor
                              ? audit.leadAuditor.name ||
                                audit.leadAuditor.email
                              : "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {audit.department ? audit.department.name : "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(audit.startDate).toLocaleDateString()} -{" "}
                            {new Date(audit.endDate).toLocaleDateString()}
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
      <CreateAuditModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchAudits}
      />

      <EditAuditModal
        isOpen={showEditModal}
        audit={selectedAudit}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAudit(null);
        }}
        onSuccess={fetchAudits}
        onDelete={handleDeleteAudit}
      />
    </div>
  );
}
