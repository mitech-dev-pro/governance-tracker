"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Package,
  Activity,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Server,
  AppWindow,
  Laptop,
} from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";

interface DashboardStats {
  governance: {
    total: number;
    active: number;
    draft: number;
    archived: number;
    thisMonth: number;
    trend: number;
  };
  compliance: {
    total: number;
    compliant: number;
    nonCompliant: number;
    pending: number;
    percentage: number;
    trend: number;
  };
  risk: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    trend: number;
  };
  audit: {
    total: number;
    completed: number;
    inProgress: number;
    planned: number;
    upcoming: number;
    trend: number;
  };
  assets: {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    computers: number;
    software: number;
    trend: number;
  };
  users: {
    total: number;
    active: number;
    departments: number;
  };
}

interface RecentActivity {
  id: number;
  type: string;
  title: string;
  status: string;
  date: string;
  user?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard");
      const data = await response.json();
      setStats(data.stats);
      setRecentActivities(data.recentActivities || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel,
    color,
    link,
  }: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    trend?: number;
    trendLabel?: string;
    color: string;
    link?: string;
  }) => {
    const colorClasses = {
      blue: "bg-blue-500 text-blue-600 bg-blue-50",
      green: "bg-green-500 text-green-600 bg-green-50",
      red: "bg-red-500 text-red-600 bg-red-50",
      yellow: "bg-yellow-500 text-yellow-600 bg-yellow-50",
      purple: "bg-purple-500 text-purple-600 bg-purple-50",
      indigo: "bg-indigo-500 text-indigo-600 bg-indigo-50",
    };

    const [, text, lightBg] =
      colorClasses[color as keyof typeof colorClasses].split(" ");

    const content = (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 cursor-pointer group">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-lg ${lightBg} group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className={`h-6 w-6 ${text}`} />
          </div>
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 ${
                trend >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span className="text-sm font-semibold">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trendLabel && (
            <span className="text-xs text-gray-500">{trendLabel}</span>
          )}
        </div>
      </div>
    );

    return link ? <Link href={link}>{content}</Link> : content;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Failed to load dashboard data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 font-medium"
            >
              <Activity className="h-4 w-4" />
              Refresh
            </button>
          </div>
          <p className="text-gray-600">
            Real-time insights across all governance areas
          </p>
        </div>

        {/* Key Metrics - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Governance Items"
            value={stats.governance.total}
            icon={FileText}
            trend={stats.governance.trend}
            trendLabel={`${stats.governance.thisMonth} this month`}
            color="blue"
            link="/governance"
          />
          <StatCard
            title="Compliance Rate"
            value={`${stats.compliance.percentage}%`}
            icon={Shield}
            trend={stats.compliance.trend}
            trendLabel={`${stats.compliance.compliant}/${stats.compliance.total} compliant`}
            color="green"
            link="/reports/compliance"
          />
          <StatCard
            title="Critical Risks"
            value={stats.risk.critical + stats.risk.high}
            icon={AlertTriangle}
            trend={stats.risk.trend}
            trendLabel={`${stats.risk.total} total risks`}
            color="red"
            link="/reports/risk"
          />
          <StatCard
            title="Active Audits"
            value={stats.audit.inProgress}
            icon={CheckCircle2}
            trend={stats.audit.trend}
            trendLabel={`${stats.audit.upcoming} upcoming`}
            color="purple"
            link="/reports/audit"
          />
        </div>

        {/* Second Row - More Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Assets"
            value={stats.assets.total}
            icon={Package}
            trend={stats.assets.trend}
            trendLabel={`${stats.assets.available} available`}
            color="indigo"
            link="/assets"
          />
          <StatCard
            title="System Users"
            value={stats.users.total}
            icon={Users}
            trendLabel={`${stats.users.departments} departments`}
            color="blue"
            link="/setup/users"
          />
          <StatCard
            title="Departments"
            value={stats.users.departments}
            icon={Building2}
            color="purple"
            link="/setup/departments"
          />
        </div>

        {/* Charts and Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Governance Status Distribution - Modern Donut Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Governance Status
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Total: {stats.governance.total} items
                </p>
              </div>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <RechartsPieChart>
                  <defs>
                    <linearGradient id="gradActive" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="gradDraft" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient
                      id="gradArchived"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={[
                      {
                        name: "Active",
                        value: stats.governance.active,
                        fill: "url(#gradActive)",
                      },
                      {
                        name: "Draft",
                        value: stats.governance.draft,
                        fill: "url(#gradDraft)",
                      },
                      {
                        name: "Archived",
                        value: stats.governance.archived,
                        fill: "url(#gradArchived)",
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {[
                      {
                        name: "Active",
                        value: stats.governance.active,
                        fill: "url(#gradActive)",
                      },
                      {
                        name: "Draft",
                        value: stats.governance.draft,
                        fill: "url(#gradDraft)",
                      },
                      {
                        name: "Archived",
                        value: stats.governance.archived,
                        fill: "url(#gradArchived)",
                      },
                    ].map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        stroke="#fff"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [value, "Items"]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-sm"></div>
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      Active
                    </p>
                    <p className="text-xs text-green-600">Currently in use</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-900">
                    {stats.governance.active}
                  </p>
                  <p className="text-xs text-green-700 font-medium">
                    {(
                      (stats.governance.active / stats.governance.total) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-sm"></div>
                  <div>
                    <p className="text-sm font-semibold text-yellow-900">
                      Draft
                    </p>
                    <p className="text-xs text-yellow-600">Work in progress</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-900">
                    {stats.governance.draft}
                  </p>
                  <p className="text-xs text-yellow-700 font-medium">
                    {(
                      (stats.governance.draft / stats.governance.total) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm"></div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Archived
                    </p>
                    <p className="text-xs text-blue-600">Historical records</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.governance.archived}
                  </p>
                  <p className="text-xs text-blue-700 font-medium">
                    {(
                      (stats.governance.archived / stats.governance.total) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/governance"
              className="mt-4 block text-center py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-medium text-sm shadow-sm hover:shadow-md"
            >
              View All Items
            </Link>
          </div>

          {/* Risk Distribution - Modern Donut Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Risk Distribution
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Total: {stats.risk.total} risks identified
                </p>
              </div>
              <PieChart className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <RechartsPieChart>
                  <defs>
                    <linearGradient
                      id="gradCritical"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                    <linearGradient id="gradHigh" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient id="gradMedium" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                    <linearGradient id="gradLow" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={[
                      {
                        name: "Critical",
                        value: stats.risk.critical,
                        fill: "url(#gradCritical)",
                      },
                      {
                        name: "High",
                        value: stats.risk.high,
                        fill: "url(#gradHigh)",
                      },
                      {
                        name: "Medium",
                        value: stats.risk.medium,
                        fill: "url(#gradMedium)",
                      },
                      {
                        name: "Low",
                        value: stats.risk.low,
                        fill: "url(#gradLow)",
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {[
                      {
                        name: "Critical",
                        value: stats.risk.critical,
                        fill: "url(#gradCritical)",
                      },
                      {
                        name: "High",
                        value: stats.risk.high,
                        fill: "url(#gradHigh)",
                      },
                      {
                        name: "Medium",
                        value: stats.risk.medium,
                        fill: "url(#gradMedium)",
                      },
                      {
                        name: "Low",
                        value: stats.risk.low,
                        fill: "url(#gradLow)",
                      },
                    ].map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        stroke="#fff"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [value, "Risks"]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg hover:shadow-md transition-shadow border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-sm"></div>
                  <div>
                    <p className="text-sm font-semibold text-red-900">
                      Critical
                    </p>
                    <p className="text-xs text-red-600">
                      Immediate action required
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-900">
                    {stats.risk.critical}
                  </p>
                  <p className="text-xs text-red-700 font-medium">
                    {((stats.risk.critical / stats.risk.total) * 100).toFixed(
                      1
                    )}
                    %
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:shadow-md transition-shadow border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm"></div>
                  <div>
                    <p className="text-sm font-semibold text-orange-900">
                      High
                    </p>
                    <p className="text-xs text-orange-600">
                      Needs urgent attention
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-900">
                    {stats.risk.high}
                  </p>
                  <p className="text-xs text-orange-700 font-medium">
                    {((stats.risk.high / stats.risk.total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-shadow border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm"></div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Medium
                    </p>
                    <p className="text-xs text-blue-600">Monitor regularly</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.risk.medium}
                  </p>
                  <p className="text-xs text-blue-700 font-medium">
                    {((stats.risk.medium / stats.risk.total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:shadow-md transition-shadow border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-sm"></div>
                  <div>
                    <p className="text-sm font-semibold text-green-900">Low</p>
                    <p className="text-xs text-green-600">Minimal impact</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-900">
                    {stats.risk.low}
                  </p>
                  <p className="text-xs text-green-700 font-medium">
                    {((stats.risk.low / stats.risk.total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/reports/risk"
              className="mt-4 block text-center py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 transition-all font-medium text-sm shadow-sm hover:shadow-md"
            >
              View Risk Report
            </Link>
          </div>
        </div>

        {/* Audit Progress and Compliance - Animated Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Audit Status - Radial Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Audit Progress
              </h3>
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="90%"
                barSize={20}
                data={[
                  {
                    name: "Completed",
                    value: (stats.audit.completed / stats.audit.total) * 100,
                    fill: "#10b981",
                  },
                  {
                    name: "In Progress",
                    value: (stats.audit.inProgress / stats.audit.total) * 100,
                    fill: "#3b82f6",
                  },
                  {
                    name: "Planned",
                    value: (stats.audit.planned / stats.audit.total) * 100,
                    fill: "#8b5cf6",
                  },
                ]}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  minAngle={15}
                  background
                  clockWise
                  dataKey="value"
                  cornerRadius={10}
                  animationDuration={1000}
                />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: "14px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-50 p-2 rounded">
                <p className="text-xs text-green-700 font-medium">Completed</p>
                <p className="text-lg font-bold text-green-900">
                  {stats.audit.completed}
                </p>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <p className="text-xs text-blue-700 font-medium">In Progress</p>
                <p className="text-lg font-bold text-blue-900">
                  {stats.audit.inProgress}
                </p>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <p className="text-xs text-purple-700 font-medium">Planned</p>
                <p className="text-lg font-bold text-purple-900">
                  {stats.audit.planned}
                </p>
              </div>
            </div>
            <Link
              href="/reports/audit"
              className="mt-4 block text-center py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium text-sm"
            >
              View Audit Schedule
            </Link>
          </div>

          {/* Compliance Trend - Area Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Compliance Overview
              </h3>
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={[
                  { name: "Compliant", value: stats.compliance.compliant },
                  { name: "Pending", value: stats.compliance.pending },
                  {
                    name: "Non-Compliant",
                    value: stats.compliance.nonCompliant,
                  },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id="colorCompliance"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCompliance)"
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Compliance Rate</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.compliance.percentage}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.compliance.total}
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/reports/compliance"
              className="mt-4 block text-center py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
            >
              View Compliance Report
            </Link>
          </div>
        </div>

        {/* Monthly Trends - Animated Line Chart with Tension */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                6-Month Performance Trends
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Tracking governance, compliance, risks, and audits over time
              </p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={[
                {
                  month: "May",
                  governance: 45,
                  compliance: 78,
                  risks: 23,
                  audits: 12,
                },
                {
                  month: "Jun",
                  governance: 52,
                  compliance: 82,
                  risks: 19,
                  audits: 15,
                },
                {
                  month: "Jul",
                  governance: 61,
                  compliance: 85,
                  risks: 25,
                  audits: 18,
                },
                {
                  month: "Aug",
                  governance: 58,
                  compliance: 88,
                  risks: 21,
                  audits: 20,
                },
                {
                  month: "Sep",
                  governance: 67,
                  compliance: 91,
                  risks: 17,
                  audits: 22,
                },
                {
                  month: "Oct",
                  governance: stats.governance.active || 72,
                  compliance: stats.compliance.percentage || 93,
                  risks: stats.risk.critical + stats.risk.high || 15,
                  audits: stats.audit.completed || 25,
                },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
              <Line
                type="natural"
                dataKey="governance"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 5 }}
                activeDot={{ r: 7 }}
                animationDuration={1500}
                name="Governance Items"
              />
              <Line
                type="natural"
                dataKey="compliance"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", r: 5 }}
                activeDot={{ r: 7 }}
                animationDuration={1500}
                animationBegin={300}
                name="Compliance %"
              />
              <Line
                type="natural"
                dataKey="risks"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: "#ef4444", r: 5 }}
                activeDot={{ r: 7 }}
                animationDuration={1500}
                animationBegin={600}
                name="Active Risks"
              />
              <Line
                type="natural"
                dataKey="audits"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", r: 5 }}
                activeDot={{ r: 7 }}
                animationDuration={1500}
                animationBegin={900}
                name="Completed Audits"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-xs text-gray-600">Governance</p>
                <p className="text-lg font-bold text-blue-900">
                  {stats.governance.active}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-xs text-gray-600">Compliance</p>
                <p className="text-lg font-bold text-green-900">
                  {stats.compliance.percentage}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-xs text-gray-600">Active Risks</p>
                <p className="text-lg font-bold text-red-900">
                  {stats.risk.critical + stats.risk.high}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div>
                <p className="text-xs text-gray-600">Audits Done</p>
                <p className="text-lg font-bold text-purple-900">
                  {stats.audit.completed}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Overview and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Asset Breakdown */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Asset Overview
              </h3>
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Laptop className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Computers
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.assets.computers}
                </p>
                <p className="text-xs text-gray-600 mt-1">Desktop & Laptops</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <AppWindow className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Software
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.assets.software}
                </p>
                <p className="text-xs text-gray-600 mt-1">Licenses & Apps</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Available
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.assets.available}
                </p>
                <p className="text-xs text-gray-600 mt-1">Ready to deploy</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Server className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">
                    In Use
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.assets.inUse}
                </p>
                <p className="text-xs text-gray-600 mt-1">Currently assigned</p>
              </div>
            </div>
            <Link
              href="/assets"
              className="mt-6 block text-center py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
            >
              Manage Assets
            </Link>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Recent Activity
              </h3>
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="mt-1">
                      {activity.type === "governance" && (
                        <FileText className="h-4 w-4 text-blue-600" />
                      )}
                      {activity.type === "audit" && (
                        <CheckCircle2 className="h-4 w-4 text-purple-600" />
                      )}
                      {activity.type === "risk" && (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      {activity.type === "asset" && (
                        <Package className="h-4 w-4 text-indigo-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            activity.status === "ACTIVE" ||
                            activity.status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : activity.status === "DRAFT" ||
                                activity.status === "PLANNED"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {activity.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No recent activities</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-6 w-6" />
            <h3 className="text-xl font-bold">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/governance"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all rounded-lg p-4 text-center group"
            >
              <FileText className="h-8 w-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium">New Governance</p>
            </Link>
            <Link
              href="/reports/audit"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all rounded-lg p-4 text-center group"
            >
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium">Schedule Audit</p>
            </Link>
            <Link
              href="/assets"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all rounded-lg p-4 text-center group"
            >
              <Package className="h-8 w-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium">Add Asset</p>
            </Link>
            <Link
              href="/reports"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all rounded-lg p-4 text-center group"
            >
              <Target className="h-8 w-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium">View Reports</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
