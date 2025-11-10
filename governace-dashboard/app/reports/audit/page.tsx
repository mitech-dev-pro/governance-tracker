"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { AuditReportData } from "../../types/reports";
import { exportToCSV, generateFilename } from "../../utils/exportHelpers";
import { exportToPDF } from "../../utils/pdfExport";
import { exportToExcel } from "../../utils/excelExport";

export default function AuditReportsPage() {
  const [reportData, setReportData] = useState<AuditReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState("overview");

  useEffect(() => {
    fetchAuditData();
  }, []);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      const [auditsRes, findingsRes, schedulesRes] = await Promise.all([
        fetch("/api/audit"),
        fetch("/api/audit/findings"),
        fetch("/api/audit/schedules"),
      ]);

      const audits = auditsRes.ok ? await auditsRes.json() : { audits: [] };
      const findings = findingsRes.ok
        ? await findingsRes.json()
        : { findings: [] };
      const schedules = schedulesRes.ok
        ? await schedulesRes.json()
        : { schedules: [] };

      // Group findings by severity
      const findingsList = findings.findings || [];
      const bySeverity = findingsList.reduce(
        (acc: Record<string, number>, f: { severity: string }) => {
          acc[f.severity] = (acc[f.severity] || 0) + 1;
          return acc;
        },
        {}
      );

      // Group findings by status
      const byStatus = findingsList.reduce(
        (acc: Record<string, number>, f: { status: string }) => {
          acc[f.status] = (acc[f.status] || 0) + 1;
          return acc;
        },
        {}
      );

      const reportData: AuditReportData = {
        totalAudits: audits.audits?.length || 0,
        findings: {
          total: findingsList.length,
          bySeverity,
          byStatus,
          critical: findingsList.filter(
            (f: { severity: string }) => f.severity === "CRITICAL"
          ),
          high: findingsList.filter(
            (f: { severity: string }) => f.severity === "HIGH"
          ),
        },
        schedules: {
          total: schedules.schedules?.length || 0,
          upcoming:
            schedules.schedules?.filter(
              (s: { status: string }) => s.status === "SCHEDULED"
            ) || [],
          completed:
            schedules.schedules?.filter(
              (s: { status: string }) => s.status === "COMPLETED"
            ) || [],
        },
      };

      setReportData(reportData);
    } catch (error) {
      console.error("Error fetching audit data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    const data = [
      { Metric: "Total Audits", Value: reportData.totalAudits },
      { Metric: "Total Findings", Value: reportData.findings.total },
      {
        Metric: "Critical Findings",
        Value: reportData.findings.critical.length,
      },
      { Metric: "High Findings", Value: reportData.findings.high.length },
      {
        Metric: "Scheduled Audits",
        Value: reportData.schedules.upcoming.length,
      },
    ];
    exportToCSV(data, generateFilename("audit-summary", "csv"));
  };

  const handleExportPDF = () => {
    if (!reportData) return;

    const data = [
      { Metric: "Total Audits", Value: reportData.totalAudits },
      { Metric: "Total Findings", Value: reportData.findings.total },
      {
        Metric: "Critical Findings",
        Value: reportData.findings.critical.length,
      },
      { Metric: "High Findings", Value: reportData.findings.high.length },
      {
        Metric: "Upcoming Audits",
        Value: reportData.schedules.upcoming.length,
      },
      ...Object.entries(reportData.findings.bySeverity).map(
        ([severity, count]) => ({
          Metric: `${severity} Severity`,
          Value: count,
        })
      ),
    ];

    exportToPDF({
      title: "Audit Report",
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      data,
      fileName: "audit-report.pdf",
    });
  };

  const handleExportExcel = () => {
    if (!reportData) return;

    const summaryData = [
      { Metric: "Total Audits", Value: reportData.totalAudits },
      { Metric: "Total Findings", Value: reportData.findings.total },
      {
        Metric: "Critical Findings",
        Value: reportData.findings.critical.length,
      },
      { Metric: "High Findings", Value: reportData.findings.high.length },
    ];

    exportToExcel(summaryData, {
      fileName: "audit-report.xlsx",
      sheetName: "Audit Summary",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
                  Audit Reports
                </h1>
              </div>
              <p className="text-gray-600 ml-12">
                Audit findings and schedule analytics
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
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedView("findings")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedView === "findings"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Findings
            </button>
            <button
              onClick={() => setSelectedView("schedule")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedView === "schedule"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Schedule
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Total Audits
            </h3>
            <p className="text-3xl font-bold text-indigo-600">
              {reportData?.totalAudits || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Total Findings
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {reportData?.findings.total || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Critical</h3>
            <p className="text-3xl font-bold text-red-600">
              {reportData?.findings.critical.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">High</h3>
            <p className="text-3xl font-bold text-orange-600">
              {reportData?.findings.high.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Upcoming</h3>
            <p className="text-3xl font-bold text-green-600">
              {reportData?.schedules.upcoming.length || 0}
            </p>
          </div>
        </div>

        {/* Content based on selected view */}
        {selectedView === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Findings by Severity
              </h3>
              <div className="space-y-4">
                {Object.entries(reportData?.findings.bySeverity || {}).map(
                  ([severity, count]) => (
                    <div key={severity}>
                      <div className="flex justify-between mb-2">
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded ${getSeverityColor(
                            severity
                          )}`}
                        >
                          {severity}
                        </span>
                        <span className="text-sm font-semibold">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            severity === "CRITICAL"
                              ? "bg-red-600"
                              : severity === "HIGH"
                              ? "bg-orange-600"
                              : severity === "MEDIUM"
                              ? "bg-yellow-600"
                              : "bg-green-600"
                          }`}
                          style={{
                            width: `${
                              ((count as number) /
                                (reportData?.findings.total || 1)) *
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
                Findings by Status
              </h3>
              <div className="space-y-4">
                {Object.entries(reportData?.findings.byStatus || {}).map(
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
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{
                            width: `${
                              ((count as number) /
                                (reportData?.findings.total || 1)) *
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

        {selectedView === "findings" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-red-50">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-bold text-gray-800">
                  Critical & High Severity Findings
                </h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Finding
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Identified
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    ...(reportData?.findings.critical || []),
                    ...(reportData?.findings.high || []),
                  ].map(
                    (finding: {
                      id: string;
                      title: string;
                      severity: string;
                      status: string;
                      identifiedDate: string;
                    }) => (
                      <tr key={finding.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {finding.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded border ${getSeverityColor(
                              finding.severity
                            )}`}
                          >
                            {finding.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {finding.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(
                            finding.identifiedDate
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedView === "schedule" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                Upcoming Audit Schedule
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Audit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Scheduled Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData?.schedules.upcoming.map(
                    (schedule: {
                      id: string;
                      scheduledDate: string;
                      status: string;
                      audit?: { title: string };
                    }) => (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {schedule.audit?.title || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(
                            schedule.scheduledDate
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {schedule.status}
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
      </div>
    </div>
  );
}
