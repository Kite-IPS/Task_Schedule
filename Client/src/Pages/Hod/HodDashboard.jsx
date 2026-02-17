import Table from "../../Components/Admin/Table";
import BaseLayout from '../../Components/Layouts/BaseLayout'
import { Download, House, UsersRound, Eye, X, Users, MessageSquarePlus, ChevronDown } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axiosInstance from "../../Utils/axiosInstance";
import { API_PATH } from "../../Utils/apiPath";
import ExcelJS from 'exceljs';
import { UserContext } from "../../Context/userContext";


const HodDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [tasks, setTasks] = useState([]);
  const [rawTasks, setRawTasks] = useState([]); // Keep raw API data for delegation
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_task: 0,
    completed_task: 0,
    ongoing_task: 0
  });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Delegate Modal State
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [delegateTask, setDelegateTask] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState([]);
  const [delegateLoading, setDelegateLoading] = useState(false);
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);

  // Comments Modal State
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [commentsTask, setCommentsTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // Export to Excel function
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tasks');

    worksheet.columns = [
      { header: 'S.No', key: 'sno', width: 5 },
      { header: 'Title', key: 'title', width: 20 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Assignee(s)', key: 'assignee', width: 25 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'Due Date', key: 'dueDate', width: 12 },
      { header: 'Created Date', key: 'createdDate', width: 12 },
      { header: 'Completed Date', key: 'completedDate', width: 12 }
    ];

    tasks.forEach((task, index) => {
      worksheet.addRow({
        sno: index + 1,
        title: task.title,
        description: task.description,
        assignee: task.assignee,
        department: Array.isArray(task.dept) ? task.dept.join(', ') : task.dept,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : '-',
        createdDate: task.created_at ? new Date(task.created_at).toLocaleDateString() : '-',
        completedDate: task.completed_at ? new Date(task.completed_at).toLocaleDateString() : '-'
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks_report.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // View task modal functions
  const openViewModal = (task) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedTask(null);
  };

  // ============== DELEGATE FUNCTIONS ==============

  const fetchFaculty = async () => {
    try {
      const response = await axiosInstance.get(API_PATH.USER.ALL);
      const allUsers = response.data.users || [];
      // Filter to only faculty in HOD's department
      const deptFaculty = allUsers.filter(u =>
        u.department === user?.department && u.role === 'faculty'
      );
      setFacultyList(deptFaculty);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const openDelegateModal = (task) => {
    // Find the raw task data by ID
    const rawTask = rawTasks.find(t => t.id === task.id);
    setDelegateTask(rawTask || task);

    // Pre-select currently assigned faculty
    if (rawTask?.assignee) {
      const currentEmails = rawTask.assignee
        .map(a => typeof a === 'string' ? a : a.email)
        .filter(Boolean);
      setSelectedFaculty(currentEmails);
    } else {
      setSelectedFaculty([]);
    }

    setIsDelegateModalOpen(true);
    fetchFaculty();
  };

  const closeDelegateModal = () => {
    setIsDelegateModalOpen(false);
    setDelegateTask(null);
    setSelectedFaculty([]);
    setShowFacultyDropdown(false);
  };

  const handleFacultyToggle = (email) => {
    setSelectedFaculty(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleDelegate = async () => {
    if (!delegateTask) return;
    if (selectedFaculty.length === 0) {
      showNotification('Please select at least one faculty member', 'error');
      return;
    }

    setDelegateLoading(true);
    try {
      await axiosInstance.put(API_PATH.TASK.DETAIL(delegateTask.id), {
        assignee: selectedFaculty,
      });
      showNotification('Task delegated successfully!', 'success');
      closeDelegateModal();
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error delegating task:', error);
      const errorMsg = error.response?.data?.error || 'Failed to delegate task';
      showNotification(errorMsg, 'error');
    } finally {
      setDelegateLoading(false);
    }
  };

  // ============== COMMENTS FUNCTIONS ==============

  const fetchTaskComments = async (taskId) => {
    setCommentsLoading(true);
    try {
      const response = await axiosInstance.get(API_PATH.TASK.TASK_COMMENTS(taskId));
      setComments(response.data.follow_comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const openCommentsModal = (task) => {
    const rawTask = rawTasks.find(t => t.id === task.id);
    setCommentsTask(rawTask || task);
    setIsCommentsModalOpen(true);
    fetchTaskComments(task.id);
  };

  const closeCommentsModal = () => {
    setIsCommentsModalOpen(false);
    setCommentsTask(null);
    setComments([]);
    setNewComment('');
  };

  const handleAddComment = async () => {
    if (!commentsTask || !newComment.trim()) return;

    setCommentSubmitting(true);
    try {
      await axiosInstance.put(API_PATH.TASK.DETAIL(commentsTask.id), {
        follow_comment: newComment.trim()
      });
      showNotification('Follow-up comment added!', 'success');
      setNewComment('');
      fetchTaskComments(commentsTask.id); // Refresh comments
    } catch (error) {
      console.error('Error adding comment:', error);
      const errorMsg = error.response?.data?.error || 'Failed to add comment';
      showNotification(errorMsg, 'error');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // ============== FETCH DATA ==============

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATH.TASK.ALL);
      console.log("HOD Dashboard data:", response.data);

      const tasksData = response.data.tasks || [];
      setRawTasks(tasksData); // Store raw data

      const transformedTasks = tasksData.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        assignee: task.assignee && task.assignee.length > 0
          ? task.assignee.map(a => a.full_name || a.email).join(', ')
          : 'Unassigned',
        dept: task.department,
        status: task.status.charAt(0).toUpperCase() + task.status.slice(1),
        priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
        dueDate: task.due_date,
        created_at: task.created_at,
        completed_at: task.completed_at
      }));
      setTasks(transformedTasks);

      const stats = {
        total_task: tasksData.length,
        completed_task: tasksData.filter(t => t.status === 'completed').length,
        ongoing_task: tasksData.filter(t => t.status === 'pending').length
      };
      setStats(stats);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setTasks([]);
      setRawTasks([]);
      setStats({
        total_task: 0,
        completed_task: 0,
        ongoing_task: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <BaseLayout>
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 ${notification.type === 'success'
          ? 'bg-green-500/20 border-green-500/30 text-green-300'
          : 'bg-red-500/20 border-red-500/30 text-red-300'
          }`}>
          {notification.message}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex gap-1 items-center my-4 w-[90%] md:w-[80%] mx-auto text-white/70">
        <button
          className="hover:text-red-400 cursor-pointer transition-colors"
          onClick={() => navigate("/hod/dashboard")}
        >
          <House />
        </button>
        <span>{">"}</span>
        <button
          className="hover:text-red-400 cursor-pointer transition-colors"
          onClick={() => navigate("/hod/dashboard")}
        >
          Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div className="w-[90%] md:w-[80%] mx-auto grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 my-10">
        <div className="h-[100px] md:h-auto flex flex-col justify-center py-0 md:py-10 px-4 md:px-10 text-white bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer hover:scale-105 hover:bg-white/10 transition-all shadow-lg">
          <h2 className="font-semibold mb-3 text-white/80 text-[17px] md:text-xl">Total Tasks</h2>
          <p className="font-bold text-green-400 text-[18px] md:text-5xl">
            {loading ? '...' : stats.total_task}
          </p>
        </div>
        <div className="h-[100px] md:h-auto flex flex-col justify-center py-0 md:py-10 px-4 md:px-10 text-white bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer hover:scale-105 hover:bg-white/10 transition-all shadow-lg">
          <h2 className="font-semibold mb-3 text-white/80 text-[17px] md:text-xl">Total Completed Tasks</h2>
          <p className="font-bold text-blue-400 text-[18px] md:text-5xl">
            {loading ? '...' : stats.completed_task}
          </p>
        </div>
        <div className="h-[60px] md:h-auto md:pt-8 flex md:flex-col items-center md:items-start justify-between md:justify-start px-4 md:px-10 text-white bg-white/5 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl cursor-pointer hover:scale-105 hover:bg-white/10 transition-all shadow-lg hover:shadow-2xl col-span-2 lg:col-span-1">
          <h2 className="font-semibold mb-3 text-white/80 text-[17px] md:text-xl">Total On-Going Tasks</h2>
          <p className="font-bold text-orange-400 text-[18px] md:text-5xl ">
            {loading ? '...' : stats.ongoing_task}
          </p>
        </div>
      </div>

      {/* Tasks Table Header */}
      <div className="w-[90%] md:w-[80%] mx-auto my-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ">
        <h1 className="text-xl md:text-2xl font-bold text-white">Tasks Table:</h1>
        <div className="flex items-center gap-2 w-full md:w-auto flex-row">
          <button
            onClick={exportToExcel}
            className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-600 hover:border-red-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg hover:scale-105 flex items-center justify-center gap-1 text-xs md:text-sm w-auto"
          >
            Export Data <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="w-[90%] md:w-[80%] mx-auto my-4">
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
            <div className="flex items-center space-x-4 text-white/70">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
              <span>Loading tasks...</span>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
            <p className="text-white/70">No tasks found</p>
          </div>
        ) : (
          <>
            <Table data={tasks} onView={openViewModal} />
            {/* Action Buttons Row */}
            <div className="mt-4 space-y-2">
              <p className="text-white/50 text-sm mb-3">Click a task below to Delegate or Add Comments:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tasks.map(task => (
                  <div key={task.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
                    <p className="text-white font-medium text-sm mb-3 truncate">{task.title}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDelegateModal(task)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-all cursor-pointer"
                      >
                        <Users size={14} /> Delegate
                      </button>
                      <button
                        onClick={() => openCommentsModal(task)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-medium hover:bg-purple-500/30 transition-all cursor-pointer"
                      >
                        <MessageSquarePlus size={14} /> Comments
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ============== VIEW TASK MODAL ============== */}
      {isViewModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-[90%] md:w-[600px] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Task Details</h2>
              <button
                onClick={closeViewModal}
                className="text-white/70 hover:text-white cursor-pointer transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white/90 mb-1">Title</h3>
                <p className="text-white text-base">{selectedTask.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90 mb-1">Description</h3>
                <p className="text-white text-base leading-relaxed bg-white/5 p-4 rounded-lg border border-white/10">
                  {selectedTask.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white/90 mb-1">Assignee</h3>
                  <p className="text-white">{selectedTask.assignee}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90 mb-1">Department</h3>
                  <p className="text-white">
                    {Array.isArray(selectedTask.dept) ? selectedTask.dept.join(', ') : selectedTask.dept}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white/90 mb-1">Status</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${selectedTask.status?.toLowerCase() === 'completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                    selectedTask.status?.toLowerCase() === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      selectedTask.status?.toLowerCase() === 'overdue' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                    {selectedTask.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90 mb-1">Priority</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${selectedTask.priority?.toLowerCase() === 'urgent' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    selectedTask.priority?.toLowerCase() === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                      selectedTask.priority?.toLowerCase() === 'medium' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    }`}>
                    {selectedTask.priority}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90 mb-1">Due Date</h3>
                  <p className="text-white">
                    {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Not set'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white/90 mb-1">Created Date</h3>
                  <p className="text-white">
                    {selectedTask.created_at ? new Date(selectedTask.created_at).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90 mb-1">Completed Date</h3>
                  <p className="text-white">
                    {selectedTask.completed_at ? new Date(selectedTask.completed_at).toLocaleDateString() : 'Not completed'}
                  </p>
                </div>
              </div>

              {/* Quick Action Buttons inside View Modal */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => { closeViewModal(); openDelegateModal(selectedTask); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-xl text-sm font-medium hover:bg-blue-500/30 transition-all cursor-pointer"
                >
                  <Users size={16} /> Delegate to Faculty
                </button>
                <button
                  onClick={() => { closeViewModal(); openCommentsModal(selectedTask); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-sm font-medium hover:bg-purple-500/30 transition-all cursor-pointer"
                >
                  <MessageSquarePlus size={16} /> Follow-up Comments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============== DELEGATE MODAL ============== */}
      {isDelegateModalOpen && delegateTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-[90%] md:w-[550px] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-xl font-bold text-white">Delegate Task</h2>
                <p className="text-white/50 text-sm mt-1">Assign faculty from your department</p>
              </div>
              <button
                onClick={closeDelegateModal}
                className="text-white/70 hover:text-white cursor-pointer transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Task Info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
              <h3 className="text-white font-semibold text-base">{delegateTask.title}</h3>
              <p className="text-white/60 text-sm mt-1 line-clamp-2">{delegateTask.description}</p>
              <div className="flex gap-3 mt-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${delegateTask.status?.toLowerCase() === 'completed' ? 'bg-green-500/20 text-green-300' :
                  delegateTask.status?.toLowerCase() === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                  {delegateTask.status || delegateTask.status}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${delegateTask.priority?.toLowerCase() === 'urgent' ? 'bg-red-500/20 text-red-300' :
                  delegateTask.priority?.toLowerCase() === 'high' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-purple-500/20 text-purple-300'
                  }`}>
                  {delegateTask.priority || delegateTask.priority}
                </span>
              </div>
            </div>

            {/* Faculty Picker */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Select Faculty Members ({user?.department})
              </label>

              {/* Dropdown Trigger */}
              <div
                onClick={() => setShowFacultyDropdown(!showFacultyDropdown)}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white cursor-pointer flex items-center justify-between hover:bg-white/10 transition-all"
              >
                <span className="text-sm">
                  {selectedFaculty.length > 0
                    ? `${selectedFaculty.length} faculty selected`
                    : 'Click to select faculty...'}
                </span>
                <ChevronDown size={16} className={`transition-transform ${showFacultyDropdown ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown List */}
              {showFacultyDropdown && (
                <div className="mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl max-h-[200px] overflow-y-auto">
                  {facultyList.length === 0 ? (
                    <p className="text-white/50 text-sm p-4 text-center">No faculty found in your department</p>
                  ) : (
                    facultyList.map(faculty => (
                      <label
                        key={faculty.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-all border-b border-white/5 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFaculty.includes(faculty.email)}
                          onChange={() => handleFacultyToggle(faculty.email)}
                          className="w-4 h-4 accent-blue-500"
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{faculty.name}</p>
                          <p className="text-white/50 text-xs">{faculty.email}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              )}

              {/* Selected Faculty Tags */}
              {selectedFaculty.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedFaculty.map(email => {
                    const faculty = facultyList.find(f => f.email === email);
                    return (
                      <span key={email} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg text-xs">
                        {faculty?.name || email}
                        <button
                          onClick={() => handleFacultyToggle(email)}
                          className="hover:text-white transition cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeDelegateModal}
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelegate}
                disabled={delegateLoading || selectedFaculty.length === 0}
                className="flex-1 px-4 py-2.5 bg-blue-600 border border-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {delegateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Delegating...
                  </>
                ) : (
                  <>
                    <Users size={16} /> Delegate Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============== COMMENTS MODAL ============== */}
      {isCommentsModalOpen && commentsTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-[90%] md:w-[600px] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-xl font-bold text-white">Follow-up Comments</h2>
                <p className="text-white/50 text-sm mt-1 truncate max-w-[400px]">
                  {commentsTask.title}
                </p>
              </div>
              <button
                onClick={closeCommentsModal}
                className="text-white/70 hover:text-white cursor-pointer transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Add Comment Section */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-white/90 mb-2">Add a Follow-up Comment</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type your follow-up comment here..."
                rows={3}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 resize-none transition-all"
              />
              <button
                onClick={handleAddComment}
                disabled={commentSubmitting || !newComment.trim()}
                className="mt-2 w-full px-4 py-2.5 bg-purple-600 border border-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {commentSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <MessageSquarePlus size={16} /> Add Comment
                  </>
                )}
              </button>
            </div>

            {/* Comments List */}
            <div>
              <h3 className="text-sm font-semibold text-white/80 mb-3">
                Previous Comments ({comments.length})
              </h3>

              {commentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  <span className="ml-3 text-white/50 text-sm">Loading comments...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquarePlus size={32} className="mx-auto text-white/20 mb-2" />
                  <p className="text-white/40 text-sm">No follow-up comments yet</p>
                  <p className="text-white/30 text-xs mt-1">Be the first to add one!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {comments.map((comment, index) => (
                    <div key={comment.id || index} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-white text-sm leading-relaxed">{comment.comment}</p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                        <span className="text-white/40 text-xs">
                          By: {comment.performed_by}
                        </span>
                        <span className="text-white/40 text-xs">
                          {new Date(comment.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </BaseLayout>
  )
}

export default HodDashboard