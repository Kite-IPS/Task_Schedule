import Table from "../../Components/Admin/Table";
import BaseLayout from '../../Components/Layouts/BaseLayout'
import { Download, House, UsersRound, Eye, X } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../../Utils/axiosInstance";
import { API_PATH } from "../../Utils/apiPath";
import ExcelJS from 'exceljs';


const HodDashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_task: 0,
    completed_task: 0,
    ongoing_task: 0
  });

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

    // Add data rows
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(API_PATH.TASK.ALL);
        console.log("HOD Dashboard data:", response.data);
        
        // Set tasks for table
        const transformedTasks = (response.data.tasks || []).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          assignee: task.assignee && task.assignee.length > 0 
            ? task.assignee.map(a => a.full_name || a.email).join(', ') // Join all assignees
            : 'Unassigned',
          dept: task.department,
          status: task.status.charAt(0).toUpperCase() + task.status.slice(1), // Capitalize status
          priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1), // Capitalize priority
          dueDate: task.due_date,
          created_at: task.created_at,
          completed_at: task.completed_at // Add completed date
        }));
        setTasks(transformedTasks);

        // Calculate stats from the tasks
        const tasksData = response.data.tasks || [];
        const stats = {
          total_task: tasksData.length,
          completed_task: tasksData.filter(t => t.status === 'completed').length,
          ongoing_task: tasksData.filter(t => t.status === 'pending').length
        };
        setStats(stats);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setTasks([]);
        setStats({
          total_task: 0,
          completed_task: 0,
          ongoing_task: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
      <BaseLayout>
        <div className="flex gap-1 items-center my-4 w-[90%] md:w-[80%] mx-auto text-white/70">
          <button
            className="hover:text-red-400 cursor-pointer transition-colors"
            onClick={() => navigate("/admin-panel/dashboard")}
          >
            <House />
          </button>
          <span>{">"}</span>
          <button
            className="hover:text-red-400 cursor-pointer transition-colors"
            onClick={() => navigate("/admin-panel/dashboard")}
          >
            Dashboard
          </button>
        </div>
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
            <Table data={tasks} onView={openViewModal} />
          )}
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
              </div>
            </div>
          </div>
        )}
    </BaseLayout>
  )
}

export default HodDashboard