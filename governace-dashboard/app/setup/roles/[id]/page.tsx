"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Users,
  Settings,
  Calendar,
  Edit,
  Trash2,
  UserCheck,
  Key,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import EditRoleModal from "../EditRoleModal";

interface Permission {
  id: number;
  key: string;
  label: string;
}

interface Department {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string | null;
  email: string;
  image: string | null;
  departments: Department[];
}

interface RoleDetail {
  id: number;
  name: string;
  createdAt: string;
  permissions: Permission[];
  users: User[];
  userCount: number;
}

export default function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [role, setRole] = useState<RoleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();

  // Unwrap params
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchRole();
    }
  }, [resolvedParams]);

  const fetchRole = async () => {
    if (!resolvedParams?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/roles/${resolvedParams.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Role not found");
        }
        throw new Error("Failed to fetch role details");
      }

      const data = await response.json();
      setRole(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching role:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!role) return;

    try {
      setDeleteLoading(true);
      const response = await fetch(`/api/roles/${role.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete role");
      }

      router.push("/roles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    fetchRole(); // Refresh role data
  };

  const getPermissionBadgeColor = (permission: Permission) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
    ];
    return colors[permission.id % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || "Role Not Found"}
            </h2>
            <p className="text-gray-600 mb-6">
              {error?.includes("not found")
                ? "The role you are looking for does not exist or may have been deleted."
                : "There was an error loading the role details."}
            </p>
            <Link
              href="/roles"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Roles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/roles"
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {role.name}
                </h1>
                <p className="text-gray-600">
                  Created on{" "}
                  {new Date(role.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Role
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={role.userCount > 0}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assigned Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {role.userCount}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Permissions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {role.permissions.length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Key className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Days Active</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.floor(
                    (new Date().getTime() -
                      new Date(role.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Permissions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Key className="h-5 w-5 text-purple-600" />
                Permissions ({role.permissions.length})
              </h2>
            </div>

            {role.permissions.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No permissions assigned to this role
                </p>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Add permissions
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {role.permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {permission.label}
                      </h3>
                      <p className="text-sm text-gray-600">{permission.key}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPermissionBadgeColor(
                        permission
                      )}`}
                    >
                      {permission.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                Assigned Users ({role.userCount})
              </h2>
            </div>

            {role.users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users assigned to this role</p>
              </div>
            ) : (
              <div className="space-y-3">
                {role.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 mr-4">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || user.email}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name || "Unnamed User"}
                        </p>
                        <Link
                          href={`/users/${user.id}`}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          View
                        </Link>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                      {user.departments.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.departments.map((dept) => (
                            <span
                              key={dept.id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700"
                            >
                              {dept.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Role Modal */}
      {showEditModal && (
        <EditRoleModal role={role} onClose={handleModalClose} />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Role
              </h3>
            </div>

            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the role &quot;{role.name}&quot;?
              This action cannot be undone.
            </p>

            {role.userCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-yellow-800 text-sm">
                  This role is assigned to {role.userCount} user(s). Please
                  remove all user assignments before deleting.
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading || role.userCount > 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleteLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
