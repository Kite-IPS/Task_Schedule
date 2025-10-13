import BaseLayout from "../../Components/Layouts/BaseLayout";
import Table from "../../Components/Admin/Table";
import { data } from "../../DevSample/sample";
import { Download, House, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <BaseLayout>
      <div className="flex gap-1 items-center my-4 w-[90%] md:w-[80%] mx-auto">
        <button
          className="hover:text-blue-500 cursor-pointer"
          onClick={() => navigate("/admin/dashboard")}
        >
          <House />
        </button>
        <span>{">"}</span>
        <button
          className="hover:text-blue-500 cursor-pointer"
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </button>
      </div>
      <div className="w-[90%] md:w-[80%] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-10">
        <div className="py-10 px-4 text-white bg-gradient-to-br from-green-500 to-green-800 rounded-[8px] cursor-pointer">
          <h2 className="text-2xl font-semibold mb-4">Total Tasks</h2>
          <p className="text-5xl font-bold">150</p>
        </div>
        <div className="py-10 px-4 text-white bg-gradient-to-br from-blue-500 to-blue-800 rounded-[8px] cursor-pointer">
          <h2 className="text-2xl font-semibold mb-4">Total Completed Tasks</h2>
          <p className="text-5xl font-bold">100</p>
        </div>
        <div className="py-10 px-4 text-white bg-gradient-to-br from-orange-500 to-orange-800 rounded-[8px] cursor-pointer">
          <h2 className="text-2xl font-semibold mb-4">Total On-Going Tasks</h2>
          <p className="text-5xl font-bold">50</p>
        </div>
      </div>
      <div className="w-[90%] md:w-[80%] mx-auto my-4 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Tasks Table:</h1>
        <div className="flex items-center gap-2">
          <button
            className="primary-btn flex items-center gap-2"
            onClick={() => navigate("/admin/users")}
          >
            View Users <UsersRound />
          </button>
          <button className="primary-btn flex items-center gap-2">
            Export Data <Download />
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
