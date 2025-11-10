"use client";

import React, { useState, useEffect } from "react";
import { X, ClipboardCheck, Trash2 } from "lucide-react";
import {
  Assessment,
  UpdateAssessmentInput,
  ASSESSMENT_STATUSES,
  ASSESSMENT_RESULTS,
} from "../../types/compliance";

interface EditAssessmentModalProps {
  isOpen: boolean;
  assessment: Assessment | null;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: (id: number) => void;
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

export default function EditAssessmentModal({
  isOpen,
  assessment,
  onClose,
  onSuccess,
  onDelete,
}: EditAssessmentModalProps) {
  const [formData, setFormData] = useState<Partial<UpdateAssessmentInput>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && assessment) {
      setFormData({
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        controlId: assessment.controlId,
        assessorId: assessment.assessorId,
        status: assessment.status,
        result: assessment.result,
        score: assessment.score,
        scheduledDate: assessment.scheduledDate,
        completedDate: assessment.completedDate,
        findings: assessment.findings,
        recommendations: assessment.recommendations,
      });
      fetchData();
    }
  }, [isOpen, assessment]);

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
    if (!assessment) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `/api/compliance/assessments/${assessment.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update assessment");
      }
    } catch {
      setError("An error occurred while updating the assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (assessment) {
      onDelete(assessment.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({});
    setError("");
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen || !assessment) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Edit Assessment
            </h2>
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
                  Are you sure you want to delete this assessment? This action
                  cannot be undone.
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

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
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <option value="">No control</option>
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
                <option value="">No assessor</option>
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
                value={formData.status || "SCHEDULED"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as UpdateAssessmentInput["status"],
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
                      (e.target.value as UpdateAssessmentInput["result"]) ||
                      undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No result</option>
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
                value={formData.scheduledDate || ""}
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
            />
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Assessment Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 text-gray-800">
                  {new Date(assessment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <span className="ml-2 text-gray-800">
                  {new Date(assessment.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Assessment</span>
            </button>
            <div className="flex space-x-3">
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
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
