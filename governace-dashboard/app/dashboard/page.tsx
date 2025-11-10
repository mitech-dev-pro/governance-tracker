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
    icon: any;
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

    const [bg, text, lightBg] =
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

  const ProgressBar = ({
    percentage,
    color,
  }: {
    percentage: number;
    color: string;
  }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      red: "bg-red-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
      indigo: "bg-indigo-500",
    };

    return (
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${
            colorClasses[color as keyof typeof colorClasses]
          } transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Governance Status Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Governance Status
              </h3>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.governance.active}
                  </span>
                </div>
                <ProgressBar
                  percentage={
                    (stats.governance.active / stats.governance.total) * 100
                  }
                  color="green"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Draft
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.governance.draft}
                  </span>
                </div>
                <ProgressBar
                  percentage={
                    (stats.governance.draft / stats.governance.total) * 100
                  }
                  color="yellow"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Archived
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.governance.archived}
                  </span>
                </div>
                <ProgressBar
                  percentage={
                    (stats.governance.archived / stats.governance.total) * 100
                  }
                  color="blue"
                />
              </div>
            </div>
            <Link
              href="/governance"
              className="mt-6 block text-center py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
            >
              View All Items
            </Link>
          </div>

          {/* Risk Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Risk Distribution
              </h3>
              <PieChart className="h-5 w-5 text-red-600" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Critical
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.risk.critical}
                  </span>
                </div>
                <ProgressBar
                  percentage={(stats.risk.critical / stats.risk.total) * 100}
                  color="red"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      High
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.risk.high}
                  </span>
                </div>
                <ProgressBar
                  percentage={(stats.risk.high / stats.risk.total) * 100}
                  color="yellow"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Medium
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.risk.medium}
                  </span>
                </div>
                <ProgressBar
                  percentage={(stats.risk.medium / stats.risk.total) * 100}
                  color="blue"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Low
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.risk.low}
                  </span>
                </div>
                <ProgressBar
                  percentage={(stats.risk.low / stats.risk.total) * 100}
                  color="green"
                />
              </div>
            </div>
            <Link
              href="/reports/risk"
              className="mt-6 block text-center py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
            >
              View Risk Report
            </Link>
          </div>

          {/* Audit Status */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Audit Status</h3>
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Completed
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.audit.completed}
                  </span>
                </div>
                <ProgressBar
                  percentage={(stats.audit.completed / stats.audit.total) * 100}
                  color="green"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    In Progress
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.audit.inProgress}
                  </span>
                </div>
                <ProgressBar
                  percentage={
                    (stats.audit.inProgress / stats.audit.total) * 100
                  }
                  color="blue"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Planned
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.audit.planned}
                  </span>
                </div>
                <ProgressBar
                  percentage={(stats.audit.planned / stats.audit.total) * 100}
                  color="purple"
                />
              </div>
            </div>
            <Link
              href="/reports/audit"
              className="mt-6 block text-center py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium text-sm"
            >
              View Audit Schedule
            </Link>
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
