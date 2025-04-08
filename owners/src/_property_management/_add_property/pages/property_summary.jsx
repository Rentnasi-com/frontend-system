import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import { Button } from "../../../shared";

Chart.register(...registerables);

const PropertySummary = () => {
  const [propertySummary, setPropertySummary] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const propertyId = localStorage.getItem("propertyId");
  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_BASE_URL;

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

      try {
        const response = await axios.get(
          `${baseUrl}/manage-property/property-summary/overview?property_id=${propertyId}&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.status === 200) {
          setPropertySummary(response.data.result);
          setCurrentPage(page);
        } else {
          toast.error("Failed to fetch property summary");
        }
      } catch (error) {
        toast.error("Error fetching property summary!");
      }
    },
    [navigate, propertyId, token, baseUrl]
  );

  useEffect(() => {
    fetchPropertySummary(currentPage);
  }, [fetchPropertySummary, currentPage]);

  useEffect(() => {
    if (propertySummary) {
      const ctx = document.getElementById("myChart").getContext("2d");

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

      new Chart(ctx, {
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
  }, [propertySummary]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= propertySummary.units_available.last_page) {
      fetchPropertySummary(newPage);
    }
  };

  const formatCurrency = (value) =>
    value
      ? value.toLocaleString("en-US", {
          style: "currency",
          currency: "KES",
          minimumFractionDigits: 0,
        }).replace("KES", "KES ")
      : "KES 0";

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
      <div className="bg-white rounded-xl shadow p-4 mx-4 h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h1 className="font-bold text-lg">{propertySummary?.summary?.property_name}</h1>
            <p className="text-md">{propertySummary?.summary?.location_type}</p>
            <p className="text-sm my-2 font-semibold">Financial Summary</p>
            <div>
              {["rent", "deposit", "electricity", "water"].map((key) => {
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
                          <p className="text-sm">{formatCurrency(summaryItem?.amount)}</p>
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
        <div className="relative overflow-x-auto rounded mt-4 border">
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
              {propertySummary.units_available.data.map((unit, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">{unit.unit_no}</td>
                  <td className="px-6 py-4">{unit.unit_type}</td>
                  <td className="px-6 py-4">{formatCurrency(unit.rent_amount)}</td>
                  <td className="px-6 py-4">{formatCurrency(unit.rent_deposit)}</td>
                  <td className="px-6 py-4">{formatCurrency(unit.water)}</td>
                  <td className="px-6 py-4">{formatCurrency(unit.electricity)}</td>
                  <td className="px-6 py-4">{formatCurrency(unit.garbage)}</td>
                  <td className="px-6 py-4">{formatCurrency(unit.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default PropertySummary;
