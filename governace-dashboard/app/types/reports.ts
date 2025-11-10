// Report Types
export interface ReportMetadata {
  title: string;
  description: string;
  generatedAt: Date;
  generatedBy?: string;
  category: ReportCategory;
}

export type ReportCategory =
  | "governance"
  | "audit"
  | "compliance"
  | "risk"
  | "management";

export type ExportFormat = "pdf" | "excel" | "csv";

// Governance Report Types
export interface GovernanceReportData {
  totalItems: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byDepartment: Record<string, number>;
  recentItems: any[];
  upcomingMeetings: any[];
  actionItems: any[];
}

// Audit Report Types
export interface AuditReportData {
  totalAudits: number;
  findings: {
    total: number;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    critical: any[];
    high: any[];
  };
  schedules: {
    total: number;
    upcoming: any[];
    completed: any[];
  };
}

// Compliance Report Types
export interface ComplianceReportData {
  controls: {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    effective: number;
    effectiveness: number;
  };
  policies: {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    approved: number;
  };
  assessments: {
    total: number;
    byStatus: Record<string, number>;
    byResult: Record<string, number>;
    completed: number;
    averageScore: number;
  };
}

// Risk Report Types
export interface RiskReportData {
  totalRisks: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byImpact: Record<string, number>;
  byLikelihood: Record<string, number>;
  highRisks: any[];
  mitigations: any[];
}

// Management Report Types (Executive Summary)
export interface ManagementReportData {
  governance: {
    total: number;
    active: number;
    completed: number;
  };
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
  risk: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  trends: {
    governanceGrowth: number;
    auditCompletion: number;
    complianceScore: number;
    riskReduction: number;
  };
}

// Export Configuration
export interface ExportConfig {
  format: ExportFormat;
  includeCharts?: boolean;
  includeSummary?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
}

// Bulk Export Types
export interface BulkExportRequest {
  reports: ReportCategory[];
  format: ExportFormat;
  config?: ExportConfig;
}
