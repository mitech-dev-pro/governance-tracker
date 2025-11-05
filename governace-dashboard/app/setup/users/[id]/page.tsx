"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Building2,
  Shield,
  Calendar,
  ArrowLeft,
  Edit,
  Trash2,
  ClipboardList,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { User, Role } from "../../../types/user";
import type { Department } from "../../../types/governance";
import EditUserModal from "../EditUserModal";

interface RouteParams {
  id: string;
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState<string>("");
  const [resolvedParams, setResolvedParams] = useState<RouteParams | null>(
    null
  );

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  // Fetch user data
  const fetchUser = async () => {
    if (!resolvedParams?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/users/${resolvedParams.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("User not found");
        } else {
          setError("Failed to load user data");
        }
        return;
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments and roles
  const fetchDepartmentsAndRoles = async () => {
    try {
      const [deptResponse, rolesResponse] = await Promise.all([
        fetch("/api/departments"),
        fetch("/api/roles"),
      ]);

      if (deptResponse.ok) {
        const deptData = await deptResponse.json();
        setDepartments(deptData.departments || deptData);
      }

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setRoles(rolesData);
      }
    } catch (error) {
      console.error("Error fetching departments and roles:", error);
    }
  };

  useEffect(() => {
    if (resolvedParams) {
      fetchUser();
      fetchDepartmentsAndRoles();
    }
  }, [resolvedParams]);

  const handleDeleteUser = async () => {
    if (!user) return;

    if (
      !confirm(
        `Are you sure you want to delete user "${
          user.name || user.email
        }"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to delete user");
        return;
      }

      // Redirect to users list
      router.push("/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const handleUserUpdated = () => {
    setShowEditModal(false);
    fetchUser();
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            User Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/users")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-6 pb-8 min-h-screen">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/users")}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {/* {user.image ? (
                  <img
                    className="h-20 w-20 rounded-full border-4 border-white shadow-lg"
                    src={user.image}
                    alt={user.name || user.email}
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg">
                    <UserIcon className="h-10 w-10 text-blue-600" />
                  </div>
                )} */}
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg">
                  <UserIcon className="h-10 w-10 text-blue-600" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {user.name || "No Name"}
                </h1>
                <div className="flex items-center text-gray-600 mt-1">
                  <Mail className="w-4 h-4 mr-2" />
                  {user.email}
                </div>
                <div className="flex items-center text-gray-500 mt-1 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {formatDate(user.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit User
              </button>
              <button
                onClick={handleDeleteUser}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Governance Items
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user._count?.governanceitem || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Action Items
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user._count?.actionitem || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assignments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user._count?.assignment || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.departments?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Departments Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Departments
            </h3>
            {user.departments && user.departments.length > 0 ? (
              <div className="space-y-3">
                {user.departments.map((userDept) => (
                  <div
                    key={userDept.id}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {userDept.department.name}
                      </div>
                      {userDept.department.code && (
                        <div className="text-sm text-gray-500">
                          Code: {userDept.department.code}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Assigned {formatDate(userDept.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No departments assigned</p>
              </div>
            )}
          </div>

          {/* Roles Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Roles
            </h3>
            {user.roles && user.roles.length > 0 ? (
              <div className="space-y-3">
                {user.roles.map((userRole) => (
                  <div
                    key={userRole.id}
                    className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {userRole.role.name}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Assigned {formatDate(userRole.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No roles assigned</p>
              </div>
            )}
          </div>

          {/* Account Information Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
              Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <p className="text-gray-900">{user.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <p className="text-gray-900">{user.name || "Not provided"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Created
                </label>
                <p className="text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Updated
                </label>
                <p className="text-gray-900">{formatDate(user.updatedAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image
                </label>
                <p className="text-gray-900">
                  {user.image ? "Configured" : "Not configured"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <EditUserModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onUserUpdated={handleUserUpdated}
          departments={departments}
          roles={roles}
        />
      )}
    </div>
  );
}
