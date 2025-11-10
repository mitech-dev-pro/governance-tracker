"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Trash2 } from "lucide-react";
import {
  AuditSchedule,
  UpdateScheduleInput,
  SCHEDULE_STATUSES,
} from "../../types/audit";

interface EditScheduleModalProps {
  isOpen: boolean;
  schedule: AuditSchedule | null;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: () => void;
}

export default function EditScheduleModal({
  isOpen,
  schedule,
  onClose,
  onSuccess,
  onDelete,
}: EditScheduleModalProps) {
  const [formData, setFormData] = useState<Partial<UpdateScheduleInput>>({});
  const [attendeesInput, setAttendeesInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && schedule) {
      const attendeesList = (schedule.attendees as string[]) || [];
      setFormData({
        id: schedule.id,
        auditId: schedule.auditId,
        title: schedule.title,
        description: schedule.description,
        scheduledDate: schedule.scheduledDate
          ? new Date(schedule.scheduledDate).toISOString().split("T")[0]
          : "",
        duration: schedule.duration,
        location: schedule.location || undefined,
        status: schedule.status,
        notes: schedule.notes || undefined,
      });
      setAttendeesInput(attendeesList.join(", "));
    }
  }, [isOpen, schedule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedule) return;

    setError("");
    setLoading(true);

    try {
      // Parse attendees from comma-separated input
      const attendeesList = attendeesInput
        ? attendeesInput
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
        : undefined;

      const payload = {
        ...formData,
        attendees: attendeesList,
      };

      const response = await fetch(`/api/audit/schedules/${schedule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update schedule");
      }
    } catch {
      setError("An error occurred while updating the schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!schedule) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/audit/schedules/${schedule.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDelete();
        setShowDeleteConfirm(false);
        onClose();
      } else {
        setError("Failed to delete schedule");
      }
    } catch {
      setError("An error occurred while deleting the schedule");
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setAttendeesInput("");
    setError("");
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen || !schedule) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-800">Edit Schedule</h2>
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
                  Are you sure you want to delete this schedule? This action
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
                  onClick={handleDeleteSchedule}
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
              {schedule.audit
                ? `${schedule.audit.code} - ${schedule.audit.title}`
                : "N/A"}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (hours) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0.5"
                step="0.5"
                value={formData.duration || 1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {SCHEDULE_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: e.target.value || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Conference Room A, Building 1"
            />
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attendees
            </label>
            <input
              type="text"
              value={attendeesInput}
              onChange={(e) => setAttendeesInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="John Doe, Jane Smith, Bob Johnson (comma-separated)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter names separated by commas
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notes: e.target.value || undefined,
                })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Additional notes..."
            />
          </div>

          {/* Schedule Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Schedule Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>{" "}
                <span className="font-semibold">
                  {new Date(schedule.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Updated:</span>{" "}
                <span className="font-semibold">
                  {new Date(schedule.updatedAt).toLocaleDateString()}
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
              <span>Delete Schedule</span>
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Schedule"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
