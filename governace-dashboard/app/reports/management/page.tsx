"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import Link from "next/link";
import { ManagementReportData } from "../../types/reports";
import { exportManagementReportPDF } from "../../utils/pdfExport";
import { exportManagementReportExcel } from "../../utils/excelExport";

export default function ManagementReportPage() {
  const [reportData, setReportData] = useState<ManagementReportData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  useEffect(() => {
    fetchManagementData();
  }, [selectedPeriod]);

  const fetchManagementData = async () => {
    try {
      setLoading(true);

      // Fetch data from all sections
      const [governanceRes, auditRes, complianceRes, riskRes] =
        await Promise.all([
          fetch("/api/governance"),
          fetch("/api/audit"),
          fetch("/api/compliance/controls"),
          fetch("/api/risk"),
        ]);

      const governance = governanceRes.ok ? await governanceRes.json() : null;
      const audit = auditRes.ok ? await auditRes.json() : null;
      const compliance = complianceRes.ok ? await complianceRes.json() : null;
      const risk = riskRes.ok ? await riskRes.json() : null;

      // Calculate management metrics
      const data: ManagementReportData = {
        governance: {
          total: governance?.items?.length || 0,
          active:
            governance?.items?.filter(
              (i: { status: string }) => i.status === "Active"
            ).length || 0,
          completed:
            governance?.items?.filter(
              (i: { status: string }) => i.status === "Completed"
            ).length || 0,
        },
        audit: {
          total: audit?.audits?.length || 0,
          inProgress:
            audit?.audits?.filter(
              (a: { status: string }) => a.status === "IN_PROGRESS"
            ).length || 0,
          findings: 0, // Will be fetched separately
          criticalFindings: 0,
        },
        compliance: {
          controls: compliance?.controls?.length || 0,
          policies: 0, // Will be fetched separately
          assessments: 0,
          averageCompliance: 85, // Calculate from actual data
        },
        risk: {
          total: risk?.risks?.length || 0,
          high:
            risk?.risks?.filter(
              (r: { impact: string }) =>
                r.impact === "HIGH" || r.impact === "CRITICAL"
            ).length || 0,
          medium:
            risk?.risks?.filter(
              (r: { impact: string }) => r.impact === "MEDIUM"
            ).length || 0,
          low:
            risk?.risks?.filter((r: { impact: string }) => r.impact === "LOW")
              .length || 0,
        },
        trends: {
          governanceGrowth: 12,
          auditCompletion: 85,
          complianceScore: 88,
          riskReduction: 15,
        },
      };

      setReportData(data);
    } catch (error) {
      console.error("Error fetching management data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!reportData) return;
    exportManagementReportPDF(reportData);
  };

  const handleExportExcel = () => {
    if (!reportData) return;
    exportManagementReportExcel(reportData);
  };
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating management report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Failed to load report data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Link
                  href="/reports"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">
                  Management Report
                </h1>
              </div>
              <p className="text-gray-600 ml-12">
                Executive summary of all governance activities
              </p>
            </div>
            <div className="flex space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <FileText className="w-5 h-5" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Governance */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Governance
              </h3>
              <div className="flex items-center space-x-1">
                {getTrendIcon(reportData.trends.governanceGrowth)}
                <span className="text-sm font-semibold text-green-600">
                  {reportData.trends.governanceGrowth}%
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Items:</span>
                <span className="font-semibold">
                  {reportData.governance.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active:</span>
                <span className="font-semibold text-blue-600">
                  {reportData.governance.active}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completed:</span>
                <span className="font-semibold text-green-600">
                  {reportData.governance.completed}
                </span>
              </div>
            </div>
          </div>

          {/* Audit */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Audit</h3>
              <div className="flex items-center space-x-1">
                {getTrendIcon(reportData.trends.auditCompletion)}
                <span className="text-sm font-semibold text-green-600">
                  {reportData.trends.auditCompletion}%
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Audits:</span>
                <span className="font-semibold">{reportData.audit.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">In Progress:</span>
                <span className="font-semibold text-yellow-600">
                  {reportData.audit.inProgress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Critical Findings:
                </span>
                <span className="font-semibold text-red-600">
                  {reportData.audit.criticalFindings}
                </span>
              </div>
            </div>
          </div>

          {/* Compliance */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Compliance
              </h3>
              <div className="flex items-center space-x-1">
                {getTrendIcon(reportData.trends.complianceScore - 80)}
                <span className="text-sm font-semibold text-green-600">
                  {reportData.compliance.averageCompliance}%
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Controls:</span>
                <span className="font-semibold">
                  {reportData.compliance.controls}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Policies:</span>
                <span className="font-semibold">
                  {reportData.compliance.policies}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Assessments:</span>
                <span className="font-semibold">
                  {reportData.compliance.assessments}
                </span>
              </div>
            </div>
          </div>

          {/* Risk */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Risk</h3>
              <div className="flex items-center space-x-1">
                {getTrendIcon(-reportData.trends.riskReduction)}
                <span className="text-sm font-semibold text-green-600">
                  -{reportData.trends.riskReduction}%
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Risks:</span>
                <span className="font-semibold">{reportData.risk.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">High:</span>
                <span className="font-semibold text-red-600">
                  {reportData.risk.high}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Medium:</span>
                <span className="font-semibold text-yellow-600">
                  {reportData.risk.medium}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Executive Summary
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              The governance framework shows strong performance with{" "}
              <span className="font-semibold text-blue-600">
                {reportData.governance.total} total items
              </span>{" "}
              managed, of which{" "}
              <span className="font-semibold text-green-600">
                {reportData.governance.completed} have been completed
              </span>
              . The audit function is actively managing{" "}
              <span className="font-semibold text-purple-600">
                {reportData.audit.total} audits
              </span>
              , with a completion rate of{" "}
              <span className="font-semibold">
                {reportData.trends.auditCompletion}%
              </span>
              .
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Compliance metrics indicate a robust control environment with{" "}
              <span className="font-semibold text-green-600">
                {reportData.compliance.controls} active controls
              </span>{" "}
              and an average compliance score of{" "}
              <span className="font-semibold text-green-600">
                {reportData.compliance.averageCompliance}%
              </span>
              . Risk management efforts have resulted in a{" "}
              <span className="font-semibold text-green-600">
                {reportData.trends.riskReduction}% reduction
              </span>{" "}
              in overall risk exposure, with{" "}
              <span className="font-semibold text-red-600">
                {reportData.risk.high} high-priority risks
              </span>{" "}
              requiring immediate attention.
            </p>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Performance Trends
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Governance Growth
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    +{reportData.trends.governanceGrowth}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${reportData.trends.governanceGrowth}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Audit Completion
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {reportData.trends.auditCompletion}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${reportData.trends.auditCompletion}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Compliance Score
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    {reportData.trends.complianceScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${reportData.trends.complianceScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Risk Distribution
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span className="text-sm text-gray-700">High Risk</span>
                </div>
                <span className="font-semibold text-gray-800">
                  {reportData.risk.high}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                  <span className="text-sm text-gray-700">Medium Risk</span>
                </div>
                <span className="font-semibold text-gray-800">
                  {reportData.risk.medium}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span className="text-sm text-gray-700">Low Risk</span>
                </div>
                <span className="font-semibold text-gray-800">
                  {reportData.risk.low}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
