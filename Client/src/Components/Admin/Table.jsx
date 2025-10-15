import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Filter, X } from "lucide-react";

const Table = ({ data = [] }) => {
  // Safety check: ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  const [filters, setFilters] = useState({
    dept: "",
    status: "",
    priority: "",
    assignee: "",
    createdDate: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});
  const itemsPerPage = 5;

  // Helper function to get department as string
  const getDeptString = (dept) => {
    if (Array.isArray(dept)) return dept.join(', ');
    return dept || '';
  };

  // Get unique values for filter options
  const uniqueDepts = [...new Set(safeData.map((item) => getDeptString(item.dept)))].filter(Boolean);
  const uniqueStatuses = [...new Set(safeData.map((item) => item.status))].filter(Boolean);
  const uniquePriorities = [...new Set(safeData.map((item) => item.priority))].filter(Boolean);
  const uniqueAssignees = [...new Set(safeData.map((item) => item.assignee))].filter(Boolean);
  const uniqueCreatedDates = [...new Set(safeData.map((item) => {
    if (!item.created_at) return null;
    const date = new Date(item.created_at);
    return `${date.getDate()}-${date.toLocaleString("en-US", { month: "long" })}-${date.getFullYear()}`;
  }).filter(Boolean))].sort((a, b) => new Date(b) - new Date(a));

  const toggleReadMore = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getDisplayedText = (description, id) => {
    if (!description) return "";
    const words = description.split(" ");
    const isExpanded = expandedRows[id];
    return isExpanded
      ? description
      : words.slice(0, 7).join(" ") + (words.length > 7 ? "..." : "");
  };

  // Filter data
  const filteredData = useMemo(() => {
    return safeData.filter((item) => {
      const itemCreatedDate = item.created_at ? (() => {
        const date = new Date(item.created_at);
        return `${date.getDate()}-${date.toLocaleString("en-US", { month: "long" })}-${date.getFullYear()}`;
      })() : null;
      
      const itemDept = getDeptString(item.dept);
      
      return (
        (filters.dept === "" || itemDept === filters.dept) &&
        (filters.status === "" || item.status === filters.status) &&
        (filters.priority === "" || item.priority === filters.priority) &&
        (filters.assignee === "" || item.assignee === filters.assignee) &&
        (filters.createdDate === "" || itemCreatedDate === filters.createdDate)
      );
    });
  }, [safeData, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    let sorted = [...filteredData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle dept specially since it might be an array
        if (sortConfig.key === 'dept') {
          aValue = getDeptString(aValue);
          bValue = getDeptString(bValue);
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      dept: "",
      status: "",
      priority: "",
      assignee: "",
      createdDate: "",
    });
    setCurrentPage(1);
  };

  const isFiltered = Object.values(filters).some((val) => val !== "");

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
        return "bg-gray-500/20 text-gray-300 border border-gray-500/30";
    }
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey)
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full">
      <div className="mx-auto">
        {/* Filter Section */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-600 hover:border-red-500 text-white rounded-xl transition-all shadow-lg hover:scale-105 font-medium"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-all shadow-lg hover:scale-105 font-medium"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="mb-6 p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">
              Filter Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Department
                </label>
                <select
                  value={filters.dept}
                  onChange={(e) => handleFilterChange("dept", e.target.value)}
                  className="w-full px-4 py-2.5 border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-white transition"
                >
                  <option value="" className="bg-gray-900">All Departments</option>
                  {uniqueDepts.map((dept) => (
                    <option key={dept} value={dept} className="bg-gray-900">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-4 py-2.5 border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-white transition"
                >
                  <option value="" className="bg-gray-900">All Status</option>
                  {uniqueStatuses.map((status) => (
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
                  value={filters.priority}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-white transition"
                >
                  <option value="" className="bg-gray-900">All Priorities</option>
                  {uniquePriorities.map((priority) => (
                    <option key={priority} value={priority} className="bg-gray-900">
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Assignee
                </label>
                <select
                  value={filters.assignee}
                  onChange={(e) =>
                    handleFilterChange("assignee", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-white transition"
                >
                  <option value="" className="bg-gray-900">All Assignees</option>
                  {uniqueAssignees.map((assignee) => (
                    <option key={assignee} value={assignee} className="bg-gray-900">
                      {assignee}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Created Date
                </label>
                <select
                  value={filters.createdDate}
                  onChange={(e) =>
                    handleFilterChange("createdDate", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-white transition"
                >
                  <option value="" className="bg-gray-900">All Dates</option>
                  {uniqueCreatedDates.map((date) => (
                    <option key={date} value={date} className="bg-gray-900">
                      {date}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-sm font-bold text-white cursor-pointer hover:bg-white/10 transition"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center gap-2">
                      S.No <SortIcon columnKey="id" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-bold text-white cursor-pointer hover:bg-white/10 transition"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-2">
                      Task <SortIcon columnKey="title" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-bold text-white cursor-pointer hover:bg-white/10 transition"
                    onClick={() => handleSort("description")}
                  >
                    <div className="flex items-center gap-2">
                      Description <SortIcon columnKey="description" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-bold text-white cursor-pointer hover:bg-white/10 transition"
                    onClick={() => handleSort("dept")}
                  >
                    <div className="flex items-center gap-2">
                      Department <SortIcon columnKey="dept" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-bold text-white cursor-pointer hover:bg-white/10 transition"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status <SortIcon columnKey="status" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-bold text-white cursor-pointer hover:bg-white/10 transition"
                    onClick={() => handleSort("assignee")}
                  >
                    <div className="flex items-center gap-2">
                      Assignee <SortIcon columnKey="assignee" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-bold text-white cursor-pointer hover:bg-white/10 transition"
                    onClick={() => handleSort("priority")}
                  >
                    <div className="flex items-center gap-2">
                      Priority <SortIcon columnKey="priority" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-bold text-white cursor-pointer hover:bg-white/10 transition"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center gap-2">
                      Created Date <SortIcon columnKey="created_at" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-bold text-white cursor-pointer hover:bg-white/10 transition"
                    onClick={() => handleSort("completed_at")}
                  >
                    <div className="flex items-center gap-2">
                      Completed Date <SortIcon columnKey="completed_at" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-bold text-white cursor-pointer hover:bg-red-800 transition"
                    onClick={() => handleSort("updated_at")}
                  >
                    <div className="flex items-center gap-2">
                      Due Date <SortIcon columnKey="updated_at" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-white/80">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-semibold">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70">
                        {getDisplayedText(item.description, item.id)}
                        {item.description &&
                          item.description.split(" ").length > 10 && (
                            <button
                              onClick={() => toggleReadMore(item.id)}
                              className="ml-2 text-red-400 hover:text-red-300 font-semibold"
                            >
                              {expandedRows[item.id]
                                ? "Read Less"
                                : "Read More"}
                            </button>
                          )}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/80 font-medium">
                        {getDeptString(item.dept)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/80 font-medium">
                        {item.assignee}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${getPriorityColor(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70 font-medium">
                        {item.created_at ? (() => {
                          const date = new Date(item.created_at);

                          const day = date.getDate();
                          const month = date.toLocaleString("en-US", {
                            month: "long",
                          });
                          const year = date.getFullYear();

                          let hours = date.getHours();
                          let minutes = date.getMinutes();
                          const ampm = hours >= 12 ? "P.M" : "A.M";
                          hours = hours % 12 || 12;
                          minutes = minutes.toString().padStart(2, "0");

                          return `${day}-${month}-${year} (${hours}:${minutes} ${ampm})`;
                        })() : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70 font-medium">
                        {item.completed_at ? (() => {
                          const date = new Date(item.completed_at);

                          const day = date.getDate();
                          const month = date.toLocaleString("en-US", {
                            month: "long",
                          });
                          const year = date.getFullYear();

                          let hours = date.getHours();
                          let minutes = date.getMinutes();
                          const ampm = hours >= 12 ? "P.M" : "A.M";
                          hours = hours % 12 || 12;
                          minutes = minutes.toString().padStart(2, "0");

                          return `${day}-${month}-${year} (${hours}:${minutes} ${ampm})`;
                        })() : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70 font-medium">
                        {item.updated_at ? (() => {
                          const date = new Date(item.updated_at);

                          const day = date.getDate();
                          const month = date.toLocaleString("en-US", {
                            month: "long",
                          });
                          const year = date.getFullYear();

                          let hours = date.getHours();
                          let minutes = date.getMinutes();
                          const ampm = hours >= 12 ? "P.M" : "A.M";
                          hours = hours % 12 || 12;
                          minutes = minutes.toString().padStart(2, "0");

                          return `${day}-${month}-${year} (${hours}:${minutes} ${ampm})`;
                        })() : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <X className="w-12 h-12 text-white/40 mb-3" />
                        <p className="text-white/70 font-medium text-lg">
                          No tasks found matching the selected filters.
                        </p>
                        <p className="text-white/50 text-sm mt-1">
                          Try adjusting your filter criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Summary and Pagination */}
        <div className="mt-6 items-center flex justify-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
            {/* Pagination Controls */}
            {sortedData.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition text-sm font-semibold text-white"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition text-sm font-semibold ${
                          currentPage === page
                            ? "bg-red-600 text-white border border-red-500 shadow-lg"
                            : "bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10 text-white"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition text-sm font-semibold text-white"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;