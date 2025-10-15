import BaseLayout from "../../Components/Layouts/BaseLayout";
import Table from "../../Components/Admin/Table";
import { Download, House, UsersRound, Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../../Utils/axiosInstance";
import { API_PATH } from "../../Utils/apiPath";
import ExcelJS from 'exceljs';
// import { data } from "../../DevSample/sample";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_task: 0,
    completed_task: 0,
    ongoing_task: 0
  });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Export to Excel function
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tasks');

    // Define columns
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

    // Get tasks data - handle both response.data.tasks and response.data formats
    const tasksData = data.tasks || data;

    // Add data rows
    tasksData.forEach((task, index) => {
      worksheet.addRow({
        sno: index + 1,
        title: task.title,
        description: task.description,
        assignee: task.assignee || 'Unassigned',
        department: Array.isArray(task.dept) ? task.dept.join(', ') : task.dept,
        status: task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : '',
        priority: task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : '',
        dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-',
        createdDate: task.created_at ? new Date(task.created_at).toLocaleDateString() : '-',
        completedDate: task.completed_at ? new Date(task.completed_at).toLocaleDateString() : '-'
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Generate and download the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin_tasks_report.xlsx';
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

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axiosInstance.get(API_PATH.TASK.DASHBOARD);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAllTasks = async () => {
      try {
        const response = await axiosInstance.get(API_PATH.TASK.ALL);
        
        // Transform API data to match Table component expectations
        if (response.data.tasks && Array.isArray(response.data.tasks)) {
          const transformedData = response.data.tasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            dept: task.department, // Map department to dept
            status: formatStatus(task.status), // Format status to Title Case
            assignee: formatAssignees(task.assignee), // Extract assignee names
            priority: formatPriority(task.priority), // Format priority to Title Case
            created_at: task.created_at,
            completed_at: task.completed_at || null,
            dueDate: task.due_date // Map due_date to dueDate
          }));
          setData(transformedData);
        } else if (Array.isArray(response.data)) {
        setData(response.data);
        } else {
          console.error('Unexpected data structure:', response.data);
          setData([]);
        }
      } catch (error) {
        console.error('Error Fetching In Getting all tasks:', error);
        setData([]);
      }
    };

    fetchDashboardStats();
    fetchAllTasks();
  }, []);

  // Helper function to format status (pending -> Pending, in_progress -> In Progress)
  const formatStatus = (status) => {
    if (!status) return '';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Helper function to format priority (urgent -> Urgent)
  const formatPriority = (priority) => {
    if (!priority) return '';
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  };

  // Helper function to extract assignee names
  const formatAssignees = (assignees) => {
    if (!assignees) return '';
    if (Array.isArray(assignees)) {
      return assignees.map(a => a.full_name || a.email).join(', ');
    }
    return assignees;
  };

  return (
    <BaseLayout>
      <div className="flex gap-1 items-center my-4 w-[90%] md:w-[80%] mx-auto text-white/70">
        <button
          className="hover:text-red-400 cursor-pointer transition-colors"
          onClick={() => navigate("/admin/dashboard")}
        >
          <House />
        </button>
        <span>{">"}</span>
        <button
          className="hover:text-red-400 cursor-pointer transition-colors"
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </button>
      </div>
      <div className="w-[90%] md:w-[80%] mx-auto grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 my-10">
        <div className="h-[100px] md:h-auto flex flex-col justify-center py-4 md:py-10 px-4 md:px-6 text-white bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer hover:scale-105 hover:bg-white/10 transition-all shadow-lg">
          <h2 className="font-semibold mb-1 text-white/80 text-[17px] md:text-xl">Total Tasks</h2>
          <p className="font-bold text-green-400 text-[18px] md:text-5xl">
            {loading ? '...' : stats.total_task}
          </p>
        </div>
        <div className="h-[100px] md:h-auto flex flex-col justify-center py-4 md:py-10 px-4 md:px-6 text-white bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer hover:scale-105 hover:bg-white/10 transition-all shadow-lg">
          <h2 className="font-semibold mb-1 text-white/80 text-[17px] md:text-xl">Total Completed Tasks</h2>
          <p className="font-bold text-blue-400 text-[18px] md:text-5xl">
            {loading ? '...' : stats.completed_task}
          </p>
        </div>
        <div className="h-[100px] md:h-auto flex flex-col justify-center py-4 md:py-10 px-4 md:px-6 text-white bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer hover:scale-105 hover:bg-white/10 transition-all shadow-lg col-span-2 md:col-span-1">
          <h2 className="font-semibold mb-1 text-white/80 text-[17px] md:text-xl">Total On-Going Tasks</h2>
          <p className="font-bold text-orange-400 text-[18px] md:text-5xl">
            {loading ? '...' : stats.ongoing_task}
          </p>
        </div>
      </div>
      <div className="w-[90%] md:w-[80%] mx-auto my-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-white">Tasks Table:</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-600 hover:border-red-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg hover:scale-105 flex items-center justify-center gap-1 text-xs md:text-sm w-1/2 md:w-auto"
            onClick={() => navigate("/admin/users")}
          >
            View Users <UsersRound className="w-4 h-4" />
          </button>
          <button className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-600 hover:border-red-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg hover:scale-105 flex items-center justify-center gap-1 text-xs md:text-sm w-1/2 md:w-auto"
          onClick={exportToExcel}
          >
            Export Data <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="w-[90%] md:w-[80%] mx-auto my-4">
        <Table data={data} onView={openViewModal} />
      </div>

      {/* View Task Modal */}
      {isViewModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-[90%] md:w-[600px] p-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Task Details</h2>
              <button
                onClick={closeViewModal}
                className="text-white/70 hover:text-white cursor-pointer transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
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
                  <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                    selectedTask.status?.toLowerCase() === 'completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                    selectedTask.status?.toLowerCase() === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                    'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {selectedTask.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90 mb-1">Priority</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                    selectedTask.priority?.toLowerCase() === 'urgent' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
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
                    {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'Not set'}
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
            </div>
          </div>
        </div>
      )}
    </BaseLayout>
  );
};

export default AdminDashboard;