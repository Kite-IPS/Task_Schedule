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
      <div className="flex gap-1 items-center my-4 w-[90%] md:w-[80%] mx-auto text-white/70">
        <button
          className="hover:text-red-400 cursor-pointer transition-colors"
          onClick={() => navigate("/faculty/dashboard")}
        >
          <House />
        </button>
        <span>{">"}</span>
        <button
          className="hover:text-red-400 cursor-pointer transition-colors"
          onClick={() => navigate("/faculty/dashboard")}
        >
          Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div className="w-[90%] md:w-[80%] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-10">
        <div className="py-10 px-6 text-white bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer hover:scale-105 hover:bg-white/10 transition-all shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white/80">Total Assigned Tasks</h2>
          <p className="text-5xl font-bold text-green-400">25</p>
        </div>
        <div className="py-10 px-6 text-white bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer hover:scale-105 hover:bg-white/10 transition-all shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white/80">Completed Tasks</h2>
          <p className="text-5xl font-bold text-blue-400">18</p>
        </div>
        <div className="py-10 px-6 text-white bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer hover:scale-105 hover:bg-white/10 transition-all shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white/80">Pending Tasks</h2>
          <p className="text-5xl font-bold text-orange-400">7</p>
        </div>
      </div>

      {/* Action Buttons - Centered in the middle */}
      <div className="w-[90%] md:w-[80%] mx-auto my-8 flex justify-center gap-6">
        <button
          className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-600 hover:border-red-500 text-white px-8 py-4 rounded-xl flex items-center gap-3 transition-all font-medium text-lg shadow-lg hover:shadow-xl hover:scale-105"
          onClick={openCreateModal}
        >
          <Plus className="w-5 h-5" />
          Create Task
        </button>
        <button
          className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-600 hover:border-red-500 text-white px-8 py-4 rounded-xl flex items-center gap-3 transition-all font-medium text-lg shadow-lg hover:shadow-xl hover:scale-105"
          onClick={() => navigate("/faculty/assign")}
        >
          <Eye className="w-5 h-5" />
          View All
        </button>
      </div>

      {/* Recent Activity Tab */}
      <div className="w-[90%] md:w-[80%] mx-auto my-8">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 overflow-hidden">
          {/* Tab Header */}
          <div className="bg-white/5 px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-red-400" />
              <h2 className="text-lg md:text-xl font-medium text-white">Recent Activity</h2>
            </div>
          </div>

          {/* Activity Content */}
          <div className="p-6">
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 px-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg transition-all duration-300">
                  <span className="text-white/90 font-normal">{activity.action}</span>
                  <span className="text-sm text-red-400 bg-white/5 px-3 py-1 rounded-lg border border-white/10">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-[90%] md:w-[600px] p-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Create Task</h2>
              <button
                onClick={closeModal}
                className="text-white/70 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body - Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-white/40"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-white/40 resize-none"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">
                    Assignee *
                  </label>
                  <input
                    type="text"
                    name="assignee"
                    value={formData.assignee}
                    onChange={handleInputChange}
                    className="w-full border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-white/40"
                    placeholder="Enter assignee name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status} className="bg-gray-900">
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority} className="bg-gray-900">
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                  />
                </div>
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
                onClick={handleCreateTask}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
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