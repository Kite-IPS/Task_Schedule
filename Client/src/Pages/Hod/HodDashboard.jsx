import Table from "../../Components/Admin/Table";
import { data } from "../../DevSample/sample";
import BaseLayout from '../../Components/Layouts/BaseLayout'
import { Download, House, UsersRound } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../../Utils/axiosInstance";
import { API_PATH } from "../../Utils/apiPath";


const HodDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_task: 0,
    completed_task: 0,
    ongoing_task: 0
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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
            ? (task.assignee[0].full_name) 
            : 'Unassigned',
          dept: task.department,
          status: task.status.charAt(0).toUpperCase() + task.status.slice(1), // Capitalize status
          priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1), // Capitalize priority
          dueDate: task.due_date,
          created_at: task.created_at,
          created_by: task.created_by ? (task.created_by.full_name) : 'Unknown' // Convert created_by to string
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
          <div className="h-[60px] md:h-auto md:pt-8 flex md:flex-col md:justify-center items-center md:items-start justify-between md:justify-start px-4 md:px-10 text-white bg-white/5 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl cursor-pointer hover:scale-105 hover:bg-white/10 transition-all shadow-lg hover:shadow-2xl col-span-2 lg:col-span-1">
            <h2 className="font-semibold mb-3 text-white/80 text-[17px] md:text-xl">Total On-Going Tasks</h2>
            <p className="font-bold text-orange-400 text-[18px] md:text-5xl ">
              {loading ? '...' : stats.ongoing_task}
            </p>
          </div>
        </div>
        <div className="w-[90%] md:w-[80%] mx-auto my-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ">
          <h1 className="text-xl md:text-2xl font-bold text-white">Tasks Table:</h1>
          <div className="flex items-center gap-2 w-full md:w-auto flex-row">
            <button className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-600 hover:border-red-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg hover:scale-105 flex items-center justify-center gap-1 text-xs md:text-sm w-auto">
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
            <Table data={tasks} />
          )}
        </div>
    </BaseLayout>
  )
}

export default HodDashboard