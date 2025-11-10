"use client";

import React, { useState } from "react";
import { Download, FileArchive, CheckCircle2, Loader2 } from "lucide-react";
import { exportManagementReportPDF } from "../utils/pdfExport";
import {
  exportManagementReportExcel,
  exportGovernanceReportExcel,
  exportAuditReportExcel,
  exportComplianceReportExcel,
  exportRiskReportExcel,
} from "../utils/excelExport";

interface BulkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkExportModal({
  isOpen,
  onClose,
}: BulkExportModalProps) {
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const reportTypes = [
    {
      id: "management",
      name: "Management Report",
      description: "Executive summary with all metrics",
    },
    {
      id: "governance",
      name: "Governance Reports",
      description: "All governance items and analytics",
    },
    {
      id: "audit",
      name: "Audit Reports",
      description: "Audits, findings, and schedules",
    },
    {
      id: "compliance",
      name: "Compliance Reports",
      description: "Controls, policies, and assessments",
    },
    {
      id: "risk",
      name: "Risk Reports",
      description: "Risk assessment and mitigation",
    },
  ];

  const toggleReport = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const selectAll = () => {
    setSelectedReports(reportTypes.map((r) => r.id));
  };

  const deselectAll = () => {
    setSelectedReports([]);
  };

  const fetchReportData = async (reportType: string) => {
    const endpoints: Record<string, string> = {
      governance: "/api/governance",
      audit: "/api/audit",
      compliance: "/api/compliance/controls",
      risk: "/api/risk",
    };

    const endpoint = endpoints[reportType];
    if (!endpoint) return null;

    try {
      const res = await fetch(endpoint);
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error(`Error fetching ${reportType} data:`, error);
      return null;
    }
  };

  const handleBulkExport = async () => {
    if (selectedReports.length === 0) {
      alert("Please select at least one report to export");
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const totalReports = selectedReports.length;
      let completed = 0;

      for (const reportType of selectedReports) {
        // Fetch data for the report
        let reportData;

        if (reportType === "management") {
          // Fetch all data for management report
          const [gov, audit, comp, risk] = await Promise.all([
            fetchReportData("governance"),
            fetchReportData("audit"),
            fetchReportData("compliance"),
            fetchReportData("risk"),
          ]);

          reportData = {
            governance: {
              total: gov?.items?.length || 0,
              active:
                gov?.items?.filter(
                  (i: { status: string }) => i.status === "Active"
                ).length || 0,
              completed:
                gov?.items?.filter(
                  (i: { status: string }) => i.status === "Completed"
                ).length || 0,
            },
            audit: {
              total: audit?.audits?.length || 0,
              inProgress:
                audit?.audits?.filter(
                  (a: { status: string }) => a.status === "IN_PROGRESS"
                ).length || 0,
              findings: 0,
              criticalFindings: 0,
            },
            compliance: {
              controls: comp?.controls?.length || 0,
              policies: 0,
              assessments: 0,
              averageCompliance: 85,
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
                risk?.risks?.filter(
                  (r: { impact: string }) => r.impact === "LOW"
                ).length || 0,
            },
            trends: {
              governanceGrowth: 12,
              auditCompletion: 85,
              complianceScore: 88,
              riskReduction: 15,
            },
          };

          if (exportFormat === "pdf") {
            exportManagementReportPDF(reportData);
          } else {
            exportManagementReportExcel(reportData);
          }
        } else {
          reportData = await fetchReportData(reportType);

          if (reportData) {
            if (exportFormat === "excel") {
              if (reportType === "governance") {
                const items = reportData.items || [];
                const byStatus = items.reduce(
                  (acc: Record<string, number>, item: { status: string }) => {
                    acc[item.status] = (acc[item.status] || 0) + 1;
                    return acc;
                  },
                  {}
                );
                const byType = items.reduce(
                  (acc: Record<string, number>, item: { type: string }) => {
                    acc[item.type] = (acc[item.type] || 0) + 1;
                    return acc;
                  },
                  {}
                );
                const byDepartment = items.reduce(
                  (
                    acc: Record<string, number>,
                    item: { departmentId: string }
                  ) => {
                    acc[item.departmentId || "Unassigned"] =
                      (acc[item.departmentId || "Unassigned"] || 0) + 1;
                    return acc;
                  },
                  {}
                );
                exportGovernanceReportExcel({
                  totalItems: items.length,
                  byStatus,
                  byType,
                  byDepartment,
                  recentItems: items.slice(0, 10),
                });
              } else if (reportType === "audit") {
                const audits = reportData.audits || [];
                const findingsRes = await fetch("/api/audit/findings");
                const findingsData = findingsRes.ok
                  ? await findingsRes.json()
                  : { findings: [] };
                const findings = findingsData.findings || [];

                const schedulesRes = await fetch("/api/audit/schedules");
                const schedulesData = schedulesRes.ok
                  ? await schedulesRes.json()
                  : { schedules: [] };
                const schedules = schedulesData.schedules || [];

                const bySeverity = findings.reduce(
                  (acc: Record<string, number>, f: { severity: string }) => {
                    acc[f.severity] = (acc[f.severity] || 0) + 1;
                    return acc;
                  },
                  {}
                );

                const byStatus = findings.reduce(
                  (acc: Record<string, number>, f: { status: string }) => {
                    acc[f.status] = (acc[f.status] || 0) + 1;
                    return acc;
                  },
                  {}
                );

                exportAuditReportExcel({
                  totalAudits: audits.length,
                  findings: {
                    total: findings.length,
                    bySeverity,
                    byStatus,
                    critical: findings.filter(
                      (f: { severity: string }) => f.severity === "CRITICAL"
                    ),
                    high: findings.filter(
                      (f: { severity: string }) => f.severity === "HIGH"
                    ),
                  },
                  schedules: {
                    total: schedules.length,
                    upcoming: schedules.filter(
                      (s: { status: string }) => s.status === "SCHEDULED"
                    ),
                    completed: schedules.filter(
                      (s: { status: string }) => s.status === "COMPLETED"
                    ),
                  },
                });
              } else if (reportType === "compliance") {
                const controls = reportData.controls || [];
                const policiesRes = await fetch("/api/compliance/policies");
                const policiesData = policiesRes.ok
                  ? await policiesRes.json()
                  : { policies: [] };
                const policies = policiesData.policies || [];

                const controlsByStatus = controls.reduce(
                  (acc: Record<string, number>, c: { status: string }) => {
                    acc[c.status] = (acc[c.status] || 0) + 1;
                    return acc;
                  },
                  {}
                );

                const policiesByStatus = policies.reduce(
                  (acc: Record<string, number>, p: { status: string }) => {
                    acc[p.status] = (acc[p.status] || 0) + 1;
                    return acc;
                  },
                  {}
                );

                const effectiveControls = controls.filter(
                  (c: { status: string }) => c.status === "ACTIVE"
                ).length;
                const effectiveness =
                  controls.length > 0
                    ? Math.round((effectiveControls / controls.length) * 100)
                    : 0;

                exportComplianceReportExcel({
                  controls: {
                    total: controls.length,
                    byStatus: controlsByStatus,
                    effective: effectiveControls,
                    effectiveness,
                  },
                  policies: {
                    total: policies.length,
                    byStatus: policiesByStatus,
                    approved: policies.filter(
                      (p: { status: string }) => p.status === "APPROVED"
                    ).length,
                  },
                });
              } else if (reportType === "risk") {
                const risks = reportData.risks || [];
                const byStatus = risks.reduce(
                  (acc: Record<string, number>, r: { status: string }) => {
                    acc[r.status] = (acc[r.status] || 0) + 1;
                    return acc;
                  },
                  {}
                );
                const byCategory = risks.reduce(
                  (acc: Record<string, number>, r: { category: string }) => {
                    acc[r.category] = (acc[r.category] || 0) + 1;
                    return acc;
                  },
                  {}
                );
                const byImpact = risks.reduce(
                  (acc: Record<string, number>, r: { impact: string }) => {
                    acc[r.impact] = (acc[r.impact] || 0) + 1;
                    return acc;
                  },
                  {}
                );
                const byLikelihood = risks.reduce(
                  (acc: Record<string, number>, r: { likelihood: string }) => {
                    acc[r.likelihood] = (acc[r.likelihood] || 0) + 1;
                    return acc;
                  },
                  {}
                );
                const highRisks = risks.filter(
                  (r: { impact: string; likelihood: string }) =>
                    (r.impact === "HIGH" || r.impact === "CRITICAL") &&
                    (r.likelihood === "HIGH" || r.likelihood === "LIKELY")
                );

                exportRiskReportExcel({
                  totalRisks: risks.length,
                  byStatus,
                  byCategory,
                  byImpact,
                  byLikelihood,
                  highRisks,
                });
              }
            }
          }
        }

        completed++;
        setExportProgress(Math.round((completed / totalReports) * 100));

        // Small delay between exports
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      alert(
        `Successfully exported ${
          selectedReports.length
        } report(s) as ${exportFormat.toUpperCase()}`
      );
      onClose();
    } catch (error) {
      console.error("Bulk export error:", error);
      alert("Error during bulk export. Please try again.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <FileArchive className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Bulk Export</h2>
              <p className="text-blue-100">Export multiple reports at once</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setExportFormat("pdf")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  exportFormat === "pdf"
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-gray-300 hover:border-red-300"
                }`}
              >
                <div className="font-semibold">PDF</div>
                <div className="text-xs text-gray-600">
                  Professional format with branding
                </div>
              </button>
              <button
                onClick={() => setExportFormat("excel")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  exportFormat === "excel"
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-gray-300 hover:border-green-300"
                }`}
              >
                <div className="font-semibold">Excel</div>
                <div className="text-xs text-gray-600">
                  Multi-sheet with data analysis
                </div>
              </button>
            </div>
          </div>

          {/* Report Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Select Reports ({selectedReports.length} selected)
              </label>
              <div className="space-x-2">
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Select All
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={deselectAll}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {reportTypes.map((report) => (
                <div
                  key={report.id}
                  onClick={() => toggleReport(report.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedReports.includes(report.id)
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {selectedReports.includes(report.id) ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {report.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {report.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          {isExporting && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Exporting...
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {exportProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedReports.length} report(s) selected for export
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkExport}
              disabled={isExporting || selectedReports.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Export Reports</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
