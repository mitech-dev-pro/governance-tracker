"use client";

import React, { useState, useEffect } from "react";
import { X, ClipboardCheck } from "lucide-react";
import {
  CreateAssessmentInput,
  ASSESSMENT_STATUSES,
  ASSESSMENT_RESULTS,
} from "../../types/compliance";

interface CreateAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface User {
  id: number;
  name: string | null;
  email: string;
}

interface Control {
  id: number;
  code: string;
  title: string;
}

export default function CreateAssessmentModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAssessmentModalProps) {
  const [formData, setFormData] = useState<CreateAssessmentInput>({
    title: "",
    description: "",
    status: "SCHEDULED",
    scheduledDate: "",
  });

  const [users, setUsers] = useState<User[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [usersRes, controlsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/compliance/controls"),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      if (controlsRes.ok) {
        const data = await controlsRes.json();
        setControls(data.controls || []);
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
      const response = await fetch("/api/compliance/assessments", {
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
        setError(data.error || "Failed to create assessment");
      }
    } catch {
      setError("An error occurred while creating the assessment");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "SCHEDULED",
      scheduledDate: "",
    });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Create New Assessment
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter assessment title"
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
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the assessment scope and objectives"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Control
              </label>
              <select
                value={formData.controlId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    controlId: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select control (optional)</option>
                {controls.map((control) => (
                  <option key={control.id} value={control.id}>
                    {control.code} - {control.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Assessor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessor
              </label>
              <select
                value={formData.assessorId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assessorId: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select assessor (optional)</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as CreateAssessmentInput["status"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {ASSESSMENT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Result */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Result
              </label>
              <select
                value={formData.result || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    result:
                      (e.target.value as CreateAssessmentInput["result"]) ||
                      undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No result yet</option>
                {ASSESSMENT_RESULTS.map((result) => (
                  <option key={result.value} value={result.value}>
                    {result.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scheduled Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Completed Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completed Date
              </label>
              <input
                type="date"
                value={formData.completedDate || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    completedDate: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Score (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.score || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  score: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0-100"
            />
          </div>

          {/* Findings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Findings
            </label>
            <textarea
              value={formData.findings || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  findings: e.target.value || undefined,
                })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Document assessment findings"
            />
          </div>

          {/* Recommendations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendations
            </label>
            <textarea
              value={formData.recommendations || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recommendations: e.target.value || undefined,
                })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Document recommendations for improvement"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? "Creating..." : "Create Assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
