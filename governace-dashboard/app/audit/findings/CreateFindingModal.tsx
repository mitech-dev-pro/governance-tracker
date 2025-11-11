"use client";

import React, { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import {
  CreateFindingInput,
  FINDING_SEVERITIES,
  FINDING_STATUSES,
  FINDING_CATEGORIES,
  FindingStatus,
} from "../../types/audit";
import Dropdown from "@/app/components/Dropdown";

interface CreateFindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface User {
  id: number;
  name: string | null;
  email: string;
}

interface Audit {
  id: number;
  code: string;
  title: string;
}

export default function CreateFindingModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateFindingModalProps) {
  const [formData, setFormData] = useState<CreateFindingInput>({
    auditId: 0,
    title: "",
    description: "",
    severity: "MEDIUM",
    status: "OPEN",
    category: FINDING_CATEGORIES[0],
    recommendation: "",
  });

  const [users, setUsers] = useState<User[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isNonEmpty = (s?: string) => (s ?? "").trim().length > 0;
  const isSelected = (v?: string | number) =>
    typeof v === "number" ? v > 0 : isNonEmpty(v);

  const isValidUrl = (u?: string) => {
    if (!u || u.trim() === "") return true;
    try {
      new URL(u);
      return true;
    } catch {
      return false;
    }
  };

  const requiredFilled =
    isSelected(formData.auditId) &&
    isNonEmpty(formData.severity) &&
    isNonEmpty(formData.category) &&
    isNonEmpty(formData.status) &&
    isNonEmpty(formData.title) &&
    isNonEmpty(formData.description) &&
    isNonEmpty(formData.recommendation) &&
    isValidUrl(formData.evidenceUrl);

  const isDisabled = loading || !requiredFilled;

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [usersRes, auditsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/audit"),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      if (auditsRes.ok) {
        const data = await auditsRes.json();
        setAudits(data.audits || []);
      }
    } catch {
      console.error("Error fetching data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/audit/findings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create finding");
      }
    } catch {
      setError("An error occurred while creating the finding");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      auditId: 0,
      title: "",
      description: "",
      severity: "MEDIUM",
      status: "OPEN",
      category: FINDING_CATEGORIES[0],
      recommendation: "",
    });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/70 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4 transform transition-opacity duration-300 opacity-100 scale-100`}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Create New Finding
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Audit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audit <span className="text-red-500">*</span>
            </label>
            <Dropdown
              placeholder="Select an audit"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  auditId: parseInt(e),
                });
              }}
              value={formData.auditId || ""}
              options={audits.map((audit) => ({
                value: audit.id,
                label: `${audit.code} - ${audit.title}`,
              }))}
            />
            {/* <select
              required
              value={formData.auditId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  auditId: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select audit...</option>
              {audits.map((audit) => (
                <option key={audit.id} value={audit.id}>
                  {audit.code} - {audit.title}
                </option>
              ))}
            </select> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity <span className="text-red-500">*</span>
              </label>
              <Dropdown
                onChange={(e) => {
                  console.log(e);

                  setFormData({
                    ...formData,
                    severity: e as CreateFindingInput["severity"],
                  });
                }}
                value={formData.severity || ""}
                options={FINDING_SEVERITIES.map((severity) => ({
                  value: severity.value,
                  label: severity.label,
                }))}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <Dropdown
                placeholder="Select a category"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    category: e,
                  });
                }}
                value={formData.category}
                options={FINDING_CATEGORIES.map((cat) => ({
                  value: cat,
                  label: cat,
                }))}
              />
              {/* <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {FINDING_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select> */}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Inadequate access controls"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Detailed description of the finding..."
            />
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendation <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.recommendation}
              onChange={(e) =>
                setFormData({ ...formData, recommendation: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Recommended actions to address this finding..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Responsible Person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsible Person
              </label>
              <Dropdown
                placeholder="Select a person"
                dropdownCategory="person"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    responsibleId: parseInt(e),
                  });
                }}
                value={formData.responsibleId || ""}
                options={users.map((user) => ({
                  value: user.id,
                  label: `${user.name || user.email}`,
                }))}
              />
              {/* <select
                value={formData.responsibleId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    responsibleId: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Select person...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select> */}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dueDate: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <Dropdown
                placeholder="Select a status"
                dropdownCategory="status"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    status: e as CreateFindingInput["status"],
                  });
                }}
                value={formData.status || ""}
                options={FINDING_STATUSES.map((status) => ({
                  value: status.value,
                  label: status.label,
                }))}
              />
            </div>
          </div>

          {/* Evidence URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidence URL
            </label>
            <input
              type="url"
              value={formData.evidenceUrl || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  evidenceUrl: e.target.value || undefined,
                })
              }
              className="w-full px-3 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          {/* Remediation Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remediation Plan
            </label>
            <textarea
              value={formData.remediationPlan || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  remediationPlan: e.target.value || undefined,
                })
              }
              rows={2}
              className="w-full px-3 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Detailed remediation steps..."
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isDisabled}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Finding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
