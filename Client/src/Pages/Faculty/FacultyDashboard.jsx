import React, { useState } from 'react'
import BaseLayout from '../../Components/Layouts/BaseLayout';
import { Plus, Eye, House, Activity, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee: "",
    department: "",
    status: "Pending",
    priority: "Medium",
    dueDate: "",
  });

  const statuses = ["Pending", "In Progress", "Completed"];
  const priorities = ["Low", "Medium", "High", "Urgent"];
  const departments = ["CSE", "IT", "ECE", "EEE", "MECH"];

  // Mock data for recent activities
  const recentActivities = [
    { id: 1, action: 'Task "Database Design" completed', time: '2 hours ago' },
    { id: 2, action: 'New task "API Development" assigned', time: '1 day ago' },
    { id: 3, action: 'Task "UI Mockups" updated', time: '2 days ago' },
    { id: 4, action: 'Task "Code Review" completed', time: '3 days ago' },
  ];

  const openCreateModal = () => {
    setFormData({
      title: "",
      description: "",
      assignee: "",
      department: "",
      status: "Pending",
      priority: "Medium",
      dueDate: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      title: "",
      description: "",
      assignee: "",
      department: "",
      status: "Pending",
      priority: "Medium",
      dueDate: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTask = () => {
    if (
      formData.title &&
      formData.description &&
      formData.assignee &&
      formData.department &&
      formData.dueDate
    ) {
      // TODO: API call to create task
      console.log("Creating task:", formData);
      closeModal();
      // Show success message or refresh data
    } else {
      alert("Please fill all required fields");
    }
  };

  return (
    <BaseLayout>
      <div className="flex gap-1 items-center my-4 w-[90%] md:w-[80%] mx-auto">
        <button
          className="hover:text-blue-500 text-white cursor-pointer"
          onClick={() => navigate("/faculty/dashboard")}
        >
          <House />
        </button>
        <span>{">"}</span>
        <button
          className="hover:text-blue-500 text-white cursor-pointer"
          onClick={() => navigate("/faculty/dashboard")}
        >
          Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div className="w-[90%] md:w-[80%] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-10">
        <div className="py-10 px-4 text-white bg-gradient-to-br from-green-500 to-green-800 rounded-[8px] cursor-pointer hover:scale-105 transition-transform">
          <h2 className="text-2xl font-semibold mb-4">Total Assigned Tasks</h2>
          <p className="text-5xl font-bold">25</p>
        </div>
        <div className="py-10 px-4 text-white bg-gradient-to-br from-blue-500 to-blue-800 rounded-[8px] cursor-pointer hover:scale-105 transition-transform">
          <h2 className="text-2xl font-semibold mb-4">Completed Tasks</h2>
          <p className="text-5xl font-bold">18</p>
        </div>
        <div className="py-10 px-4 text-white bg-gradient-to-br from-orange-500 to-orange-800 rounded-[8px] cursor-pointer hover:scale-105 transition-transform">
          <h2 className="text-2xl font-semibold mb-4">Pending Tasks</h2>
          <p className="text-5xl font-bold">7</p>
        </div>
      </div>

      {/* Action Buttons - Centered in the middle */}
      <div className="w-[90%] md:w-[80%] mx-auto my-8 flex justify-center gap-6">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg flex items-center gap-3 transition-colors font-medium text-lg shadow-lg hover:shadow-xl"
          onClick={openCreateModal}
        >
          <Plus className="w-5 h-5" />
          Create Task
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg flex items-center gap-3 transition-colors font-medium text-lg shadow-lg hover:shadow-xl"
          onClick={() => navigate("/faculty/assign")}
        >
          <Eye className="w-5 h-5" />
          View All
        </button>
      </div>

      {/* Recent Activity Tab */}
      <div className="w-[90%] md:w-[80%] mx-auto my-8">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm border border-indigo-200/40 overflow-hidden">
          {/* Tab Header */}
          <div className="bg-indigo-100/60 px-6 py-4 border-b border-indigo-200/30">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg md:text-xl font-medium text-indigo-800">Recent Activity</h2>
            </div>
          </div>

          {/* Activity Content */}
          <div className="p-6 bg-white/40">
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 px-4 bg-white/70 rounded-lg border border-indigo-100/60 hover:bg-white/90 hover:border-indigo-200/80 hover:shadow-md transition-all duration-300">
                  <span className="text-gray-700 font-normal">{activity.action}</span>
                  <span className="text-sm text-indigo-600 bg-indigo-50/80 px-3 py-1 rounded-lg border border-indigo-200/40">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[90%] md:w-[600px] p-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Create Task</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body - Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black resize-none"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee *
                  </label>
                  <input
                    type="text"
                    name="assignee"
                    value={formData.assignee}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter assignee name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </BaseLayout>
  )
}

export default FacultyDashboard