export interface Risk {
  id: number;
  title: string;
  ownerId?: number;
  impact: number; // 1-5 scale
  likelihood: number; // 1-5 scale
  rating: number; // impact * likelihood
  status: RiskStatus;
  notes?: string;
  relatedItemId?: number;
  departmentId?: number;
  createdAt: string;
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
  governanceitem?: {
    id: number;
    title: string;
    number?: number;
  };
}

export type RiskStatus = 
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "AT_RISK"
  | "COMPLETED"
  | "DEFERRED";

export interface CreateRiskInput {
  title: string;
  ownerId?: number;
  impact: number;
  likelihood: number;
  status?: RiskStatus;
  notes?: string;
  relatedItemId?: number;
  departmentId?: number;
}

export interface UpdateRiskInput extends Partial<CreateRiskInput> {
  id: number;
}

export const RISK_STATUSES: { value: RiskStatus; label: string; color: string }[] = [
  { value: "NOT_STARTED", label: "Not Started", color: "gray" },
  { value: "IN_PROGRESS", label: "In Progress", color: "blue" },
  { value: "BLOCKED", label: "Blocked", color: "red" },
  { value: "AT_RISK", label: "At Risk", color: "orange" },
  { value: "COMPLETED", label: "Completed", color: "green" },
  { value: "DEFERRED", label: "Deferred", color: "purple" },
];

export const IMPACT_LEVELS = [
  { value: 1, label: "Very Low", description: "Minimal impact" },
  { value: 2, label: "Low", description: "Minor impact" },
  { value: 3, label: "Medium", description: "Moderate impact" },
  { value: 4, label: "High", description: "Significant impact" },
  { value: 5, label: "Very High", description: "Severe impact" },
];

export const LIKELIHOOD_LEVELS = [
  { value: 1, label: "Very Low", description: "Rare" },
  { value: 2, label: "Low", description: "Unlikely" },
  { value: 3, label: "Medium", description: "Possible" },
  { value: 4, label: "High", description: "Likely" },
  { value: 5, label: "Very High", description: "Almost certain" },
];

// Risk rating color coding based on rating value (1-25)
export const getRiskColor = (rating: number): string => {
  if (rating >= 20) return "red"; // Critical
  if (rating >= 15) return "orange"; // High
  if (rating >= 10) return "yellow"; // Medium
  if (rating >= 5) return "lime"; // Low
  return "green"; // Very Low
};

export const getRiskLevel = (rating: number): string => {
  if (rating >= 20) return "Critical";
  if (rating >= 15) return "High";
  if (rating >= 10) return "Medium";
  if (rating >= 5) return "Low";
  return "Very Low";
};
