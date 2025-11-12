import { NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function GET() {
  try {
    // Fetch all counts and data in parallel
    const [
      governanceItems,
      controlsCount,
      policiesCount,
      assessmentsCount,
      riskItems,
      auditItems,
      assetItems,
      usersCount,
      departmentsCount,
    ] = await Promise.all([
      prisma.governanceItem.findMany({
        select: { id: true, status: true, createdAt: true },
      }),
      prisma.control.count(),
      prisma.policy.count(),
      prisma.assessment.count(),
      prisma.risk.findMany({
        select: { id: true, likelihood: true, impact: true, createdAt: true },
      }),
      prisma.audit.findMany({
        select: { id: true, status: true, createdAt: true, startDate: true },
      }),
      prisma.asset.findMany({
        select: { id: true, category: true, status: true, createdAt: true },
      }),
      prisma.user.count(),
      prisma.department.count(),
    ]);

    // Calculate date ranges
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Governance stats
    const governanceThisMonth = governanceItems.filter(
      (item) => new Date(item.createdAt) >= thisMonthStart
    ).length;
    const governanceLastMonth = governanceItems.filter(
      (item) =>
        new Date(item.createdAt) >= lastMonthStart &&
        new Date(item.createdAt) <= lastMonthEnd
    ).length;
    const governanceTrend =
      governanceLastMonth > 0
        ? Math.round(
            ((governanceThisMonth - governanceLastMonth) /
              governanceLastMonth) *
              100
          )
        : governanceThisMonth > 0
        ? 100
        : 0;

    const governanceStats = {
      total: governanceItems.length,
      active: governanceItems.filter((item) => item.status === "IN_PROGRESS")
        .length,
      draft: governanceItems.filter((item) => item.status === "NOT_STARTED")
        .length,
      archived: governanceItems.filter((item) => item.status === "COMPLETED")
        .length,
      thisMonth: governanceThisMonth,
      trend: governanceTrend,
    };

    // Compliance stats (using controls, policies, assessments)
    const complianceTotal = controlsCount + policiesCount + assessmentsCount;
    const complianceCompliant = controlsCount; // Simplified - controls are compliant
    const compliancePercentage =
      complianceTotal > 0
        ? Math.round((complianceCompliant / complianceTotal) * 100)
        : 0;

    const complianceStats = {
      total: complianceTotal,
      compliant: complianceCompliant,
      nonCompliant: assessmentsCount,
      pending: policiesCount,
      percentage: compliancePercentage,
      trend: 5, // Simplified trend
    };

    // Risk stats - calculate risk score based on likelihood and impact
    const getRiskLevel = (likelihood: number, impact: number) => {
      const score = likelihood * impact;
      if (score >= 20) return "critical";
      if (score >= 12) return "high";
      if (score >= 6) return "medium";
      return "low";
    };

    const riskThisMonth = riskItems.filter(
      (item) => new Date(item.createdAt) >= thisMonthStart
    ).length;
    const riskLastMonth = riskItems.filter(
      (item) =>
        new Date(item.createdAt) >= lastMonthStart &&
        new Date(item.createdAt) <= lastMonthEnd
    ).length;
    const riskTrend =
      riskLastMonth > 0
        ? Math.round(((riskThisMonth - riskLastMonth) / riskLastMonth) * 100)
        : riskThisMonth > 0
        ? 100
        : 0;

    const riskStats = {
      total: riskItems.length,
      critical: riskItems.filter(
        (item) => getRiskLevel(item.likelihood, item.impact) === "critical"
      ).length,
      high: riskItems.filter(
        (item) => getRiskLevel(item.likelihood, item.impact) === "high"
      ).length,
      medium: riskItems.filter(
        (item) => getRiskLevel(item.likelihood, item.impact) === "medium"
      ).length,
      low: riskItems.filter(
        (item) => getRiskLevel(item.likelihood, item.impact) === "low"
      ).length,
      trend: riskTrend,
    };

    // Audit stats
    const auditThisMonth = auditItems.filter(
      (item) => new Date(item.createdAt) >= thisMonthStart
    ).length;
    const auditLastMonth = auditItems.filter(
      (item) =>
        new Date(item.createdAt) >= lastMonthStart &&
        new Date(item.createdAt) <= lastMonthEnd
    ).length;
    const auditTrend =
      auditLastMonth > 0
        ? Math.round(((auditThisMonth - auditLastMonth) / auditLastMonth) * 100)
        : auditThisMonth > 0
        ? 100
        : 0;

    const upcomingAudits = auditItems.filter((item) => {
      const startDate = new Date(item.startDate);
      const daysUntilStart = Math.ceil(
        (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilStart > 0 && daysUntilStart <= 30;
    }).length;

    const auditStats = {
      total: auditItems.length,
      completed: auditItems.filter((item) => item.status === "COMPLETED")
        .length,
      inProgress: auditItems.filter((item) => item.status === "IN_PROGRESS")
        .length,
      planned: auditItems.filter((item) => item.status === "PLANNED").length,
      upcoming: upcomingAudits,
      trend: auditTrend,
    };

    // Asset stats
    const assetThisMonth = assetItems.filter(
      (item) => new Date(item.createdAt) >= thisMonthStart
    ).length;
    const assetLastMonth = assetItems.filter(
      (item) =>
        new Date(item.createdAt) >= lastMonthStart &&
        new Date(item.createdAt) <= lastMonthEnd
    ).length;
    const assetTrend =
      assetLastMonth > 0
        ? Math.round(((assetThisMonth - assetLastMonth) / assetLastMonth) * 100)
        : assetThisMonth > 0
        ? 100
        : 0;

    const assetStats = {
      total: assetItems.length,
      available: assetItems.filter((item) => item.status === "AVAILABLE")
        .length,
      inUse: assetItems.filter((item) => item.status === "IN_USE").length,
      maintenance: assetItems.filter((item) => item.status === "MAINTENANCE")
        .length,
      computers: assetItems.filter(
        (item) =>
          item.category === "COMPUTER" ||
          item.category === "LAPTOP" ||
          item.category === "MONITOR"
      ).length,
      software: assetItems.filter(
        (item) => item.category === "SOFTWARE_LICENSE"
      ).length,
      trend: assetTrend,
    };

    const userStats = {
      total: usersCount,
      active: usersCount,
      departments: departmentsCount,
    };

    // Get recent activities
    const recentGovernance = await prisma.governanceItem.findMany({
      select: { id: true, title: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    const recentAudits = await prisma.audit.findMany({
      select: { id: true, title: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    const recentRisks = await prisma.risk.findMany({
      select: {
        id: true,
        title: true,
        likelihood: true,
        impact: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 2,
    });

    const recentAssets = await prisma.asset.findMany({
      select: { id: true, name: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 2,
    });

    const recentActivities = [
      ...recentGovernance.map((item) => ({
        id: item.id,
        type: "governance",
        title: item.title,
        status: item.status,
        date: item.createdAt,
      })),
      ...recentAudits.map((item) => ({
        id: item.id,
        type: "audit",
        title: item.title,
        status: item.status,
        date: item.createdAt,
      })),
      ...recentRisks.map((item) => ({
        id: item.id,
        type: "risk",
        title: item.title,
        status: getRiskLevel(item.likelihood, item.impact).toUpperCase(),
        date: item.createdAt,
      })),
      ...recentAssets.map((item) => ({
        id: item.id,
        type: "asset",
        title: item.name,
        status: item.status,
        date: item.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return NextResponse.json(
      {
        stats: {
          governance: governanceStats,
          compliance: complianceStats,
          risk: riskStats,
          audit: auditStats,
          assets: assetStats,
          users: userStats,
        },
        recentActivities,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
