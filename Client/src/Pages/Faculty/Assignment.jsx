import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2, X, Home, Eye } from "lucide-react";
import BaseLayout from "../../Components/Layouts/BaseLayout";
import { useNavigate } from "react-router-dom";

const Assignment = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Database Design",
      description: "Design the database schema for the new project",
      assignee: "John Doe",
      department: "CSE",
      status: "Completed",
      priority: "High",
      dueDate: "2025-10-15",
    },
    {
      id: 2,
      title: "API Development",
      description: "Develop REST API endpoints",
      assignee: "Jane Smith",
      department: "IT",
      status: "In Progress",
      priority: "Urgent",
      dueDate: "2025-10-20",
    },
    {
      id: 3,
      title: "UI Mockups",
      description: "Create UI mockups for the dashboard",
      assignee: "Bob Johnson",
      department: "ECE",
      status: "Pending",
      priority: "Medium",
      dueDate: "2025-10-18",
    },
  ]);

  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedTask, setSelectedTask] = useState(null);
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

  const navigate = useNavigate();

  useMemo(() => {
    let filtered = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || task.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    setFilteredTasks(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter, tasks]);

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = filteredTasks.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Modal functions
  const openCreateModal = () => {
    setModalMode("create");
    setFormData({
      title: "",
      description: "",
      assignee: "",
      department: "",
      status: "Pending",
      priority: "Medium",
      dueDate: "",
    });
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openViewModal = (task) => {
    setModalMode("view");
    setSelectedTask(task);
    setFormData(task);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setModalMode("edit");
    setSelectedTask(task);
    setFormData(task);
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
    setSelectedTask(null);
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
      const newTask = {
        id: Math.max(...tasks.map((t) => t.id), 0) + 1,
        ...formData,
      };
      setTasks([...tasks, newTask]);
      closeModal();
    } else {
      alert("Please fill all required fields");
    }
  };

  const handleUpdateTask = () => {
    if (
      formData.title &&
      formData.description &&
      formData.assignee &&
      formData.department &&
      formData.dueDate
    ) {
      setTasks(tasks.map((t) => (t.id === selectedTask.id ? formData : t)));
      closeModal();
    } else {
      alert("Please fill all required fields");
    }
  };

  const handleDeleteTask = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 border border-green-300";
      case "In Progress":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-700 border border-red-300";
      case "High":
        return "bg-orange-100 text-orange-700 border border-orange-300";
      case "Medium":
        return "bg-purple-100 text-purple-700 border border-purple-300";
      case "Low":
        return "bg-gray-100 text-gray-700 border border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  return (
    <BaseLayout className="min-h-screen bg-gray-50">
      <div className="w-[90%] md:w-[80%] mx-auto py-6">
        {/* Breadcrumb */}
        <div className="flex gap-1 items-center my-4">
          <button className="text-white hover:text-blue-500 cursor-pointer text-black">
            <Home size={20} />
          </button>
          <span className="text-white-600">{">"}</span>
          <button
            className="text-white hover:text-blue-500 cursor-pointer text-black"
            onClick={() => navigate("/faculty/dashboard")}
          >
            Dashboard
          </button>
          <span className="text-white-600">{">"}</span>
          <button
            className="text-white hover:text-blue-500 cursor-pointer text-black"
            onClick={() => navigate("/faculty/assign")}
          >
            Task Management
          </button>
        </div>

        {/* Header with Create Button */}
        <div className="flex justify-between items-center my-6">
          <h1 className="text-2xl font-bold text-white-800">Task Management</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-md"
          >
            <Plus size={20} />
            Create Task
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by title or assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="All">All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="All">All Priorities</option>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  S.No
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Assignee
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Due Date
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTasks.map((task, index) => (
                <tr
                  key={task.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                    {task.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {task.assignee}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {task.department}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {task.dueDate}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => openViewModal(task)}
                        className="text-green-500 hover:text-green-700 transition"
                        title="View Description"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(task)}
                        className="text-blue-500 hover:text-blue-700 transition"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-500 hover:text-red-700 transition"
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

          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No tasks found. Try adjusting your filters.
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredTasks.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-white-700"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 hover:bg-gray-100 text-gray-700"
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
              className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-white-700"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[90%] md:w-[600px] p-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {modalMode === "create" ? "Create Task" : modalMode === "view" ? "Task Details" : "Edit Task"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            {modalMode === "view" ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Title</h3>
                  <p className="text-gray-800 text-base">{formData.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Description</h3>
                  <p className="text-gray-800 text-base leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {formData.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Assignee</h3>
                    <p className="text-gray-800">{formData.assignee}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Department</h3>
                    <p className="text-gray-800">{formData.department}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Status</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${getStatusColor(formData.status)}`}>
                      {formData.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Priority</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${getPriorityColor(formData.priority)}`}>
                      {formData.priority}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Due Date</h3>
                    <p className="text-gray-800">{formData.dueDate}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                  onClick={
                    modalMode === "create" ? handleCreateTask : handleUpdateTask
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition font-medium"
                >
                  {modalMode === "create" ? "Create" : "Update"}
                </button>
              </div>
              </>
            )}
          </div>
        </div>
      )}
    </BaseLayout>
  );
};

export default Assignment;