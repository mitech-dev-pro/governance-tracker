"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowLeft,
  MapPin,
  Users,
} from "lucide-react";
import Link from "next/link";
import { AuditSchedule, SCHEDULE_STATUSES } from "../../types/audit";
import CreateScheduleModal from "./CreateScheduleModal";
import EditScheduleModal from "./EditScheduleModal";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<AuditSchedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<AuditSchedule[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<AuditSchedule | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/audit/schedules");
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules || []);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...schedules];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (schedule) =>
          schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schedule.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (schedule.location &&
            schedule.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(
        (schedule) => schedule.status === statusFilter
      );
    }

    setFilteredSchedules(filtered);
  }, [schedules, searchTerm, statusFilter]);

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleEditSchedule = (schedule: AuditSchedule) => {
    setSelectedSchedule(schedule);
    setShowEditModal(true);
  };

  const handleDeleteSchedule = () => {
    fetchSchedules();
  };

  // Calculate statistics
  const stats = {
    total: schedules.length,
    scheduled: schedules.filter((s) => s.status === "SCHEDULED").length,
    inProgress: schedules.filter((s) => s.status === "IN_PROGRESS").length,
    completed: schedules.filter((s) => s.status === "COMPLETED").length,
  };

  // Group schedules by month for calendar view
  const schedulesByMonth = filteredSchedules.reduce((acc, schedule) => {
    const month = new Date(schedule.scheduledDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    if (!acc[month]) acc[month] = [];
    acc[month].push(schedule);
    return acc;
  }, {} as Record<string, AuditSchedule[]>);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Link
                  href="/audit"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                  <Calendar className="w-8 h-8 text-indigo-600" />
                  <span>Audit Schedules</span>
                </h1>
              </div>
              <p className="text-gray-600 ml-12">
                Plan and manage audit schedules and activities
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Schedule</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Schedules</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.total}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-indigo-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.scheduled}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.inProgress}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search schedules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  {SCHEDULE_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading schedules...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(schedulesByMonth).length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No schedules found. Create one to get started.
                </p>
              </div>
            ) : (
              Object.entries(schedulesByMonth).map(
                ([month, monthSchedules]) => (
                  <div key={month} className="bg-white rounded-lg shadow">
                    <div className="bg-indigo-50 px-6 py-3 border-b">
                      <h3 className="text-lg font-semibold text-indigo-900">
                        {month}
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {monthSchedules.map((schedule) => {
                        const status = SCHEDULE_STATUSES.find(
                          (s) => s.value === schedule.status
                        );
                        const attendeesList =
                          (schedule.attendees as string[]) || [];

                        return (
                          <div
                            key={schedule.id}
                            onClick={() => handleEditSchedule(schedule)}
                            className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    {schedule.title}
                                  </h4>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${status?.color}-100 text-${status?.color}-800`}
                                  >
                                    {status?.label}
                                  </span>
                                </div>
                                <p className="text-gray-600 mb-3">
                                  {schedule.description}
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {new Date(
                                        schedule.scheduledDate
                                      ).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{schedule.duration} hour(s)</span>
                                  </div>
                                  {schedule.location && (
                                    <div className="flex items-center space-x-1">
                                      <MapPin className="w-4 h-4" />
                                      <span>{schedule.location}</span>
                                    </div>
                                  )}
                                  {attendeesList.length > 0 && (
                                    <div className="flex items-center space-x-1">
                                      <Users className="w-4 h-4" />
                                      <span>
                                        {attendeesList.length} attendee(s)
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {schedule.audit && (
                                  <div className="mt-2 text-sm text-gray-500">
                                    Audit:{" "}
                                    <span className="font-medium text-gray-700">
                                      {schedule.audit.code} -{" "}
                                      {schedule.audit.title}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateScheduleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchSchedules}
      />

      <EditScheduleModal
        isOpen={showEditModal}
        schedule={selectedSchedule}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSchedule(null);
        }}
        onSuccess={fetchSchedules}
        onDelete={handleDeleteSchedule}
      />
    </div>
  );
}
