"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  Shield,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { ComplianceReportData } from "../../types/reports";
import { exportToCSV, generateFilename } from "../../utils/exportHelpers";
import { exportToPDF } from "../../utils/pdfExport";
import { exportToExcel } from "../../utils/excelExport";

export default function ComplianceReportsPage() {
  const [reportData, setReportData] = useState<ComplianceReportData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("overview");

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const [controlsRes, policiesRes] = await Promise.all([
        fetch("/api/compliance/controls"),
        fetch("/api/compliance/policies"),
      ]);

      const controls = controlsRes.ok
        ? await controlsRes.json()
        : { controls: [] };
      const policies = policiesRes.ok
        ? await policiesRes.json()
        : { policies: [] };

      const controlsList = controls.controls || [];
      const policiesList = policies.policies || [];

      // Group controls by status
      const controlsByStatus = controlsList.reduce(
        (acc: Record<string, number>, c: { status: string }) => {
          acc[c.status] = (acc[c.status] || 0) + 1;
          return acc;
        },
        {}
      );

      // Group policies by status
      const policiesByStatus = policiesList.reduce(
        (acc: Record<string, number>, p: { status: string }) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        },
        {}
      );

      // Calculate effectiveness
      const totalControls = controlsList.length;
      const effectiveControls = controlsList.filter(
        (c: { status: string }) => c.status === "ACTIVE"
      ).length;
      const effectiveness =
        totalControls > 0
          ? Math.round((effectiveControls / totalControls) * 100)
          : 0;

      const reportData: ComplianceReportData = {
        controls: {
          total: totalControls,
          byStatus: controlsByStatus,
          byCategory: {}, // Will be populated when category data is available
          effective: effectiveControls,
          effectiveness,
        },
        policies: {
          total: policiesList.length,
          byStatus: policiesByStatus,
          byCategory: {}, // Will be populated when category data is available
          approved: policiesList.filter(
            (p: { status: string }) => p.status === "APPROVED"
          ).length,
        },
        assessments: {
          total: 0,
          byStatus: {},
          byResult: {},
          completed: 0,
          averageScore: 0,
        },
      };

      setReportData(reportData);
    } catch (error) {
      console.error("Error fetching compliance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    const data = [
      {
        Category: "Controls",
        Total: reportData.controls.total,
        Effective: reportData.controls.effective,
        "Effectiveness %": reportData.controls.effectiveness,
      },
      {
        Category: "Policies",
        Total: reportData.policies.total,
        Approved: reportData.policies.approved,
        "Effectiveness %": "N/A",
      },
      {
        Category: "Assessments",
        Total: reportData.assessments.total,
        Completed: reportData.assessments.completed,
        "Average Score": reportData.assessments.averageScore,
      },
    ];
    exportToCSV(data, generateFilename("compliance-report", "csv"));
  };

  const handleExportPDF = () => {
    if (!reportData) return;

    const data = [
      { Metric: "Total Controls", Value: reportData.controls.total },
      { Metric: "Effective Controls", Value: reportData.controls.effective },
      {
        Metric: "Control Effectiveness",
        Value: `${reportData.controls.effectiveness}%`,
      },
      { Metric: "Total Policies", Value: reportData.policies.total },
      { Metric: "Approved Policies", Value: reportData.policies.approved },
      { Metric: "Total Assessments", Value: reportData.assessments.total },
    ];

    exportToPDF({
      title: "Compliance Report",
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      data,
      fileName: "compliance-report.pdf",
    });
  };

  const handleExportExcel = () => {
    if (!reportData) return;

    const data = [
      {
        Category: "Controls",
        Total: reportData.controls.total,
        Effective: reportData.controls.effective,
        "Effectiveness %": reportData.controls.effectiveness,
      },
      {
        Category: "Policies",
        Total: reportData.policies.total,
        Approved: reportData.policies.approved,
      },
    ];

    exportToExcel(data, {
      fileName: "compliance-report.xlsx",
      sheetName: "Compliance Summary",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Link
                  href="/reports"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">
                  Compliance Reports
                </h1>
              </div>
              <p className="text-gray-600 ml-12">
                Controls, policies, and assessment analytics
              </p>
            </div>
            <div className="flex space-x-3">
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
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Selector */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedMetric("overview")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMetric === "overview"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedMetric("controls")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMetric === "controls"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Controls
            </button>
            <button
              onClick={() => setSelectedMetric("policies")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMetric === "policies"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Policies
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Total Controls
              </h3>
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {reportData?.controls.total || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Effectiveness
              </h3>
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {reportData?.controls.effectiveness || 0}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Total Policies
              </h3>
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {reportData?.policies.total || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Approved</h3>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {reportData?.policies.approved || 0}
            </p>
          </div>
        </div>

        {/* Overview Section */}
        {selectedMetric === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Control Effectiveness
              </h3>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Overall Effectiveness
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    {reportData?.controls.effectiveness}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${reportData?.controls.effectiveness}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-3 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Controls:</span>
                  <span className="font-semibold">
                    {reportData?.controls.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Effective Controls:
                  </span>
                  <span className="font-semibold text-green-600">
                    {reportData?.controls.effective}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Policy Compliance
              </h3>
              <div className="space-y-4">
                {Object.entries(reportData?.policies.byStatus || {}).map(
                  ([status, count]) => (
                    <div key={status}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {status}
                        </span>
                        <span className="text-sm font-semibold">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            status === "APPROVED"
                              ? "bg-green-600"
                              : status === "PENDING"
                              ? "bg-yellow-600"
                              : "bg-gray-600"
                          }`}
                          style={{
                            width: `${
                              ((count as number) /
                                (reportData?.policies.total || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Controls Detail */}
        {selectedMetric === "controls" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Controls by Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(reportData?.controls.byStatus || {}).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-600">
                        {status}
                      </h4>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          status === "ACTIVE"
                            ? "bg-green-500"
                            : status === "INACTIVE"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                      ></div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{count}</p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-green-600 h-1 rounded-full"
                          style={{
                            width: `${
                              ((count as number) /
                                (reportData?.controls.total || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Policies Detail */}
        {selectedMetric === "policies" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Policies by Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(reportData?.policies.byStatus || {}).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-600">
                        {status}
                      </h4>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          status === "APPROVED"
                            ? "bg-green-500"
                            : status === "PENDING"
                            ? "bg-yellow-500"
                            : status === "DRAFT"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                      ></div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{count}</p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-purple-600 h-1 rounded-full"
                          style={{
                            width: `${
                              ((count as number) /
                                (reportData?.policies.total || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            Compliance Summary
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Your organization maintains{" "}
            <span className="font-semibold text-green-700">
              {reportData?.controls.total} controls
            </span>{" "}
            with an effectiveness rate of{" "}
            <span className="font-semibold text-green-700">
              {reportData?.controls.effectiveness}%
            </span>
            . There are{" "}
            <span className="font-semibold text-purple-700">
              {reportData?.policies.total} policies
            </span>{" "}
            in place, with{" "}
            <span className="font-semibold text-green-700">
              {reportData?.policies.approved} approved
            </span>{" "}
            and ready for implementation.
          </p>
        </div>
      </div>
    </div>
  );
}
