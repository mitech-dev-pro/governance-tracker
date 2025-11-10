import * as XLSX from "xlsx";

export interface ExcelExportOptions {
  fileName?: string;
  sheetName?: string;
  includeDate?: boolean;
}

/**
 * Export data to Excel format
 */
export const exportToExcel = (
  data: Record<string, unknown>[],
  options: ExcelExportOptions = {}
) => {
  const {
    fileName = "export",
    sheetName = "Sheet1",
    includeDate = true,
  } = options;

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate filename with date
  const timestamp = includeDate
    ? `_${new Date().toISOString().split("T")[0]}`
    : "";
  const fullFileName = `${fileName}${timestamp}.xlsx`;

  // Export file
  XLSX.writeFile(workbook, fullFileName);
};

/**
 * Export multiple sheets to single Excel file
 */
export const exportMultiSheetExcel = (
  sheets: { name: string; data: Record<string, unknown>[] }[],
  fileName = "multi-sheet-export"
) => {
  const workbook = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const worksheet = XLSX.utils.json_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  });

  const timestamp = new Date().toISOString().split("T")[0];
  XLSX.writeFile(workbook, `${fileName}_${timestamp}.xlsx`);
};

/**
 * Export management report to Excel with multiple sheets
 */
export const exportManagementReportExcel = (reportData: {
  governance: { total: number; active: number; completed: number };
  audit: {
    total: number;
    inProgress: number;
    findings: number;
    criticalFindings: number;
  };
  compliance: {
    controls: number;
    policies: number;
    assessments: number;
    averageCompliance: number;
  };
  risk: { total: number; high: number; medium: number; low: number };
  trends: {
    governanceGrowth: number;
    auditCompletion: number;
    complianceScore: number;
    riskReduction: number;
  };
}) => {
  const sheets = [
    {
      name: "Summary",
      data: [
        { Category: "Governance", Metric: "Total Items", Value: reportData.governance.total },
        { Category: "Governance", Metric: "Active", Value: reportData.governance.active },
        { Category: "Governance", Metric: "Completed", Value: reportData.governance.completed },
        { Category: "Audit", Metric: "Total Audits", Value: reportData.audit.total },
        { Category: "Audit", Metric: "In Progress", Value: reportData.audit.inProgress },
        { Category: "Audit", Metric: "Critical Findings", Value: reportData.audit.criticalFindings },
        { Category: "Compliance", Metric: "Controls", Value: reportData.compliance.controls },
        { Category: "Compliance", Metric: "Policies", Value: reportData.compliance.policies },
        { Category: "Compliance", Metric: "Average Compliance", Value: `${reportData.compliance.averageCompliance}%` },
        { Category: "Risk", Metric: "Total Risks", Value: reportData.risk.total },
        { Category: "Risk", Metric: "High Priority", Value: reportData.risk.high },
        { Category: "Risk", Metric: "Medium Priority", Value: reportData.risk.medium },
      ],
    },
    {
      name: "Trends",
      data: [
        { Metric: "Governance Growth", Value: `${reportData.trends.governanceGrowth}%` },
        { Metric: "Audit Completion", Value: `${reportData.trends.auditCompletion}%` },
        { Metric: "Compliance Score", Value: `${reportData.trends.complianceScore}%` },
        { Metric: "Risk Reduction", Value: `${reportData.trends.riskReduction}%` },
      ],
    },
  ];

  exportMultiSheetExcel(sheets, "management-report");
};

/**
 * Export governance report to Excel
 */
export const exportGovernanceReportExcel = (reportData: {
  totalItems: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byDepartment: Record<string, number>;
  recentItems: unknown[];
}) => {
  const statusData = Object.entries(reportData.byStatus).map(([status, count]) => ({
    Status: status,
    Count: count,
    Percentage: `${Math.round((count / reportData.totalItems) * 100)}%`,
  }));

  const typeData = Object.entries(reportData.byType).map(([type, count]) => ({
    Type: type,
    Count: count,
    Percentage: `${Math.round((count / reportData.totalItems) * 100)}%`,
  }));

  const sheets = [
    { name: "Overview", data: [{ "Total Items": reportData.totalItems }] },
    { name: "By Status", data: statusData },
    { name: "By Type", data: typeData },
    { name: "Recent Items", data: reportData.recentItems as Record<string, unknown>[] },
  ];

  exportMultiSheetExcel(sheets, "governance-report");
};

/**
 * Export audit report to Excel with findings breakdown
 */
export const exportAuditReportExcel = (reportData: {
  totalAudits: number;
  findings: {
    total: number;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    critical: unknown[];
    high: unknown[];
  };
  schedules: {
    total: number;
    upcoming: unknown[];
    completed: unknown[];
  };
}) => {
  const severityData = Object.entries(reportData.findings.bySeverity).map(([severity, count]) => ({
    Severity: severity,
    Count: count,
    Percentage: `${Math.round((count / reportData.findings.total) * 100)}%`,
  }));

  const sheets = [
    {
      name: "Summary",
      data: [
        { Metric: "Total Audits", Value: reportData.totalAudits },
        { Metric: "Total Findings", Value: reportData.findings.total },
        { Metric: "Critical Findings", Value: reportData.findings.critical.length },
        { Metric: "High Findings", Value: reportData.findings.high.length },
      ],
    },
    { name: "Findings by Severity", data: severityData },
    { name: "Critical Findings", data: reportData.findings.critical as Record<string, unknown>[] },
    { name: "High Findings", data: reportData.findings.high as Record<string, unknown>[] },
    { name: "Upcoming Schedules", data: reportData.schedules.upcoming as Record<string, unknown>[] },
  ];

  exportMultiSheetExcel(sheets, "audit-report");
};

/**
 * Export compliance report to Excel
 */
export const exportComplianceReportExcel = (reportData: {
  controls: {
    total: number;
    byStatus: Record<string, number>;
    effective: number;
    effectiveness: number;
  };
  policies: {
    total: number;
    byStatus: Record<string, number>;
    approved: number;
  };
}) => {
  const controlsData = Object.entries(reportData.controls.byStatus).map(([status, count]) => ({
    Status: status,
    Count: count,
    Percentage: `${Math.round((count / reportData.controls.total) * 100)}%`,
  }));

  const policiesData = Object.entries(reportData.policies.byStatus).map(([status, count]) => ({
    Status: status,
    Count: count,
    Percentage: `${Math.round((count / reportData.policies.total) * 100)}%`,
  }));

  const sheets = [
    {
      name: "Summary",
      data: [
        { Metric: "Total Controls", Value: reportData.controls.total },
        { Metric: "Effective Controls", Value: reportData.controls.effective },
        { Metric: "Effectiveness", Value: `${reportData.controls.effectiveness}%` },
        { Metric: "Total Policies", Value: reportData.policies.total },
        { Metric: "Approved Policies", Value: reportData.policies.approved },
      ],
    },
    { name: "Controls by Status", data: controlsData },
    { name: "Policies by Status", data: policiesData },
  ];

  exportMultiSheetExcel(sheets, "compliance-report");
};

/**
 * Export risk report to Excel
 */
export const exportRiskReportExcel = (reportData: {
  totalRisks: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byImpact: Record<string, number>;
  byLikelihood: Record<string, number>;
  highRisks: unknown[];
}) => {
  const impactData = Object.entries(reportData.byImpact).map(([impact, count]) => ({
    Impact: impact,
    Count: count,
    Percentage: `${Math.round((count / reportData.totalRisks) * 100)}%`,
  }));

  const categoryData = Object.entries(reportData.byCategory).map(([category, count]) => ({
    Category: category,
    Count: count,
    Percentage: `${Math.round((count / reportData.totalRisks) * 100)}%`,
  }));

  const sheets = [
    {
      name: "Summary",
      data: [
        { Metric: "Total Risks", Value: reportData.totalRisks },
        { Metric: "High Priority", Value: reportData.highRisks.length },
        { Metric: "Critical Impact", Value: reportData.byImpact.CRITICAL || 0 },
        { Metric: "High Impact", Value: reportData.byImpact.HIGH || 0 },
      ],
    },
    { name: "By Impact", data: impactData },
    { name: "By Category", data: categoryData },
    { name: "High Priority Risks", data: reportData.highRisks as Record<string, unknown>[] },
  ];

  exportMultiSheetExcel(sheets, "risk-report");
};
