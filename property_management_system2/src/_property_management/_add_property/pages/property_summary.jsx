import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const PropertySummary = () => {
  const [propertySummary, setPropertySummary] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const fetchPropertySummary = useCallback(
    async (page = 1) => {
      const propertyId = localStorage.getItem("propertyId");
      const token = localStorage.getItem("token");

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
          `https://pm.api.rentnasi.com/api/v1/manage-property/property-summary/overview?property_id=${propertyId}&page=${page}`,
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
        console.error("Error fetching property summary:", error);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchPropertySummary(currentPage);
  }, [fetchPropertySummary, currentPage]);

  useEffect(() => {
    if (propertySummary) {
      const ctx = document.getElementById('myChart').getContext('2d');

      const data = {
        
        labels: ['Rent', 'Deposit', 'Electricity', 'Water', 'Garbage'],
        datasets: [{
          label: 'Financial Summary',
          data: [
            propertySummary.summary.rent.amount,
            propertySummary.summary.deposit.amount,
            propertySummary.summary.electricity.amount,
            propertySummary.summary.water.amount,
            propertySummary.summary.garbage.amount
          ],
          backgroundColor: [
            `#${propertySummary.summary.rent.color}`,
            `#${propertySummary.summary.deposit.color}`,
            `#${propertySummary.summary.electricity.color}`,
            `#${propertySummary.summary.water.color}`,
            `#${propertySummary.summary.garbage.color}`
          ],
          hoverOffset: 4
        }]
      };

      new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'left',
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const total = tooltipItem.dataset.data.reduce((sum, value) => sum + value, 0);
                  const percentage = ((tooltipItem.raw / total) * 100).toFixed(2);
                  return `${tooltipItem.label}: ${tooltipItem.raw} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  }, [propertySummary]);

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

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= propertySummary.units_available.last_page) {
      fetchPropertySummary(newPage);
    }
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).replace('KES', 'KES ');
  };

  return (
    <section className="mx-auto">
      <div className="p-4 flex justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-700">Property Summary</h1>
          <p className="text-sm text-gray-500">Properties / Add Property / </p>
        </div>
        <div className="">
          <Link className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5 text-center" to="/add-property/manage-images">Add Property Images</Link>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-4 mx-4 h-full">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <h1 className="font-bold text-lg">{propertySummary.summary.property_name}</h1>
            <p className="text-md">{propertySummary.summary.location_type}</p>
            <p className="text-sm my-2 font-semibold">Financial Summary</p>

            <div className="grid grid-cols-2 mt-1 space-y-2">
              <div>
                {["rent", "deposit", "electricity", "water", "garbage"].map((key) => (
                  <ul key={key} className="max-w-md">
                    <li className="pb-3 sm:pb-4">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className="flex-shrink-0">
                          <div className={`h-2 w-2`} style={{ backgroundColor: `#${propertySummary.summary[key].color}` }}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                        </div>
                        <div className="inline-flex items-center text-base font-semibold text-gray-900">
                          <p className="text-sm">{formatCurrency(propertySummary.summary[key].amount)}</p>
                        </div>
                      </div>
                    </li>
                  </ul>
                ))}
                <ul className="max-w-md">
                  <li className="pb-3 sm:pb-4">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 bg-green-800"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Total Finance Amount</p>
                      </div>
                      <div className="inline-flex items-center text-base font-semibold text-gray-900">
                        <p className="text-md font-semibold">{formatCurrency(propertySummary.summary.total_finance_amount.amount)}</p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="h-[400px]">
            <canvas className="" id="myChart"></canvas>
          </div>
        </div>

        <div className="relative overflow-x-auto rounded mt-4 border">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase">
              <tr className="border-b border-gray-200">
                <th scope="col" className="px-6 py-3 bg-gray-50">No</th>
                <th scope="col" className="px-6 py-3">Unit no</th>
                <th scope="col" className="px-6 py-3 bg-gray-50">Unit type</th>
                <th scope="col" className="px-6 py-3">Rent amount</th>
                <th scope="col" className="px-6 py-3 bg-gray-50">Deposit</th>
                <th scope="col" className="px-6 py-3">Water</th>
                <th scope="col" className="px-6 py-3 bg-gray-50">Electricity</th>
                <th scope="col" className="px-6 py-3 bg-gray-50">Garbage</th>
                <th scope="col" className="font-semibold px-6 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {propertySummary.units_available.data.map((unit, index) => (
                <tr key={unit.unit_id}>
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50">{index + 1}</th>
                  <td className="px-6 py-4">{unit.unit_no}</td>
                  <td className="px-6 py-4 bg-gray-50">{unit.unit_type}</td>
                  <td className="px-6 py-4">{formatCurrency(unit.rent_amount)}</td>
                  <td className="px-6 py-4 bg-gray-50">{formatCurrency(unit.rent_deposit)}</td>
                  <td className="px-6 py-4">{formatCurrency(unit.water)}</td>
                  <td className="px-6 py-4 bg-gray-50">{formatCurrency(unit.electricity)}</td>
                  <td className="px-6 py-4 bg-gray-50">{formatCurrency(unit.garbage)}</td>
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{formatCurrency(unit.total)}</th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {propertySummary.units_available.last_page > 1 && (
          <div className="flex justify-between items-center p-4">
            <button
              className={`text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5 text-center ${currentPage === 1 && 'cursor-not-allowed'}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {propertySummary.units_available.last_page}
            </span>
            <button
              className={`text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5 text-center ${currentPage === propertySummary.units_available.last_page && 'cursor-not-allowed'}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === propertySummary.units_available.last_page}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertySummary;
