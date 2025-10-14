import React, { useState, useMemo } from "react";
import { Plus, Edit, Eye, Trash2, X, Home } from "lucide-react";
import BaseLayout from "../../Components/Layouts/BaseLayout";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      role: "Admin",
      department: "IT",
      email: "john@example.com",
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "User",
      department: "HR",
      email: "jane@example.com",
    },
    {
      id: 3,
      name: "Bob Johnson",
      role: "Officer staff",
      department: "Sales",
      email: "bob@example.com",
    },
    {
      id: 4,
      name: "Alice Williams",
      role: "User",
      department: "Marketing",
      email: "alice@example.com",
    },
    {
      id: 5,
      name: "Charlie Brown",
      role: "Admin",
      department: "IT",
      email: "charlie@example.com",
    },
    {
      id: 6,
      name: "Diana Prince",
      role: "Officer staff",
      department: "Finance",
      email: "diana@example.com",
    },
  ]);

  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    department: "",
    email: "",
  });

  const roles = ["Admin", "Officer staff", "User"];
  const departments = ["IT", "HR", "Sales", "Marketing", "Finance"];

  const navigate = useNavigate();

  useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesDept =
        departmentFilter === "All" || user.department === departmentFilter;

      return matchesSearch && matchesRole && matchesDept;
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, departmentFilter, users]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Modal functions
  const openCreateModal = () => {
    setModalMode("create");
    setFormData({ name: "", role: "", department: "", email: "" });
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openViewModal = (user) => {
    setModalMode("view");
    setSelectedUser(user);
    setFormData(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", role: "", department: "", email: "" });
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = () => {
    if (
      formData.name &&
      formData.role &&
      formData.department &&
      formData.email
    ) {
      const newUser = {
        id: Math.max(...users.map((u) => u.id), 0) + 1,
        ...formData,
      };
      setUsers([...users, newUser]);
      closeModal();
    } else {
      alert("Please fill all fields");
    }
  };

  const handleUpdateUser = () => {
    if (
      formData.name &&
      formData.role &&
      formData.department &&
      formData.email
    ) {
      setUsers(users.map((u) => (u.id === selectedUser.id ? formData : u)));
      closeModal();
    } else {
      alert("Please fill all fields");
    }
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <BaseLayout>
      <div className="w-[90%] md:w-[80%] mx-auto py-6">
        {/* Breadcrumb */}
        <div className="flex gap-1 items-center my-4 text-white/70">
          <button className="hover:text-red-400 cursor-pointer transition-colors">
            <Home size={20} />
          </button>
          <span>{">"}</span>
          <button className="hover:text-red-400 cursor-pointer transition-colors" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </button>
          <span>{">"}</span>
          <button className="hover:text-red-400 cursor-pointer transition-colors" onClick={() => navigate('/admin/users')}>
            Users
          </button>
        </div>

        {/* Header with Create Button */}
        <div className="flex justify-between items-center my-6">
          <h1 className="text-2xl font-bold text-[17px] text-white">Users Management</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-600 hover:border-red-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg hover:scale-105"
          >
            <Plus size={20} />
            Create User
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-white/40 col-span-1 md:col-span-2"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
            >
              <option value="All" className="bg-gray-900">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role} className="bg-gray-900">
                  {role}
                </option>
              ))}
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
            >
              <option value="All" className="bg-gray-900">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept} className="bg-gray-900">
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  S.No
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Email
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-white/80">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-white font-medium">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/80">
                    {user.role}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/80">
                    {user.department}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/70">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => openViewModal(user)}
                        className="text-green-400 hover:text-green-300 transition p-1 hover:bg-white/5 rounded"
                        title="View"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-400 hover:text-red-300 transition p-1 hover:bg-white/5 rounded"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-white/50">
              No users found. Try adjusting your filters.
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg transition-all ${
                  currentPage === page
                    ? "bg-red-600 text-white border border-red-500"
                    : "border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-[90%] md:w-[500px] p-6">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {modalMode === "create" ? "Create User" : "View/Edit User"}
              </h2>
              <button
                onClick={closeModal}
                className="text-white/70 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-white/40"
                  placeholder="Enter user name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-white/40"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                >
                  <option value="" className="bg-gray-900">Select Role</option>
                  {roles.map((role) => (
                    <option key={role} value={role} className="bg-gray-900">
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                >
                  <option value="" className="bg-gray-900">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept} className="bg-gray-900">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-white/20 bg-white/5 rounded-lg hover:bg-white/10 transition font-medium text-white"
              >
                Cancel
              </button>
              <button
                onClick={
                  modalMode === "create" ? handleCreateUser : handleUpdateUser
                }
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
              >
                {modalMode === "create" ? "Create" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </BaseLayout>
  );
};

export default Users;
