// Control Types
export interface Control {
  id: number;
  code: string;
  title: string;
  description: string;
  category: string;
  status: ControlStatus;
  frequency: ControlFrequency;
  ownerId?: number;
  departmentId?: number;
  policyId?: number;
  riskId?: number;
  effectiveness?: number;
  lastReviewed?: string;
  nextReview?: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: number;
    name: string | null;
    email: string;
  };
  department?: {
    id: number;
    name: string;
    code?: string;
  };
  policy?: {
    id: number;
    code: string;
    title: string;
  };
  risk?: {
    id: number;
    title: string;
    rating: number;
  };
}

export type ControlStatus = "ACTIVE" | "INACTIVE" | "UNDER_REVIEW" | "DEPRECATED";
export type ControlFrequency = "CONTINUOUS" | "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY" | "AD_HOC";

export const CONTROL_STATUSES: { value: ControlStatus; label: string; color: string }[] = [
  { value: "ACTIVE", label: "Active", color: "green" },
  { value: "INACTIVE", label: "Inactive", color: "gray" },
  { value: "UNDER_REVIEW", label: "Under Review", color: "yellow" },
  { value: "DEPRECATED", label: "Deprecated", color: "red" },
];

export const CONTROL_FREQUENCIES: { value: ControlFrequency; label: string }[] = [
  { value: "CONTINUOUS", label: "Continuous" },
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUALLY", label: "Annually" },
  { value: "AD_HOC", label: "Ad-Hoc" },
];

export const CONTROL_CATEGORIES = [
  "Access Control",
  "Data Protection",
  "Security Operations",
  "Incident Response",
  "Business Continuity",
  "Compliance",
  "Risk Management",
  "Asset Management",
  "Change Management",
  "Vendor Management",
];

// Policy Types
export interface Policy {
  id: number;
  code: string;
  title: string;
  description: string;
  category: string;
  status: PolicyStatus;
  version: string;
  ownerId?: number;
  departmentId?: number;
  approvedBy?: number;
  approvedDate?: string;
  effectiveDate?: string;
  reviewDate?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: number;
    name: string | null;
    email: string;
  };
  department?: {
    id: number;
    name: string;
    code?: string;
  };
  approver?: {
    id: number;
    name: string | null;
    email: string;
  };
}

export type PolicyStatus = "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";

export const POLICY_STATUSES: { value: PolicyStatus; label: string; color: string }[] = [
  { value: "DRAFT", label: "Draft", color: "gray" },
  { value: "UNDER_REVIEW", label: "Under Review", color: "yellow" },
  { value: "APPROVED", label: "Approved", color: "blue" },
  { value: "PUBLISHED", label: "Published", color: "green" },
  { value: "ARCHIVED", label: "Archived", color: "red" },
];

export const POLICY_CATEGORIES = [
  "Information Security",
  "Data Privacy",
  "Access Control",
  "Acceptable Use",
  "Business Continuity",
  "Incident Response",
  "Risk Management",
  "Compliance",
  "Human Resources",
  "Operations",
];

// Assessment Types
export interface Assessment {
  id: number;
  title: string;
  description: string;
  controlId?: number;
  assessorId?: number;
  status: AssessmentStatus;
  result?: AssessmentResult;
  score?: number;
  scheduledDate: string;
  completedDate?: string;
  findings?: string;
  recommendations?: string;
  createdAt: string;
  updatedAt: string;
  control?: {
    id: number;
    code: string;
    title: string;
  };
  assessor?: {
    id: number;
    name: string | null;
    email: string;
  };
}

export type AssessmentStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
export type AssessmentResult = "PASSED" | "FAILED" | "PARTIALLY_COMPLIANT" | "NOT_APPLICABLE";

export const ASSESSMENT_STATUSES: { value: AssessmentStatus; label: string; color: string }[] = [
  { value: "SCHEDULED", label: "Scheduled", color: "blue" },
  { value: "IN_PROGRESS", label: "In Progress", color: "yellow" },
  { value: "COMPLETED", label: "Completed", color: "green" },
  { value: "OVERDUE", label: "Overdue", color: "red" },
];

export const ASSESSMENT_RESULTS: { value: AssessmentResult; label: string; color: string }[] = [
  { value: "PASSED", label: "Passed", color: "green" },
  { value: "FAILED", label: "Failed", color: "red" },
  { value: "PARTIALLY_COMPLIANT", label: "Partially Compliant", color: "yellow" },
  { value: "NOT_APPLICABLE", label: "Not Applicable", color: "gray" },
];

// Create/Update Input Types
export interface CreateControlInput {
  code: string;
  title: string;
  description: string;
  category: string;
  status?: ControlStatus;
  frequency?: ControlFrequency;
  ownerId?: number;
  departmentId?: number;
  policyId?: number;
  riskId?: number;
  effectiveness?: number;
  lastReviewed?: string;
  nextReview?: string;
}

export interface UpdateControlInput extends Partial<CreateControlInput> {
  id: number;
}

export interface CreatePolicyInput {
  code: string;
  title: string;
  description: string;
  category: string;
  version: string;
  status?: PolicyStatus;
  ownerId?: number;
  departmentId?: number;
  approvedBy?: number;
  approvedDate?: string;
  effectiveDate?: string;
  reviewDate?: string;
  attachmentUrl?: string;
}

export interface UpdatePolicyInput extends Partial<CreatePolicyInput> {
  id: number;
}

export interface CreateAssessmentInput {
  title: string;
  description: string;
  controlId?: number;
  assessorId?: number;
  status?: AssessmentStatus;
  result?: AssessmentResult;
  score?: number;
  scheduledDate: string;
  completedDate?: string;
  findings?: string;
  recommendations?: string;
}

export interface UpdateAssessmentInput extends Partial<CreateAssessmentInput> {
  id: number;
}
