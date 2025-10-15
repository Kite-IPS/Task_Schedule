import BaseLayout from "../../Components/Layouts/BaseLayout";
import Table from "../../Components/Admin/Table";
import { Download, House, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../../Utils/axiosInstance";
import { API_PATH } from "../../Utils/apiPath";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_task: 0,
    completed_task: 0,
    ongoing_task: 0
  });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

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
          <button className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-600 hover:border-red-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg hover:scale-105 flex items-center justify-center gap-1 text-xs md:text-sm w-1/2 md:w-auto">
            Export Data <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="w-[90%] md:w-[80%] mx-auto my-4">
        <div className="mb-2 text-white/50 text-sm">
          Total tasks loaded: {data.length}
        </div>
        <Table data={data} />
      </div>
    </BaseLayout>
  );
};

export default AdminDashboard;