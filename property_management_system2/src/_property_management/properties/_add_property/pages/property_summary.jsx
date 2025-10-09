import axios from "axios";
import { useCallback, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import { Button } from "../../../../shared";

Chart.register(...registerables);

const SkeletonLoader = ({ className, rounded = false }) => (
  <div
    className={`bg-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
  ></div>
);

const TableRowSkeleton = () => (
  <tr className="border-b">
    <td className="px-4 py-3"><SkeletonLoader className="w-12 h-12" rounded /></td>
    <td className="px-4 py-3">
      <SkeletonLoader className="h-4 w-32 mb-1" />
      <SkeletonLoader className="h-3 w-24" />
    </td>
    {[...Array(4)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <SkeletonLoader className="h-6 w-12 mx-auto" />
      </td>
    ))}
    <td className="px-4 py-3 flex space-x-4">
      <SkeletonLoader className="h-5 w-5 rounded" />
      <SkeletonLoader className="h-5 w-5 rounded" />
      <SkeletonLoader className="h-5 w-5 rounded" />
    </td>
  </tr>
);

const PropertySummary = () => {
  const [propertySummary, setPropertySummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const propertyId = localStorage.getItem("propertyId");
  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Add ref to store chart instance
  const chartRef = useRef(null);

  const fetchPropertySummary = useCallback(
    async (page = 1) => {
      if (!propertyId) {
        toast.error("Property ID not found in localStorage!");
        navigate("/add-property/general-information");
        return;
      }

      if (!token) {
        toast.error("Authorization token not found in localStorage!");
        window.location.href = "https://auth.rentnasi.com";
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(
          `${baseUrl}/manage-property/property-summary/overview?property_id=${propertyId}&pagination=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.status === 200) {
          setPropertySummary(response.data.result);
          setPagination(response.data.result.units_available);
          setCurrentPage(response.data.result.units_available.current_page);
        } else {
          toast.error("Failed to fetch property summary");
        }
      } catch (error) {
        console.error("Error fetching property summary:", error);
        toast.error("Error fetching property summary!");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, propertyId, token, baseUrl]
  );

  useEffect(() => {
    fetchPropertySummary(1);
  }, [fetchPropertySummary]);

  useEffect(() => {
    if (propertySummary) {
      const ctx = document.getElementById("myChart")?.getContext("2d");

      if (!ctx) return;

      // Destroy existing chart if it exists
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const data = {
        labels: ["Rent", "Deposit", "Electricity", "Water"],
        datasets: [
          {
            label: "Financial Summary",
            data: [
              parseFloat(propertySummary?.summary?.rent?.amount || 0),
              parseFloat(propertySummary?.summary?.deposit?.amount || 0),
              parseFloat(propertySummary?.summary?.electricity?.amount || 0),
              parseFloat(propertySummary?.summary?.water?.amount || 0),
            ],
            backgroundColor: [
              `#${propertySummary?.summary?.rent?.color || "CCCCCC"}`,
              `#${propertySummary?.summary?.deposit?.color || "CCCCCC"}`,
              `#${propertySummary?.summary?.electricity?.color || "CCCCCC"}`,
              `#${propertySummary?.summary?.water?.color || "CCCCCC"}`,
            ],
            hoverOffset: 4,
          },
        ],
      };

      // Create new chart and store reference
      chartRef.current = new Chart(ctx, {
        type: "doughnut",
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "left",
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const total = tooltipItem.dataset.data.reduce((sum, value) => sum + value, 0);
                  const percentage = ((tooltipItem.raw / total) * 100).toFixed(2);
                  return `${tooltipItem.label}: ${tooltipItem.raw} (${percentage}%)`;
                },
              },
            },
          },
          maintainAspectRatio: false,
        },
      });
    }

    // Cleanup function to destroy chart when component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [propertySummary]);

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.last_page) {
      fetchPropertySummary(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchPropertySummary(currentPage - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== currentPage) {
      fetchPropertySummary(pageNumber);
    }
  };

  const generatePageNumbers = () => {
    if (!pagination) return [];

    const { current_page, last_page } = pagination;
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, current_page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(last_page, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (!propertySummary) {
    return (
      <section className="mx-auto">
        <div className="p-4 flex justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-700">Property Summary</h1>
            <p className="text-sm text-gray-500">Properties / Add Property / </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 mx-4 h-full">
          <p className="text-sm mt-2 mb-1 font-semibold">Loading ...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto">
      <div className="p-4 flex justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-700">Property Summary</h1>
          <p className="text-sm text-gray-500">Properties / Add Property / </p>
        </div>
        <div>
          <Button onClick={() => navigate(`/property/view-property/${propertyId}`)}
          >
            View Property
          </Button>
        </div>
      </div>
      <div className=" mx-4 h-full">
        <div className="p-4 shadow bg-white grid grid-cols-1 md:grid-cols-2 gap-4 rounded">
          <div>
            <h1 className="font-bold text-lg">{propertySummary?.summary?.property_name}</h1>
            <p className="text-md">{propertySummary?.summary?.location_type}</p>
            <p className="text-sm my-2 font-semibold">Financial Summary</p>
            <div>
              {["rent", "deposit", "electricity", "water", "garbage"].map((key) => {
                const summaryItem = propertySummary?.summary?.[key];
                return (
                  <ul key={key} className="max-w-md">
                    <li className="pb-3 sm:pb-4">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className="flex-shrink-0">
                          <div
                            className="h-2 w-2"
                            style={{
                              backgroundColor: `#${summaryItem?.color || "CCCCCC"}`,
                            }}
                          ></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </p>
                        </div>
                        <div className="inline-flex items-center text-base font-semibold text-gray-900">
                          <p className="text-sm">{Number(summaryItem?.amount || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </li>
                  </ul>
                );
              })}
            </div>
          </div>
          <div className=" mx-auto">
            <canvas id="myChart"></canvas>
          </div>
        </div>

        {/* Table with loading state */}
        <div className="p-4 shadow bg-white relative overflow-x-auto rounded mt-4 border">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3">Unit No</th>
                <th className="px-6 py-3">Unit Type</th>
                <th className="px-6 py-3">Rent</th>
                <th className="px-6 py-3">Deposit</th>
                <th className="px-6 py-3">Water</th>
                <th className="px-6 py-3">Electricity</th>
                <th className="px-6 py-3">Garbage</th>
                <th className="px-6 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))
              ) : (
                propertySummary.units_available.data.map((unit, index) => (
                  <tr key={unit.id || index}>
                    <td className="px-6 py-4">{unit.unit_no}</td>
                    <td className="px-6 py-4">{unit.unit_type}</td>
                    <td className="px-6 py-4">{Number(unit?.rent_amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">{Number(unit.rent_deposit || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">{Number(unit.water || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">{Number(unit.electricity || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">{Number(unit.garbage || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">{Number(unit.total || 0).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {pagination && pagination.last_page > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 gap-4">
          {/* Pagination Info */}
          <div className="text-sm text-gray-700">
            Showing {pagination.from} to {pagination.to} of {pagination.total} results
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center space-x-2">
            {/* Previous Button */}
            <button
              className={`flex items-center justify-center px-3 h-8 text-sm font-medium rounded-l ${currentPage === 1
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-white bg-red-800 hover:bg-red-900'
                }`}
              onClick={handlePrevPage}
              disabled={currentPage === 1 || isLoading}
            >
              <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
              </svg>
              Previous
            </button>

            {/* Page Numbers */}
            {generatePageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                className={`flex items-center justify-center px-3 h-8 text-sm font-medium ${pageNum === currentPage
                  ? 'text-white bg-red-800'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-100'
                  }`}
                onClick={() => handlePageClick(pageNum)}
                disabled={isLoading}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Button */}
            <button
              className={`flex items-center justify-center px-3 h-8 text-sm font-medium rounded-r ${currentPage === pagination.last_page
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-white bg-red-800 hover:bg-red-900'
                }`}
              onClick={handleNextPage}
              disabled={currentPage === pagination.last_page || isLoading}
            >
              Next
              <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default PropertySummary;