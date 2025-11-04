"use client";

import React, { useState, useEffect } from "react";
import { X, Shield, Check, AlertCircle, Loader2 } from "lucide-react";

interface Permission {
  id: number;
  key: string;
  label: string;
  roleCount: number;
}

interface RolePermission {
  id: number;
  key: string;
  label: string;
}

interface Role {
  id: number;
  name: string;
  createdAt: string;
  permissions: RolePermission[];
  userCount: number;
}

interface EditRoleModalProps {
  role: Role;
  onClose: () => void;
}

export default function EditRoleModal({ role, onClose }: EditRoleModalProps) {
  const [formData, setFormData] = useState({
    name: role.name,
    permissionIds: role.permissions.map((p) => p.id),
  });
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setPermissionsLoading(true);
      const response = await fetch("/api/permissions");
      if (!response.ok) {
        throw new Error("Failed to fetch permissions");
      }
      const data = await response.json();
      setPermissions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load permissions"
      );
    } finally {
      setPermissionsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/roles/${role.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update role");
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  const filteredPermissions = permissions.filter(
    (permission) =>
      permission.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate changes
  const originalPermissionIds = role.permissions.map((p) => p.id);
  const addedPermissions = formData.permissionIds.filter(
    (id) => !originalPermissionIds.includes(id)
  );
  const removedPermissions = originalPermissionIds.filter(
    (id) => !formData.permissionIds.includes(id)
  );
  const hasChanges =
    formData.name !== role.name ||
    addedPermissions.length > 0 ||
    removedPermissions.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Role</h2>
              <p className="text-sm text-gray-500">
                {role.userCount} user{role.userCount !== 1 ? "s" : ""} assigned
                to this role
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-full max-h-[calc(90vh-80px)]"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {/* Changes Summary */}
            {hasChanges && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  Pending Changes:
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {formData.name !== role.name && (
                    <li>
                      • Role name: &quot;{role.name}&quot; → &quot;
                      {formData.name}&quot;
                    </li>
                  )}
                  {addedPermissions.length > 0 && (
                    <li>
                      • Adding {addedPermissions.length} permission
                      {addedPermissions.length !== 1 ? "s" : ""}
                    </li>
                  )}
                  {removedPermissions.length > 0 && (
                    <li>
                      • Removing {removedPermissions.length} permission
                      {removedPermissions.length !== 1 ? "s" : ""}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Role Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter role name..."
                required
              />
            </div>

            {/* User Assignment Warning */}
            {role.userCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This role is assigned to{" "}
                  {role.userCount} user{role.userCount !== 1 ? "s" : ""}.
                  Changes to permissions will affect all assigned users
                  immediately.
                </p>
              </div>
            )}

            {/* Permissions Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>

              {/* Permission Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Permissions List */}
              {permissionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">
                    Loading permissions...
                  </span>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                  {filteredPermissions.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {searchTerm
                        ? "No permissions found matching your search."
                        : "No permissions available."}
                    </div>
                  ) : (
                    filteredPermissions.map((permission) => {
                      const isSelected = formData.permissionIds.includes(
                        permission.id
                      );
                      const wasOriginallySelected =
                        originalPermissionIds.includes(permission.id);
                      const isChanged = isSelected !== wasOriginallySelected;

                      return (
                        <div
                          key={permission.id}
                          className={`flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                            isChanged ? "bg-yellow-50" : ""
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                {permission.label}
                              </h4>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {permission.key}
                              </span>
                              {isChanged && (
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    isSelected
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {isSelected ? "Adding" : "Removing"}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Used in {permission.roleCount} role
                              {permission.roleCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handlePermissionToggle(permission.id)
                            }
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "border-gray-300 hover:border-blue-600"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Selected Permissions Summary */}
              {formData.permissionIds.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    {formData.permissionIds.length} permission
                    {formData.permissionIds.length !== 1 ? "s" : ""} selected
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.permissionIds.map((permissionId) => {
                      const permission = permissions.find(
                        (p) => p.id === permissionId
                      );
                      const isChanged =
                        !originalPermissionIds.includes(permissionId);
                      return permission ? (
                        <span
                          key={permission.id}
                          className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                            isChanged
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {permission.label}
                          {isChanged && <span className="ml-1 text-xs">+</span>}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim() || !hasChanges}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {hasChanges ? "Save Changes" : "No Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
