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


      {/* Stats Cards - 2 cards in first row on mobile, third card below */}
      <div className="w-[90%] md:w-[80%] mx-auto grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 my-10">
        <div className="h-[100px] md:h-auto flex flex-col justify-center py-0 md:py-8 px-4 md:px-10 text-white bg-white/5 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl cursor-pointer hover:scale-105 hover:bg-white/10 transition-all shadow-lg hover:shadow-2xl">
          <h2 className="font-semibold mb-3 text-white/80 text-[17px] md:text-xl">Total Assigned Tasks</h2>
          <p className="font-bold text-green-400 text-[18px] md:text-5xl">25</p>
        </div>
        <div className="h-[100px] md:h-auto flex flex-col justify-center py-0 md:py-8 px-4 md:px-10 text-white bg-white/5 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl cursor-pointer hover:scale-105 hover:bg-white/10 transition-all shadow-lg hover:shadow-2xl">
          <h2 className="font-semibold mb-3 text-white/80 text-[17px] md:text-xl">Completed Tasks</h2>
          <p className="font-bold text-blue-400 text-[18px] md:text-5xl">18</p>
        </div>
        <div className="h-[60px] md:h-auto md:pt-8 flex md:flex-col md:justify-center items-center       md:items-start justify-between md:justify-start px-4 md:px-10 text-white bg-white/5 backdrop-blur-md       border border-white/10 rounded-xl md:rounded-2xl cursor-pointer hover:scale-105 hover:bg-white/10      transition-all shadow-lg hover:shadow-2xl col-span-2 lg:col-span-1">
          <h2 className="font-semibold text-white/80 text-[17px] md:text-xl mb-3">Pending Tasks</h2>
          <p className="font-bold text-orange-400 text-[18px] md:text-5xl">7</p>
        </div>
      </div>


      {/* Action Buttons - Equal width on mobile, centered on desktop */}
      <div className="w-[90%] md:w-[80%] mx-auto my-8">
        <div className="flex flex-row justify-center items-center gap-4 md:gap-6 flex-wrap md:flex-nowrap">
          <button
            className="w-auto bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-600 hover:border-red-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl flex items-center justify-center gap-3 transition-all font-medium text-base md:text-lg shadow-lg hover:shadow-xl hover:scale-105"
            onClick={openCreateModal}
          >
            <Plus className="w-5 h-5" />
            Create Task
          </button>
          <button
            className="w-auto bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-600 hover:border-red-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl flex items-center justify-center gap-3 transition-all font-medium text-base md:text-lg shadow-lg hover:shadow-xl hover:scale-105"
            onClick={() => navigate("/faculty/assign")}
          >
            <Eye className="w-5 h-5" />
            View All
          </button>
        </div>
      </div>


      {/* Recent Activity Tab - Improved width and hover effects */}
      <div className="w-[90%] md:w-[80%] mx-auto my-8 mb-12">
        <div className="bg-white/5 backdrop-blur-md rounded-xl md:rounded-2xl shadow-xl border border-white/10 overflow-hidden">
          {/* Tab Header */}
          <div className="bg-white/10 backdrop-blur-sm px-4 md:px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-red-400" />
              <h2 className="text-base md:text-xl font-semibold text-white">Recent Activity</h2>
            </div>
          </div>


          {/* Activity Content */}
          <div className="p-4 md:p-6">
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 py-3 md:py-4 px-3 md:px-5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <span className="text-sm md:text-base text-white/90 font-normal flex-1">{activity.action}</span>
                  <span className="text-xs md:text-sm text-red-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 font-medium whitespace-nowrap w-fit">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl md:rounded-2xl shadow-2xl w-full md:w-[600px] max-w-2xl p-5 md:p-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/10">
              <h2 className="text-lg md:text-xl font-bold text-white">Create New Task</h2>
              <button
                onClick={closeModal}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1 transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>


            {/* Modal Body - Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border-2 border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-white/40 transition-all duration-200"
                  placeholder="Enter task title"
                />
              </div>


              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border-2 border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-white/40 resize-none transition-all duration-200"
                  placeholder="Enter task description"
                />
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Assignee <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="assignee"
                    value={formData.assignee}
                    onChange={handleInputChange}
                    className="w-full border-2 border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-white/40 transition-all duration-200"
                    placeholder="Enter assignee name"
                  />
                </div>


                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Department <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full border-2 border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white transition-all duration-200"
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
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border-2 border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white transition-all duration-200"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status} className="bg-gray-900">
                        {status}
                      </option>
                    ))}
                  </select>
                </div>


                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full border-2 border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white transition-all duration-200"
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority} className="bg-gray-900">
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>


                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Due Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full border-2 border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white transition-all duration-200"
                  />
                </div>
              </div>
            </div>


            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                onClick={closeModal}
                className="w-full sm:flex-1 px-5 py-2.5 border-2 border-white/20 bg-white/5 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all duration-200 font-semibold text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="w-full sm:flex-1 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </BaseLayout>
  )
}


export default FacultyDashboard
