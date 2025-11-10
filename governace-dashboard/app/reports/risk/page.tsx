"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { RiskReportData } from "../../types/reports";
import { exportToCSV, generateFilename } from "../../utils/exportHelpers";
import { exportToPDF } from "../../utils/pdfExport";
import { exportToExcel } from "../../utils/excelExport";

export default function RiskReportsPage() {
  const [reportData, setReportData] = useState<RiskReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState("overview");

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/risk");
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      const risks = data.risks || [];

      // Group by status
      const byStatus = risks.reduce(
        (acc: Record<string, number>, r: { status: string }) => {
          acc[r.status] = (acc[r.status] || 0) + 1;
          return acc;
        },
        {}
      );

      // Group by category
      const byCategory = risks.reduce(
        (acc: Record<string, number>, r: { category: string }) => {
          acc[r.category] = (acc[r.category] || 0) + 1;
          return acc;
        },
        {}
      );

      // Group by impact
      const byImpact = risks.reduce(
        (acc: Record<string, number>, r: { impact: string }) => {
          acc[r.impact] = (acc[r.impact] || 0) + 1;
          return acc;
        },
        {}
      );

      // Group by likelihood
      const byLikelihood = risks.reduce(
        (acc: Record<string, number>, r: { likelihood: string }) => {
          acc[r.likelihood] = (acc[r.likelihood] || 0) + 1;
          return acc;
        },
        {}
      );

      // High risks
      const highRisks = risks.filter(
        (r: { impact: string; likelihood: string }) =>
          (r.impact === "HIGH" || r.impact === "CRITICAL") &&
          (r.likelihood === "HIGH" || r.likelihood === "LIKELY")
      );

      const reportData: RiskReportData = {
        totalRisks: risks.length,
        byStatus,
        byCategory,
        byImpact,
        byLikelihood,
        highRisks,
        mitigations: [],
      };

      setReportData(reportData);
    } catch (error) {
      console.error("Error fetching risk data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    const data = [
      { Metric: "Total Risks", Value: reportData.totalRisks },
      { Metric: "High Priority Risks", Value: reportData.highRisks.length },
      { Metric: "Critical Impact", Value: reportData.byImpact.CRITICAL || 0 },
      { Metric: "High Impact", Value: reportData.byImpact.HIGH || 0 },
    ];
    exportToCSV(data, generateFilename("risk-report", "csv"));
  };

  const handleExportPDF = () => {
    if (!reportData) return;

    const data = [
      { Metric: "Total Risks", Value: reportData.totalRisks },
      { Metric: "High Priority Risks", Value: reportData.highRisks.length },
      { Metric: "Critical Impact", Value: reportData.byImpact.CRITICAL || 0 },
      { Metric: "High Impact", Value: reportData.byImpact.HIGH || 0 },
      { Metric: "Medium Impact", Value: reportData.byImpact.MEDIUM || 0 },
      { Metric: "Low Impact", Value: reportData.byImpact.LOW || 0 },
    ];

    exportToPDF({
      title: "Risk Report",
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      data,
      fileName: "risk-report.pdf",
    });
  };

  const handleExportExcel = () => {
    if (!reportData) return;

    const summaryData = [
      { Metric: "Total Risks", Value: reportData.totalRisks },
      { Metric: "High Priority", Value: reportData.highRisks.length },
      { Metric: "Critical", Value: reportData.byImpact.CRITICAL || 0 },
      { Metric: "High", Value: reportData.byImpact.HIGH || 0 },
      { Metric: "Medium", Value: reportData.byImpact.MEDIUM || 0 },
      { Metric: "Low", Value: reportData.byImpact.LOW || 0 },
    ];

    exportToExcel(summaryData, {
      fileName: "risk-report.xlsx",
      sheetName: "Risk Summary",
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-300";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
                  Risk Reports
                </h1>
              </div>
              <p className="text-gray-600 ml-12">
                Risk assessment and mitigation analytics
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
              onClick={() => setSelectedView("overview")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedView === "overview"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedView("matrix")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedView === "matrix"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Risk Matrix
            </button>
            <button
              onClick={() => setSelectedView("high-risks")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedView === "high-risks"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              High Priority
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Total Risks
            </h3>
            <p className="text-3xl font-bold text-orange-600">
              {reportData?.totalRisks || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Critical</h3>
            <p className="text-3xl font-bold text-red-600">
              {reportData?.byImpact.CRITICAL || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">High</h3>
            <p className="text-3xl font-bold text-orange-600">
              {reportData?.byImpact.HIGH || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Medium</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {reportData?.byImpact.MEDIUM || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Low</h3>
            <p className="text-3xl font-bold text-green-600">
              {reportData?.byImpact.LOW || 0}
            </p>
          </div>
        </div>

        {/* Overview Section */}
        {selectedView === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Risk Distribution by Impact
              </h3>
              <div className="space-y-4">
                {Object.entries(reportData?.byImpact || {}).map(
                  ([impact, count]) => (
                    <div key={impact}>
                      <div className="flex justify-between mb-2">
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded border ${getImpactColor(
                            impact
                          )}`}
                        >
                          {impact}
                        </span>
                        <span className="text-sm font-semibold">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            impact === "CRITICAL"
                              ? "bg-red-600"
                              : impact === "HIGH"
                              ? "bg-orange-600"
                              : impact === "MEDIUM"
                              ? "bg-yellow-600"
                              : "bg-green-600"
                          }`}
                          style={{
                            width: `${
                              ((count as number) /
                                (reportData?.totalRisks || 1)) *
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

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Risk by Category
              </h3>
              <div className="space-y-4">
                {Object.entries(reportData?.byCategory || {}).map(
                  ([category, count]) => (
                    <div key={category}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {category}
                        </span>
                        <span className="text-sm font-semibold">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{
                            width: `${
                              ((count as number) /
                                (reportData?.totalRisks || 1)) *
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

        {/* Risk Matrix Section */}
        {selectedView === "matrix" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              Risk Matrix
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4">
                  By Impact Level
                </h4>
                <div className="space-y-3">
                  {Object.entries(reportData?.byImpact || {}).map(
                    ([impact, count]) => (
                      <div
                        key={impact}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              impact === "CRITICAL"
                                ? "bg-red-500"
                                : impact === "HIGH"
                                ? "bg-orange-500"
                                : impact === "MEDIUM"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                          ></div>
                          <span className="font-medium text-gray-700">
                            {impact}
                          </span>
                        </div>
                        <span className="text-lg font-bold">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4">
                  By Likelihood
                </h4>
                <div className="space-y-3">
                  {Object.entries(reportData?.byLikelihood || {}).map(
                    ([likelihood, count]) => (
                      <div
                        key={likelihood}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <TrendingDown className="w-4 h-4 text-orange-600" />
                          <span className="font-medium text-gray-700">
                            {likelihood}
                          </span>
                        </div>
                        <span className="text-lg font-bold">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* High Priority Risks */}
        {selectedView === "high-risks" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-red-50">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-bold text-gray-800">
                  High Priority Risks Requiring Immediate Attention
                </h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Risk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Impact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Likelihood
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData?.highRisks.map(
                    (risk: {
                      id: string;
                      title: string;
                      category: string;
                      impact: string;
                      likelihood: string;
                      status: string;
                    }) => (
                      <tr key={risk.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {risk.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {risk.category}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded border ${getImpactColor(
                              risk.impact
                            )}`}
                          >
                            {risk.impact}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {risk.likelihood}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {risk.status}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            Risk Assessment Summary
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Your organization is currently tracking{" "}
            <span className="font-semibold text-orange-700">
              {reportData?.totalRisks} risks
            </span>
            , with{" "}
            <span className="font-semibold text-red-700">
              {reportData?.highRisks.length} high-priority risks
            </span>{" "}
            requiring immediate attention. The risk portfolio includes{" "}
            <span className="font-semibold text-red-700">
              {reportData?.byImpact.CRITICAL || 0} critical
            </span>{" "}
            and{" "}
            <span className="font-semibold text-orange-700">
              {reportData?.byImpact.HIGH || 0} high-impact
            </span>{" "}
            risks that should be prioritized for mitigation efforts.
          </p>
        </div>
      </div>
    </div>
  );
}
