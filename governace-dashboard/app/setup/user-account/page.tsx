"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import ImageUpload from "../../components/ImageUpload";
import { useUser } from "../../contexts/UserContext";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  departments?: Array<{
    id: number;
    department: {
      id: number;
      name: string;
      code?: string;
    };
  }>;
  roles?: Array<{
    id: number;
    role: {
      id: number;
      name: string;
    };
  }>;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function UserAccountPage() {
  const { user: currentUser, refetchUser } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form data for profile editing
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    image: "",
  });

  // Fetch current user profile
  useEffect(() => {
    if (currentUser) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userProfile: UserProfile = {
        ...currentUser,
        name: currentUser.name || "",
        image: currentUser.image || undefined,
        createdAt: currentUser.createdAt.toString(),
        updatedAt: currentUser.updatedAt.toString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        departments: currentUser.userdepartment as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        roles: currentUser.userrole as any,
      };
      setProfile(userProfile);
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email,
        image: currentUser.image || "",
      });
      setLoading(false);
    }
  }, [currentUser]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const { user: updatedProfile } = await response.json();
        setProfile(updatedProfile);
        setEditing(false);
        setMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        // Refetch user to update navbar
        refetchUser();

        // Trigger event for other components that might need to refresh
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("userProfileUpdated"));
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: "error",
        text: "New passwords don't match",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters long",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setShowPasswordChange(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setMessage({
          type: "success",
          text: "Password changed successfully!",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to change password",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-6 pb-8 min-h-screen">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                My Account
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your personal information and account settings
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {message.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-3" />
              )}
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">
              Profile Information
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleProfileUpdate}>
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {editing ? (
                      <ImageUpload
                        currentImage={formData.image}
                        onImageChange={(imageUrl) =>
                          setFormData((prev) => ({ ...prev, image: imageUrl }))
                        }
                        onImageRemove={() =>
                          setFormData((prev) => ({ ...prev, image: "" }))
                        }
                        size="lg"
                      />
                    ) : (
                      <div className="relative">
                        {profile?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={profile.image}
                            alt={profile.name || profile.email}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                            {profile?.name?.charAt(0)?.toUpperCase() ||
                              profile?.email?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </button>
                  )}
                </div>

                {/* Profile Details */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Full Name
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border">
                          {profile?.name || "Not set"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email Address
                      </label>
                      {editing ? (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your email"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border">
                          {profile?.email}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Account Created
                      </label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg border text-sm">
                        {profile?.createdAt
                          ? formatDate(profile.createdAt)
                          : "Unknown"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Last Updated
                      </label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg border text-sm">
                        {profile?.updatedAt
                          ? formatDate(profile.updatedAt)
                          : "Unknown"}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    {editing ? (
                      <>
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {saving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(false);
                            setFormData({
                              name: profile?.name || "",
                              email: profile?.email || "",
                              image: profile?.image || "",
                            });
                          }}
                          className="inline-flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditing(true)}
                          className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPasswordChange(true)}
                          className="inline-flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Change Password
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Departments and Roles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Departments */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                My Departments
              </h3>
            </div>
            <div className="p-6">
              {profile?.departments && profile.departments.length > 0 ? (
                <div className="space-y-2">
                  {profile.departments.map((userDept) => (
                    <div
                      key={userDept.id}
                      className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      {userDept.department.name}
                      {userDept.department.code && (
                        <span className="ml-2 text-blue-600">
                          ({userDept.department.code})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No departments assigned</p>
              )}
            </div>
          </div>

          {/* Roles */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-600" />
                My Roles
              </h3>
            </div>
            <div className="p-6">
              {profile?.roles && profile.roles.length > 0 ? (
                <div className="space-y-2">
                  {profile.roles.map((userRole) => (
                    <div
                      key={userRole.id}
                      className="inline-flex items-center px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {userRole.role.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No roles assigned</p>
              )}
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordChange && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Change Password
                </h3>
              </div>
              <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
