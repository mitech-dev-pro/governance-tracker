"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  ClipboardCheck,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Assessment,
  ASSESSMENT_STATUSES,
  ASSESSMENT_RESULTS,
} from "../../types/compliance";
import CreateAssessmentModal from "./CreateAssessmentModal";
import EditAssessmentModal from "./EditAssessmentModal";

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("");

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/compliance/assessments");
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...assessments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (assessment) =>
          assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assessment.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(
        (assessment) => assessment.status === statusFilter
      );
    }

    // Result filter
    if (resultFilter) {
      filtered = filtered.filter(
        (assessment) => assessment.result === resultFilter
      );
    }

    setFilteredAssessments(filtered);
  }, [assessments, searchTerm, statusFilter, resultFilter]);

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleEditAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setShowEditModal(true);
  };

  const handleDeleteAssessment = () => {
    fetchAssessments();
  };

  // Calculate statistics
  const stats = {
    total: assessments.length,
    scheduled: assessments.filter((a) => a.status === "SCHEDULED").length,
    completed: assessments.filter((a) => a.status === "COMPLETED").length,
    passed: assessments.filter((a) => a.result === "PASSED").length,
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusObj = ASSESSMENT_STATUSES.find((s) => s.value === status);
    return statusObj?.color || "gray";
  };

  const getResultColor = (result: string | null | undefined) => {
    if (!result) return "gray";
    const resultObj = ASSESSMENT_RESULTS.find((r) => r.value === result);
    return resultObj?.color || "gray";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessments...</p>
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
              <ClipboardCheck className="w-8 h-8 mr-3 text-blue-600" />
              Compliance Assessments
            </h1>
            <p className="text-gray-600 mt-2">
              Schedule and track compliance assessments
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>New Assessment</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Assessments
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats.total}
                </p>
              </div>
              <ClipboardCheck className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Scheduled</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats.scheduled}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Completed</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Passed</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats.passed}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-emerald-500 opacity-20" />
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
                placeholder="Search assessments..."
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
              {ASSESSMENT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Result Filter */}
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Results</option>
              {ASSESSMENT_RESULTS.map((result) => (
                <option key={result.value} value={result.value}>
                  {result.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assessments Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Control
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssessments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchTerm || statusFilter || resultFilter
                          ? "No assessments match your filters"
                          : "No assessments found. Create your first assessment to get started."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAssessments.map((assessment) => (
                    <tr
                      key={assessment.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleEditAssessment(assessment)}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {assessment.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {assessment.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {assessment.control?.code || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {assessment.assessor?.name ||
                            assessment.assessor?.email ||
                            "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {assessment.scheduledDate
                            ? new Date(
                                assessment.scheduledDate
                              ).toLocaleDateString()
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {assessment.score !== null &&
                          assessment.score !== undefined
                            ? `${assessment.score}%`
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getStatusColor(
                            assessment.status
                          )}-100 text-${getStatusColor(assessment.status)}-800`}
                        >
                          {ASSESSMENT_STATUSES.find(
                            (s) => s.value === assessment.status
                          )?.label || assessment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {assessment.result ? (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getResultColor(
                              assessment.result
                            )}-100 text-${getResultColor(
                              assessment.result
                            )}-800`}
                          >
                            {ASSESSMENT_RESULTS.find(
                              (r) => r.value === assessment.result
                            )?.label || assessment.result}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
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
      <CreateAssessmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchAssessments}
      />
      <EditAssessmentModal
        isOpen={showEditModal}
        assessment={selectedAssessment}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAssessment(null);
        }}
        onSuccess={fetchAssessments}
        onDelete={handleDeleteAssessment}
      />
    </div>
  );
}
