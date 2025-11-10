"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Shield,
  AlertTriangle,
  ClipboardCheck,
  Users,
  BarChart3,
  Download,
  FileSpreadsheet,
  FileCog,
} from "lucide-react";
import BulkExportModal from "../components/BulkExportModal";

export default function ReportsPage() {
  const [isBulkExportOpen, setIsBulkExportOpen] = useState(false);

  const reportCategories = [
    {
      title: "Management Reports",
      description: "Executive summaries and comprehensive overviews",
      icon: <BarChart3 className="w-8 h-8" />,
      color: "purple",
      href: "/reports/management",
      reports: [
        "Executive Summary",
        "Key Performance Indicators",
        "Trend Analysis",
        "Department Performance",
      ],
    },
    {
      title: "Governance Reports",
      description: "Governance items, meetings, and action tracking",
      icon: <Users className="w-8 h-8" />,
      color: "blue",
      href: "/reports/governance",
      reports: [
        "All Governance Items",
        "By Status",
        "By Type",
        "By Department",
        "Meeting Summaries",
        "Action Items",
      ],
    },
    {
      title: "Audit Reports",
      description: "Audit tracking, findings, and schedules",
      icon: <ClipboardCheck className="w-8 h-8" />,
      color: "indigo",
      href: "/reports/audit",
      reports: [
        "Audit Summary",
        "Findings by Severity",
        "Open Findings",
        "Audit Schedule",
        "Completed Audits",
      ],
    },
    {
      title: "Compliance Reports",
      description: "Controls, policies, and assessment tracking",
      icon: <Shield className="w-8 h-8" />,
      color: "green",
      href: "/reports/compliance",
      reports: [
        "Controls Overview",
        "Policy Compliance",
        "Assessment Results",
        "Effectiveness Metrics",
      ],
    },
    {
      title: "Risk Reports",
      description: "Risk assessments and mitigation tracking",
      icon: <AlertTriangle className="w-8 h-8" />,
      color: "orange",
      href: "/reports/risk",
      reports: [
        "Risk Register",
        "High-Risk Items",
        "Risk by Category",
        "Mitigation Status",
      ],
    },
  ];

  const exportFormats = [
    {
      name: "PDF Export",
      icon: <FileText className="w-6 h-6" />,
      description: "Professional PDF reports with charts and branding",
      color: "red",
    },
    {
      name: "Excel Export",
      icon: <FileSpreadsheet className="w-6 h-6" />,
      description: "Detailed data export for analysis",
      color: "green",
    },
    {
      name: "Bulk Export",
      icon: <Download className="w-6 h-6" />,
      description: "Export multiple reports at once",
      color: "blue",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                <FileCog className="w-8 h-8 text-blue-600" />
                <span>Reports & Analytics</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Generate comprehensive reports with PDF and Excel export
                capabilities
              </p>
            </div>
            <button
              onClick={() => setIsBulkExportOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <Download className="w-5 h-5" />
              <span>Bulk Export</span>
            </button>
          </div>

          {/* Export Formats Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {exportFormats.map((format) => (
              <div
                key={format.name}
                className="bg-white rounded-lg shadow p-4 flex items-start space-x-4"
              >
                <div className={`p-3 rounded-lg bg-${format.color}-100`}>
                  <div className={`text-${format.color}-600`}>
                    {format.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{format.name}</h3>
                  <p className="text-sm text-gray-600">{format.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportCategories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div
                  className={`p-3 rounded-lg bg-${category.color}-100 group-hover:bg-${category.color}-200 transition-colors`}
                >
                  <div className={`text-${category.color}-600`}>
                    {category.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {category.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Report List */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Available Reports:
                </p>
                <ul className="space-y-1">
                  {category.reports.map((report) => (
                    <li
                      key={report}
                      className="text-sm text-gray-700 flex items-center space-x-2"
                    >
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      <span>{report}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {category.reports.length} reports
                </span>
                <span className="text-sm text-blue-600 group-hover:text-blue-700 font-medium">
                  View Reports →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bulk Export Modal */}
      <BulkExportModal
        isOpen={isBulkExportOpen}
        onClose={() => setIsBulkExportOpen(false)}
      />
    </div>
  );
}
