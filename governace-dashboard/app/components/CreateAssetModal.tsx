"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Dropdown from "./Dropdown";

interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface DepartmentStructure {
  id: number;
  name: string;
  createdAt: string;
  code: string;
  _count: {
    userdepartment: 1;
    governanceitem: 0;
    risk: 0;
  };
}

interface UserStructure {
  id: number;
  name: string;
  email: string;
  image: null;
  createdAt: string;
  updatedAt: string;
  _count: {
    governanceitem: number;
    actionitem: number;
    assignment: number;
  };
  departments: [];
  roles: [];
}

export default function CreateAssetModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAssetModalProps) {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentStructure[]>([]);
  const [users, setUsers] = useState<UserStructure[]>([]);
  const [formData, setFormData] = useState({
    assetTag: "",
    name: "",
    category: "COMPUTER",
    type: "",
    brand: "",
    model: "",
    serialNumber: "",
    status: "AVAILABLE",
    condition: "GOOD",
    location: "",
    departmentId: "",
    assignedTo: "", // Free text for person name
    assignedToId: "", // Optional user ID if they select from dropdown
    purchaseDate: "",
    purchaseCost: "",
    warrantyExpiry: "",
    supplier: "",
    description: "",
    notes: "",
  });

  const STATUS_OPTIONS: { label: string; value: string }[] = [
    { value: "AVAILABLE", label: "Available" },
    { value: "IN_USE", label: "In Use" },
    { value: "MAINTENANCE", label: "Maintenance" },
    { value: "RETIRED", label: "Retired" },
    { value: "LOST", label: "Lost" },
    { value: "DAMAGED", label: "Damaged" },
  ];

  const CATEGORY_OPTIONS: { label: string; value: string }[] = [
    { value: "COMPUTER", label: "Computer" },
    { value: "LAPTOP", label: "Laptop" },
    { value: "MONITOR", label: "Monitor" },
    { value: "PRINTER", label: "Printer" },
    { value: "SCANNER", label: "Scanner" },
    { value: "NETWORKING", label: "Networking (Turbonet)" },
    { value: "PERIPHERAL", label: "Peripheral (Headset)" },
    { value: "ACCESSORY", label: "Accessory" },
    { value: "MOBILE_DEVICE", label: "Mobile Device" },
    { value: "SERVER", label: "Server" },
    { value: "STORAGE", label: "Storage" },
    { value: "SOFTWARE_LICENSE", label: "Software License" },
    { value: "CONSUMABLE", label: "Consumable (Toner)" },
    { value: "OTHER", label: "Other" },
  ];

  const CONDITION_OPTIONS: { label: string; value: string }[] = [
    { value: "EXCELLENT", label: "Excellent" },
    { value: "GOOD", label: "Good" },
    { value: "FAIR", label: "Fair" },
    { value: "POOR", label: "Poor" },
    { value: "NEEDS_REPAIR", label: "Needs Repair" },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      fetchUsers();
      // Generate asset tag
      generateAssetTag();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const generateAssetTag = () => {
    const prefix = "AST";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    setFormData((prev) => ({
      ...prev,
      assetTag: `${prefix}-${timestamp}-${random}`,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        departmentId: formData.departmentId || null,
        assignedToId: formData.assignedToId || null,
        assignedToName: formData.assignedTo || null, // Include free text name
        purchaseDate: formData.purchaseDate || null,
        purchaseCost: formData.purchaseCost
          ? parseFloat(formData.purchaseCost)
          : null,
        warrantyExpiry: formData.warrantyExpiry || null,
      };

      const res = await fetch("/api/asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create asset");
      }

      alert("Asset created successfully!");
      onSuccess();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating asset:", error);
        alert(error.message || "Failed to create asset");
      } else {
        console.error("Unknown error:", error);
        alert("An unexpected error occured.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg z-50">
          <h2 className="text-2xl font-bold">Add New Asset</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Tag <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.assetTag}
                  onChange={(e) =>
                    setFormData({ ...formData, assetTag: e.target.value })
                  }
                  className="w-full px-4 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Dell Latitude 7420"
                  className="w-full px-4 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  onChange={(e) => setFormData({ ...formData, category: e })}
                  value={formData.category}
                  options={CATEGORY_OPTIONS.map((cat) => ({
                    label: cat.label,
                    value: cat.value,
                  }))}
                  borderShade="blue"
                  className="h-10.5"
                />
                {/* <select
                //   required
                //   value={formData.category}
                //   onChange={(e) =>
                //     setFormData({ ...formData, category: e.target.value })
                //   }
                //   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                // >
                //   <option value="COMPUTER">Computer</option>
                //   <option value="LAPTOP">Laptop</option>
                //   <option value="MONITOR">Monitor</option>
                //   <option value="PRINTER">Printer</option>
                //   <option value="SCANNER">Scanner</option>
                //   <option value="NETWORKING">Networking (Turbonet)</option>
                //   <option value="PERIPHERAL">Peripheral (Headset)</option>
                //   <option value="ACCESSORY">Accessory</option>
                //   <option value="MOBILE_DEVICE">Mobile Device</option>
                //   <option value="SERVER">Server</option>
                //   <option value="STORAGE">Storage</option>
                //   <option value="SOFTWARE_LICENSE">Software License</option>
                //   <option value="CONSUMABLE">Consumable (Toner)</option>
                //   <option value="OTHER">Other</option>
                // </select> */}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  placeholder="e.g., Desktop PC, Laser Printer"
                  className="w-full px-4 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  placeholder="e.g., Dell, HP, Cisco"
                  className="w-full px-4 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  placeholder="e.g., Latitude 7420, LaserJet Pro"
                  className="w-full px-4 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, serialNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Status & Condition */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Status & Condition
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Dropdown
                  onChange={(e) => setFormData({ ...formData, status: e })}
                  value={formData.status}
                  options={STATUS_OPTIONS.map((status) => ({
                    label: status.label,
                    value: status.value,
                  }))}
                  borderShade="blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <Dropdown
                  onChange={(e) => setFormData({ ...formData, condition: e })}
                  value={formData.condition}
                  options={CONDITION_OPTIONS.map((status) => ({
                    label: status.label,
                    value: status.value,
                  }))}
                  borderShade="blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Floor 3, Room 301"
                  className="w-full px-3 py-1.5 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <Dropdown
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e })
                  }
                  value={formData.departmentId}
                  options={departments.map((dept) => ({
                    label: `${dept.code} ${dept.name}`,
                    value: dept.id,
                  }))}
                  borderShade="blue"
                  dropdownCategory="department"
                  placeholder="Select department"
                />
                {/* <select
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select> */}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To (System User)
                </label>
                <Dropdown
                  onChange={(e) => {
                    const userId = e;
                    const user = users.find((u) => u.id === parseInt(userId));
                    setFormData({
                      ...formData,
                      assignedToId: userId,
                      assignedTo: user ? user.name : formData.assignedTo,
                    });
                  }}
                  value={formData.assignedToId}
                  options={users.map((dept) => ({
                    label: `${dept.name} - (${dept.email})`,
                    value: dept.id,
                  }))}
                  borderShade="blue"
                  dropdownCategory="user"
                  placeholder="Select user"
                  isOptional={true}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To (Free Text)
                </label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedTo: e.target.value })
                  }
                  placeholder="Enter person's name if not in system (e.g., John Doe - IT Department)"
                  className="w-full px-4 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use this field if the person doesn&apos;t have a system
                  account
                </p>
              </div>
            </div>
          </div>

          {/* Purchase Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Purchase Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) =>
                    setFormData({ ...formData, purchaseDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchaseCost}
                  onChange={(e) =>
                    setFormData({ ...formData, purchaseCost: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Expiry
                </label>
                <input
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e) =>
                    setFormData({ ...formData, warrantyExpiry: e.target.value })
                  }
                  className="w-full px-4 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                  placeholder="e.g., Dell Direct, Amazon"
                  className="w-full px-4 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Additional Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Asset description and specifications..."
                  className="w-full px-4 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={2}
                  placeholder="Additional notes..."
                  className="w-full px-4 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
