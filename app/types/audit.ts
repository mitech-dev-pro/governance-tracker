// Audit Types
export interface Audit {
  id: number;
  code: string;
  title: string;
  description: string;
  type: AuditType;
  status: AuditStatus;
  scope: string;
  leadAuditorId?: number;
  departmentId?: number;
  startDate: string;
  endDate: string;
  reportDate?: string;
  conclusion?: string;
  createdAt: string;
  updatedAt: string;
  leadAuditor?: {
    id: number;
    name: string | null;
    email: string;
  };
  department?: {
    id: number;
    name: string;
    code?: string;
  };
  findings?: AuditFinding[];
  schedules?: AuditSchedule[];
}

export type AuditType =
  | "INTERNAL"
  | "EXTERNAL"
  | "COMPLIANCE"
  | "FINANCIAL"
  | "OPERATIONAL"
  | "IT"
  | "QUALITY";
export type AuditStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "FIELD_WORK"
  | "REPORTING"
  | "COMPLETED"
  | "CANCELLED";

export const AUDIT_TYPES: { value: AuditType; label: string; color: string }[] =
  [
    { value: "INTERNAL", label: "Internal", color: "blue" },
    { value: "EXTERNAL", label: "External", color: "purple" },
    { value: "COMPLIANCE", label: "Compliance", color: "green" },
    { value: "FINANCIAL", label: "Financial", color: "yellow" },
    { value: "OPERATIONAL", label: "Operational", color: "orange" },
    { value: "IT", label: "IT", color: "indigo" },
    { value: "QUALITY", label: "Quality", color: "pink" },
  ];

export const AUDIT_STATUSES: {
  value: AuditStatus;
  label: string;
  color: string;
}[] = [
  { value: "PLANNED", label: "Planned", color: "gray" },
  { value: "IN_PROGRESS", label: "In Progress", color: "blue" },
  { value: "FIELD_WORK", label: "Field Work", color: "yellow" },
  { value: "REPORTING", label: "Reporting", color: "orange" },
  { value: "COMPLETED", label: "Completed", color: "green" },
  { value: "CANCELLED", label: "Cancelled", color: "red" },
];

// Finding Types
export interface AuditFinding {
  id: number;
  auditId: number;
  title: string;
  description: string;
  severity: FindingSeverity;
  status: FindingStatus;
  category: string;
  recommendation: string;
  responsibleId?: number;
  dueDate?: string;
  closedDate?: string;
  evidenceUrl?: string;
  remediationPlan?: string;
  createdAt: string;
  updatedAt: string;
  audit?: {
    id: number;
    code: string;
    title: string;
  };
  responsible?: {
    id: number;
    name: string | null;
    email: string;
  };
}

export type FindingSeverity =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "INFORMATIONAL";
export type FindingStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "DEFERRED";

export const FINDING_SEVERITIES: {
  value: FindingSeverity;
  label: string;
  color: string;
}[] = [
  { value: "CRITICAL", label: "Critical", color: "red" },
  { value: "HIGH", label: "High", color: "orange" },
  { value: "MEDIUM", label: "Medium", color: "yellow" },
  { value: "LOW", label: "Low", color: "blue" },
  { value: "INFORMATIONAL", label: "Informational", color: "gray" },
];

export const FINDING_STATUSES: {
  value: FindingStatus;
  label: string;
  color: string;
}[] = [
  { value: "OPEN", label: "Open", color: "red" },
  { value: "IN_PROGRESS", label: "In Progress", color: "yellow" },
  { value: "RESOLVED", label: "Resolved", color: "green" },
  { value: "CLOSED", label: "Closed", color: "gray" },
  { value: "DEFERRED", label: "Deferred", color: "orange" },
];

export const FINDING_CATEGORIES = [
  "Access Control",
  "Data Security",
  "Policy Compliance",
  "Process Control",
  "Documentation",
  "Risk Management",
  "Financial Control",
  "Operational Efficiency",
  "IT Security",
  "Quality Assurance",
];

// Schedule Types
export interface AuditSchedule {
  id: number;
  auditId: number;
  title: string;
  description: string;
  scheduledDate: string;
  duration: number;
  location?: string;
  attendees?: string[];
  status: ScheduleStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  audit?: {
    id: number;
    code: string;
    title: string;
  };
}

export type ScheduleStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED";

export const SCHEDULE_STATUSES: {
  value: ScheduleStatus;
  label: string;
  color: string;
}[] = [
  { value: "SCHEDULED", label: "Scheduled", color: "blue" },
  { value: "IN_PROGRESS", label: "In Progress", color: "yellow" },
  { value: "COMPLETED", label: "Completed", color: "green" },
  { value: "CANCELLED", label: "Cancelled", color: "red" },
  { value: "RESCHEDULED", label: "Rescheduled", color: "orange" },
];

// Create/Update Input Types
export interface CreateAuditInput {
  code: string;
  title: string;
  description: string;
  type: AuditType;
  status?: AuditStatus;
  scope: string;
  leadAuditorId?: number;
  departmentId?: number;
  startDate: string;
  endDate: string;
  reportDate?: string;
  conclusion?: string;
}

export interface UpdateAuditInput extends Partial<CreateAuditInput> {
  id: number;
}

export interface CreateFindingInput {
  auditId: number;
  title: string;
  description: string;
  severity: FindingSeverity;
  status?: FindingStatus;
  category: string;
  recommendation: string;
  responsibleId?: number;
  dueDate?: string;
  closedDate?: string;
  evidenceUrl?: string;
  remediationPlan?: string;
}

export interface UpdateFindingInput extends Partial<CreateFindingInput> {
  id: number;
}

export interface CreateScheduleInput {
  auditId: number;
  title: string;
  description: string;
  scheduledDate: string;
  duration?: number;
  location?: string;
  attendees?: string[];
  status?: ScheduleStatus;
  notes?: string;
}

export interface UpdateScheduleInput extends Partial<CreateScheduleInput> {
  id: number;
}
