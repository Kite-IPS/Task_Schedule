import BaseLayout from "../../Components/Layouts/BaseLayout";
import Table from "../../Components/Admin/Table";
import { data } from "../../DevSample/sample";
import { Download, House, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

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
          <p className="font-bold text-green-400 text-[18px] md:text-5xl">150</p>
        </div>
        <div className="h-[100px] md:h-auto flex flex-col justify-center py-4 md:py-10 px-4 md:px-6 text-white bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer hover:scale-105 hover:bg-white/10 transition-all shadow-lg">
          <h2 className="font-semibold mb-1 text-white/80 text-[17px] md:text-xl">Total Completed Tasks</h2>
          <p className="font-bold text-blue-400 text-[18px] md:text-5xl">100</p>
        </div>
        <div className="h-[100px] md:h-auto flex flex-col justify-center py-4 md:py-10 px-4 md:px-6 text-white bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer hover:scale-105 hover:bg-white/10 transition-all shadow-lg col-span-2 md:col-span-1">
          <h2 className="font-semibold mb-1 text-white/80 text-[17px] md:text-xl">Total On-Going Tasks</h2>
          <p className="font-bold text-orange-400 text-[18px] md:text-5xl">50</p>
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
        <Table data={data} />
      </div>
    </BaseLayout>
  );
};

export default AdminDashboard;