"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Lock,
  Building2,
  Shield,
  Save,
  AlertCircle,
  Eye,
  EyeOff,
  User as UserIcon,
} from "lucide-react";
import type { User as UserType, UpdateUserData } from "../../types/user";
import type { Department } from "../../types/governance";
import ImageUpload from "../../components/ImageUpload";

interface Role {
  id: number;
  name: string;
}

interface EditUserModalProps {
  user: UserType;
  onClose: () => void;
  onUserUpdated: () => void;
  departments: Department[];
  roles: Role[];
}

export default function EditUserModal({
  user,
  onClose,
  onUserUpdated,
  departments,
  roles,
}: EditUserModalProps) {
  const [formData, setFormData] = useState<UpdateUserData>({
    name: user.name || "",
    email: user.email,
    password: "", // Leave empty - user can choose to update
    image: user.image || "",
    departmentIds: user.departments?.map((d) => d.departmentId) || [],
    roleIds: user.roles?.map((r) => r.roleId) || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof UpdateUserData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors((prev) => ({
        ...prev,
        [field as string]: "",
      }));
    }
  };

  const handleDepartmentChange = (departmentId: number, checked: boolean) => {
    const currentIds = formData.departmentIds || [];
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        departmentIds: [...currentIds, departmentId],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        departmentIds: currentIds.filter((id) => id !== departmentId),
      }));
    }
  };

  const handleRoleChange = (roleId: number, checked: boolean) => {
    const currentIds = formData.roleIds || [];
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        roleIds: [...currentIds, roleId],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        roleIds: currentIds.filter((id) => id !== roleId),
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password is optional for updates
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Prepare update data - exclude empty password
      const updateData: UpdateUserData = {
        name: formData.name,
        email: formData.email,
        image: formData.image || undefined,
        departmentIds: formData.departmentIds,
        roleIds: formData.roleIds,
      };

      // Only include password if it's provided
      if (formData.password?.trim()) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          setErrors({ email: "User with this email already exists" });
        } else {
          setErrors({ general: errorData.error || "Failed to update user" });
        }
        return;
      }

      onUserUpdated();
    } catch (error) {
      console.error("Error updating user:", error);
      setErrors({ general: "Failed to update user. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <UserIcon className="w-6 h-6 mr-2 text-blue-600" />
            Edit User: {user.name || user.email}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form - Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-800">{errors.general}</span>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password{" "}
                  <span className="text-gray-400">
                    (Optional - leave blank to keep current)
                  </span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password || ""}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter new password (optional)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image (Optional)
                </label>
                <ImageUpload
                  currentImage={formData.image || user.image || ""}
                  onImageChange={(imageUrl) =>
                    handleInputChange("image", imageUrl)
                  }
                  onImageRemove={() => handleInputChange("image", "")}
                  size="md"
                />
              </div>
            </div>

            {/* Departments */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                Departments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {departments.map((department) => (
                  <label
                    key={department.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        formData.departmentIds?.includes(department.id) || false
                      }
                      onChange={(e) =>
                        handleDepartmentChange(department.id, e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {department.name}
                    </span>
                    {department.code && (
                      <span className="text-xs text-gray-500">
                        ({department.code})
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Roles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Roles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.roleIds?.includes(role.id) || false}
                      onChange={(e) =>
                        handleRoleChange(role.id, e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{role.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Update User
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
