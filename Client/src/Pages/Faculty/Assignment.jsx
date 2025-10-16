import React, { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Trash2, X, Home, Eye } from "lucide-react";
import BaseLayout from "../../Components/Layouts/BaseLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../Utils/axiosInstance";
import { API_PATH } from "../../Utils/apiPath";

const Assignment = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedTask, setSelectedTask] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee: [],
    status: "pending",
    priority: "medium",
    dueDate: "",
  });

  const statuses = [
    { code: "pending", name: "Pending" },
    { code: "completed", name: "Completed" },
    { code: "overdue", name: "Overdue" }
  ];
  const priorities = [
    { code: "low", name: "Low" },
    { code: "medium", name: "Medium" },
    { code: "high", name: "High" },
    { code: "urgent", name: "Urgent" }
  ];

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const response = await axiosInstance.get(API_PATH.USER.ALL);
        setUsers(response.data.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };

    const fetchTasks = async () => {
      setTasksLoading(true);
      try {
        const response = await axiosInstance.get(API_PATH.TASK.ALL);
        // Transform API data to match UI expectations
        const transformedTasks = (response.data.tasks || []).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          assignee: task.assignee && task.assignee.length > 0 
            ? task.assignee.map(a => a.full_name || a.email).join(', ')
            : 'Unassigned',
          department: Array.isArray(task.department) ? task.department.join(', ').toUpperCase() : (task.department || '').toUpperCase(),
          status: task.status.charAt(0).toUpperCase() + task.status.slice(1),
          priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
          dueDate: task.due_date,
          completedAt: task.completed_at,
          rawAssignee: task.assignee || [], // Keep raw data for editing
          rawDepartment: task.department || [],
          rawStatus: task.status,
          rawPriority: task.priority,
        }));
        setTasks(transformedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchUsers();
    fetchTasks();
  }, []);

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
      assignee: [],
      status: "pending",
      priority: "medium",
      dueDate: "",
    });
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openViewModal = (task) => {
    setModalMode("view");
    setSelectedTask(task);
    setFormData({
      ...task,
      assignee: task.rawAssignee || [],
      status: task.rawStatus || task.status.toLowerCase(),
      priority: task.rawPriority || task.priority.toLowerCase(),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setModalMode("edit");
    setSelectedTask(task);
    // Format date to yyyy-MM-ddTHH:mm for datetime-local input
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    // Format date for human-readable display
    const formatDateForDisplay = (dateString) => {
      if (!dateString) return 'No due date';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    setFormData({
      title: task.title,
      description: task.description,
      assignee: task.rawAssignee ? task.rawAssignee.map(a => a.email) : [],
      status: task.rawStatus || task.status.toLowerCase(),
      priority: task.rawPriority || task.priority.toLowerCase(),
      dueDate: formatDateForInput(task.dueDate),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      title: "",
      description: "",
      assignee: [],
      status: "pending",
      priority: "medium",
      dueDate: "",
    });
    setSelectedTask(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssigneeToggle = (email) => {
    setFormData(prev => {
      const isSelected = prev.assignee.includes(email);
      const newAssignees = isSelected
        ? prev.assignee.filter(e => e !== email)
        : [...prev.assignee, email];
      return { ...prev, assignee: newAssignees };
    });
  };

  const getSelectedDepartments = () => {
    if (!formData.assignee || formData.assignee.length === 0) return '';
    const departments = formData.assignee.map(email => {
      const user = users.find(u => u.email === email);
      return user?.department?.toUpperCase();
    }).filter(Boolean);
    return [...new Set(departments)].join(', ');
  };

  const handleCreateTask = async () => {
    if (
      formData.title &&
      formData.description &&
      formData.assignee &&
      formData.assignee.length > 0 &&
      formData.dueDate
    ) {
      setCreateLoading(true);
      try {
        // Get departments for selected assignees
        const selectedDepartments = formData.assignee.map(email => {
          const user = users.find(u => u.email === email);
          return user?.department;
        }).filter(Boolean);

        if (selectedDepartments.length === 0) {
          alert("Selected users don't have departments assigned. Please select different users.");
          setCreateLoading(false);
          return;
        }

        const taskData = {
          title: formData.title,
          description: formData.description,
          assignee: formData.assignee, // Array of emails
          department: [...new Set(selectedDepartments)], // Unique departments
          priority: formData.priority || 'medium',
          status: formData.status || 'pending',
          due_date: formData.dueDate
        };

        const response = await axiosInstance.post(API_PATH.TASK.CREATE, taskData);
        
        console.log("Task created successfully:", response.data);
        
        // Fetch updated tasks list
        const tasksResponse = await axiosInstance.get(API_PATH.TASK.ALL);
        const transformedTasks = (tasksResponse.data.tasks || []).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          assignee: task.assignee && task.assignee.length > 0 
            ? task.assignee.map(a => a.full_name || a.email).join(', ')
            : 'Unassigned',
          department: Array.isArray(task.department) ? task.department.join(', ').toUpperCase() : (task.department || '').toUpperCase(),
          status: task.status.charAt(0).toUpperCase() + task.status.slice(1),
          priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
          dueDate: task.due_date,
          rawAssignee: task.assignee || [],
          rawDepartment: task.department || [],
          rawStatus: task.status,
          rawPriority: task.priority,
        }));
        setTasks(transformedTasks);
        closeModal();
        
        alert("Task created successfully!");
        
      } catch (error) {
        console.error("Error creating task:", error);
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message || 
                           error.response?.data?.error ||
                           error.message ||
                           "Unknown error occurred";
        alert("Error creating task: " + errorMessage);
      } finally {
        setCreateLoading(false);
      }
    } else {
      alert("Please fill all required fields including at least one assignee");
    }
  };

  const handleUpdateTask = async () => {
    if (
      formData.title &&
      formData.description &&
      formData.assignee &&
      formData.assignee.length > 0 &&
      formData.dueDate
    ) {
      setCreateLoading(true);
      try {
        // Get departments for selected assignees
        const selectedDepartments = formData.assignee.map(email => {
          const user = users.find(u => u.email === email);
          return user?.department;
        }).filter(Boolean);

        if (selectedDepartments.length === 0) {
          alert("Selected users don't have departments assigned.");
          setCreateLoading(false);
          return;
        }

        const taskData = {
          title: formData.title,
          description: formData.description,
          assignee: formData.assignee,
          department: [...new Set(selectedDepartments)],
          priority: formData.priority,
          status: formData.status,
          due_date: formData.dueDate
        };

        await axiosInstance.put(API_PATH.TASK.DETAIL(selectedTask.id), taskData);
        
        // Fetch updated tasks list
        const tasksResponse = await axiosInstance.get(API_PATH.TASK.ALL);
        const transformedTasks = (tasksResponse.data.tasks || []).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          assignee: task.assignee && task.assignee.length > 0 
            ? task.assignee.map(a => a.full_name || a.email).join(', ')
            : 'Unassigned',
          department: Array.isArray(task.department) ? task.department.join(', ').toUpperCase() : (task.department || '').toUpperCase(),
          status: task.status.charAt(0).toUpperCase() + task.status.slice(1),
          priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
          dueDate: task.due_date,
          rawAssignee: task.assignee || [],
          rawDepartment: task.department || [],
          rawStatus: task.status,
          rawPriority: task.priority,
        }));
        setTasks(transformedTasks);
        closeModal();
        
        alert("Task updated successfully!");
        
      } catch (error) {
        console.error("Error updating task:", error);
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message || 
                           "Failed to update task";
        alert("Error: " + errorMessage);
      } finally {
        setCreateLoading(false);
      }
    } else {
      alert("Please fill all required fields");
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axiosInstance.delete(API_PATH.TASK.DETAIL(id));
        setTasks(tasks.filter((t) => t.id !== id));
        alert("Task deleted successfully!");
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task: " + (error.response?.data?.detail || error.message));
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/20 text-green-300 border border-green-500/30";
      case "In Progress":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
      case "Pending":
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-500/30";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-500/20 text-red-300 border border-red-500/30";
      case "High":
        return "bg-orange-500/20 text-orange-300 border border-orange-500/30";
      case "Medium":
        return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
      case "Low":
        return "bg-gray-500/20 text-gray-300 border border-gray-500/30";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
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
          <button
            className="hover:text-red-400 cursor-pointer transition-colors"
            onClick={() => navigate("/faculty/dashboard")}
          >
            Dashboard
          </button>
          <span>{">"}</span>
          <button
            className="hover:text-red-400 cursor-pointer transition-colors"
            onClick={() => navigate("/faculty/assign")}
          >
            Task Management
          </button>
        </div>

        {/* Header with Create Button */}
        <div className="flex justify-between items-center my-6">
          {/* Mobile: text-[18px] -> Tailwind text-[18px] or text-base; keep md:text-2xl for larger screens */}
          <h1 className="text-[18px] md:text-2xl font-bold text-white">Task Management</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-600 hover:border-red-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-xl transition-all shadow-lg hover:scale-105 text-sm md:text-base"
          >
            {/* Make icon slightly smaller on mobile */}
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Create Task</span>
            <span className="inline sm:hidden">Create</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by title or assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-white/40"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
            >
              <option value="All" className="bg-gray-900">All Status</option>
              {statuses.map((status) => (
                <option key={status.code} value={status.name} className="bg-gray-900">
                  {status.name}
                </option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
            >
              <option value="All" className="bg-gray-900">All Priorities</option>
              {priorities.map((priority) => (
                <option key={priority.code} value={priority.name} className="bg-gray-900">
                  {priority.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  S.No
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Assignee
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Completed Time
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTasks.map((task, index) => (
                <tr
                  key={task.id}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-white/80">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-white font-medium">
                    {task.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/80">
                    {task.assignee}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/80">
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
                  <td className="px-4 py-3 text-sm text-white/80">
                    {(() => {
                      const formatDateForDisplay = (dateString) => {
                        if (!dateString) return 'No due date';
                        const date = new Date(dateString);
                        return date.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      };
                      return formatDateForDisplay(task.dueDate);
                    })()}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/80">
                    {task.status === 'Completed' && task.completedAt ? (() => {
                      const formatDateForDisplay = (dateString) => {
                        if (!dateString) return '-';
                        const date = new Date(dateString);
                        return date.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      };
                      return formatDateForDisplay(task.completedAt);
                    })() : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => openViewModal(task)}
                        className="text-green-400 hover:text-green-300 transition p-1 hover:bg-white/5 rounded"
                        title="View Description"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(task)}
                        className="text-blue-400 hover:text-blue-300 transition p-1 hover:bg-white/5 rounded"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
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

          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-white/50">
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
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-[90%] md:w-[600px] p-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {modalMode === "create" ? "Create Task" : modalMode === "view" ? "Task Details" : "Edit Task"}
              </h2>
              <button
                onClick={closeModal}
                className="text-white/70 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            {modalMode === "view" ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white/90 mb-1">Title</h3>
                  <p className="text-white text-base">{formData.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90 mb-1">Description</h3>
                  <p className="text-white text-base leading-relaxed bg-white/5 p-4 rounded-lg border border-white/10">
                    {formData.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white/90 mb-1">Assignee(s)</h3>
                    <p className="text-white">
                      {Array.isArray(formData.assignee) && formData.assignee.length > 0
                        ? formData.assignee.map(a => a.full_name || a.email || a).join(', ')
                        : selectedTask?.assignee || 'Unassigned'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white/90 mb-1">Department(s)</h3>
                    <p className="text-white">
                      {selectedTask?.department || 'Not assigned'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white/90 mb-1">Status</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${getStatusColor(formData.status)}`}>
                      {formData.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white/90 mb-1">Priority</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${getPriorityColor(formData.priority)}`}>
                      {formData.priority}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white/90 mb-1">Due Date</h3>
                    <p className="text-white">
                      {(() => {
                        const formatDateForDisplay = (dateString) => {
                          if (!dateString) return 'No due date';
                          const date = new Date(dateString);
                          return date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        };
                        return formatDateForDisplay(formData.dueDate);
                      })()}
                    </p>
                  </div>
                  {formData.status === 'Completed' && selectedTask?.completedAt && (
                    <div>
                      <h3 className="text-sm font-semibold text-white/90 mb-1">Completed Time</h3>
                      <p className="text-white">
                        {(() => {
                          const formatDateForDisplay = (dateString) => {
                            if (!dateString) return 'Not completed';
                            const date = new Date(dateString);
                            return date.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          };
                          return formatDateForDisplay(selectedTask.completedAt);
                        })()}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-white/10 border border-white/20 hover:bg-red-600 text-white rounded-lg transition font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                  className="w-full border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-white/40"
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
                  className="w-full border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-white/40 resize-none"
                  placeholder="Enter task description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">
                  Assignee(s) * {formData.assignee.length > 0 && `(${formData.assignee.length} selected)`}
                </label>
                <div className="border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg p-3 max-h-60 overflow-y-auto">
                  {usersLoading ? (
                    <p className="text-white/60 text-sm">Loading users...</p>
                  ) : users.length === 0 ? (
                    <p className="text-white/60 text-sm">No users available</p>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <label
                          key={user.id}
                          className="flex items-start gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.assignee.includes(user.email)}
                            onChange={() => handleAssigneeToggle(user.email)}
                            className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-0"
                          />
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{user.name || user.email}</div>
                            <div className="text-white/60 text-xs">
                              {user.email} • {user.role} {user.department && `• ${user.department.toUpperCase()}`}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formData.assignee.length > 0 && (
                  <div className="mt-2 text-xs text-white/80 bg-white/5 p-2 rounded border border-white/10">
                    <span className="font-semibold">Auto-selected Departments:</span> {getSelectedDepartments() || 'None'}
                  </div>
                )}
                <p className="text-xs text-white/60 mt-1">
                  Select one or more assignees. Departments will be automatically set based on selected assignees.
                </p>
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
                    className="w-full border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                  >
                    {statuses.map((status) => (
                      <option key={status.code} value={status.code} className="bg-gray-900">
                        {status.name}
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
                    className="w-full border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                  >
                    {priorities.map((priority) => (
                      <option key={priority.code} value={priority.code} className="bg-gray-900">
                        {priority.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
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
                  onClick={
                    modalMode === "create" ? handleCreateTask : handleUpdateTask
                  }
                  disabled={modalMode === "create" ? createLoading : false}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition font-medium ${
                    modalMode === "create" && createLoading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {modalMode === "create" ? (createLoading ? "Creating..." : "Create") : "Update"}
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