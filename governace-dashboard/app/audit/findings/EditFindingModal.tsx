"use client";

import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import {
  AuditFinding,
  UpdateFindingInput,
  FINDING_SEVERITIES,
  FINDING_STATUSES,
  FINDING_CATEGORIES,
} from "../../types/audit";

interface EditFindingModalProps {
  isOpen: boolean;
  finding: AuditFinding | null;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: () => void;
}

interface User {
  id: number;
  name: string | null;
  email: string;
}

export default function EditFindingModal({
  isOpen,
  finding,
  onClose,
  onSuccess,
  onDelete,
}: EditFindingModalProps) {
  const [formData, setFormData] = useState<Partial<UpdateFindingInput>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && finding) {
      setFormData({
        id: finding.id,
        auditId: finding.auditId,
        title: finding.title,
        description: finding.description,
        severity: finding.severity,
        status: finding.status,
        category: finding.category,
        recommendation: finding.recommendation,
        responsibleId: finding.responsibleId,
        dueDate: finding.dueDate
          ? new Date(finding.dueDate).toISOString().split("T")[0]
          : undefined,
        closedDate: finding.closedDate
          ? new Date(finding.closedDate).toISOString().split("T")[0]
          : undefined,
        evidenceUrl: finding.evidenceUrl || undefined,
        remediationPlan: finding.remediationPlan || undefined,
      });
      fetchUsers();
    }
  }, [isOpen, finding]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch {
      console.error("Error fetching users");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finding) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/audit/findings/${finding.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update finding");
      }
    } catch {
      setError("An error occurred while updating the finding");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFinding = async () => {
    if (!finding) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/audit/findings/${finding.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDelete();
        setShowDeleteConfirm(false);
        onClose();
      } else {
        setError("Failed to delete finding");
      }
    } catch {
      setError("An error occurred while deleting the finding");
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setError("");
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen || !finding) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-800">Edit Finding</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-semibold">Confirm Delete</h3>
                <p className="text-red-700 text-sm mt-1">
                  Are you sure you want to delete this finding? This action
                  cannot be undone.
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFinding}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && !showDeleteConfirm && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Audit Info (Read-only) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audit
            </label>
            <div className="text-sm text-gray-900">
              {finding.audit
                ? `${finding.audit.code} - ${finding.audit.title}`
                : "N/A"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.severity || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    severity: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {FINDING_SEVERITIES.map((severity) => (
                  <option key={severity.value} value={severity.value}>
                    {severity.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.category || ""}
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
              </select>
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
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendation <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.recommendation || ""}
              onChange={(e) =>
                setFormData({ ...formData, recommendation: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Responsible Person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsible Person
              </label>
              <select
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
              </select>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.status || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {FINDING_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Closed Date (if status is CLOSED) */}
          {formData.status === "CLOSED" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Closed Date
              </label>
              <input
                type="date"
                value={formData.closedDate || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    closedDate: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          )}

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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Detailed remediation steps..."
            />
          </div>

          {/* Finding Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Finding Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>{" "}
                <span className="font-semibold">
                  {new Date(finding.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Updated:</span>{" "}
                <span className="font-semibold">
                  {new Date(finding.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Finding</span>
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Finding"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
