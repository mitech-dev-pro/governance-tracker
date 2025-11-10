"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { CreateScheduleInput, SCHEDULE_STATUSES } from "../../types/audit";

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Audit {
  id: number;
  code: string;
  title: string;
}

export default function CreateScheduleModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateScheduleModalProps) {
  const [formData, setFormData] = useState<CreateScheduleInput>({
    auditId: 0,
    title: "",
    description: "",
    scheduledDate: "",
    duration: 1,
    status: "SCHEDULED",
  });

  const [audits, setAudits] = useState<Audit[]>([]);
  const [attendeesInput, setAttendeesInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchAudits();
    }
  }, [isOpen]);

  const fetchAudits = async () => {
    try {
      const response = await fetch("/api/audit");
      if (response.ok) {
        const data = await response.json();
        setAudits(data.audits || []);
      }
    } catch {
      console.error("Error fetching audits");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const response = await fetch("/api/audit/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create schedule");
      }
    } catch {
      setError("An error occurred while creating the schedule");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      auditId: 0,
      title: "",
      description: "",
      scheduledDate: "",
      duration: 1,
      status: "SCHEDULED",
    });
    setAttendeesInput("");
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
            <Calendar className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Create New Schedule
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
            <select
              required
              value={formData.auditId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  auditId: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select audit...</option>
              {audits.map((audit) => (
                <option key={audit.id} value={audit.id}>
                  {audit.code} - {audit.title}
                </option>
              ))}
            </select>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Kickoff Meeting"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Initial meeting to discuss audit scope and approach..."
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
                value={formData.scheduledDate}
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
                value={formData.duration}
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
                value={formData.status}
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
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
