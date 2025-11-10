"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, FileText, FileSpreadsheet, Filter } from "lucide-react";
import Link from "next/link";
import { GovernanceReportData } from "../../types/reports";
import { exportToCSV, generateFilename } from "../../utils/exportHelpers";
import { exportToPDF } from "../../utils/pdfExport";
import { exportToExcel } from "../../utils/excelExport";

export default function GovernanceReportsPage() {
  const [reportData, setReportData] = useState<GovernanceReportData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: "all",
    type: "all",
    department: "all",
  });
  const [dateRange, setDateRange] = useState("all");

  useEffect(() => {
    fetchGovernanceData();
  }, [filter, dateRange]);

  const fetchGovernanceData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/governance");
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      const items = data.items || [];

      // Apply filters
      const filteredItems = items.filter(
        (item: { status: string; type: string; departmentId: string }) => {
          if (filter.status !== "all" && item.status !== filter.status)
            return false;
          if (filter.type !== "all" && item.type !== filter.type) return false;
          if (
            filter.department !== "all" &&
            item.departmentId !== filter.department
          )
            return false;
          return true;
        }
      );

      // Group by status
      const byStatus = filteredItems.reduce(
        (acc: Record<string, number>, item: { status: string }) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        },
        {}
      );

      // Group by type
      const byType = filteredItems.reduce(
        (acc: Record<string, number>, item: { type: string }) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        },
        {}
      );

      // Group by department
      const byDepartment = filteredItems.reduce(
        (acc: Record<string, number>, item: { departmentId: string }) => {
          acc[item.departmentId || "Unassigned"] =
            (acc[item.departmentId || "Unassigned"] || 0) + 1;
          return acc;
        },
        {}
      );

      const reportData: GovernanceReportData = {
        totalItems: filteredItems.length,
        byStatus,
        byType,
        byDepartment,
        recentItems: filteredItems.slice(0, 10),
        upcomingMeetings: [],
        actionItems: filteredItems.filter(
          (i: { status: string }) => i.status === "Active"
        ),
      };

      setReportData(reportData);
    } catch (error) {
      console.error("Error fetching governance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    exportToCSV(
      reportData.recentItems,
      generateFilename("governance-report", "csv")
    );
  };

  const handleExportPDF = () => {
    if (!reportData) return;

    const data = [
      { Metric: "Total Items", Value: reportData.totalItems },
      ...Object.entries(reportData.byStatus).map(([status, count]) => ({
        Metric: `${status} Items`,
        Value: count,
      })),
    ];

    exportToPDF({
      title: "Governance Report",
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      data,
      fileName: "governance-report.pdf",
    });
  };

  const handleExportExcel = () => {
    if (!reportData) return;

    exportToExcel(reportData.recentItems, {
      fileName: "governance-report.xlsx",
      sheetName: "Governance Items",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                  Governance Reports
                </h1>
              </div>
              <p className="text-gray-600 ml-12">
                Comprehensive governance analytics and exports
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Policy">Policy</option>
              <option value="Procedure">Procedure</option>
              <option value="Standard">Standard</option>
            </select>
            <select
              value={filter.department}
              onChange={(e) =>
                setFilter({ ...filter, department: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Total Items
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {reportData?.totalItems || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Active</h3>
            <p className="text-3xl font-bold text-green-600">
              {reportData?.byStatus.Active || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Completed
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {reportData?.byStatus.Completed || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {reportData?.byStatus.Pending || 0}
            </p>
          </div>
        </div>

        {/* By Status Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Status Distribution
            </h3>
            <div className="space-y-4">
              {Object.entries(reportData?.byStatus || {}).map(
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
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            ((count as number) /
                              (reportData?.totalItems || 1)) *
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
              Type Distribution
            </h3>
            <div className="space-y-4">
              {Object.entries(reportData?.byType || {}).map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {type}
                    </span>
                    <span className="text-sm font-semibold">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${
                          ((count as number) / (reportData?.totalItems || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Items Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">
              Recent Governance Items
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData?.recentItems.map(
                  (item: {
                    id: string;
                    title: string;
                    type: string;
                    status: string;
                    createdAt: string;
                  }) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{item.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : item.status === "Completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
