import { Link } from "react-router-dom";
import { SlCalender } from "react-icons/sl";
import { PiExportThin } from "react-icons/pi";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { PropertyCard, TransactionItem } from "./pages/page_components";

const PropertyDashboard = () => {
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get("https://pm.api.rentnasi.com/api/v1/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (response.data.success) {
          setPropertyData(response.data.result);
        } else {
          toast.error("Failed to fetch data");
        }
      } catch (error) {
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <section className="p-4">
          <div className="flex justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-700">Overview</h1>
              <p className="text-sm text-gray-500">Real-time information and activities of your property.</p>
            </div>
          </div>
          <h2 className="text-sm text-gray-500">Loading ...</h2>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="">
        <div className="p-4 flex justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-700">Overview</h1>
            <p className="text-sm text-gray-500">Real-time information and activities of your property.</p>
          </div>
          <div className="">
            <div className="flex space-x-4">
              <div className="bg-white p-2 rounded-xl shadow">
                <Link to="/add-property/general-information">
                  <p className="text-xs text-gray-600 flex space-x-2 text-center">
                    <span>Add Property</span> <PiExportThin />
                  </p>
                </Link>
              </div>
              <div className="bg-white p-2 rounded-xl shadow">
                <p className="text-xs text-gray-600 flex space-x-2 text-center">
                  <SlCalender /> <span>March 27 2024 - January 25 2025</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        {propertyData ? (
          <div className="w-full grid grid-cols-4 gap-4 py-1 px-4">
            {Object.entries(propertyData).map(([key, value]) => (
              <PropertyCard
                key={key}
                title={key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                total={value.count}
                iconUrl={value.icon_url}
                percentChange={value.percentage_change}
                redirectUrl={value.redirect_url}
              />
            ))}
          </div>
        ) : (
          <div>No property data available</div>
        )}
      </section>
      <section className="grid grid-cols-5 gap-4 my-2 mx-4">
        <div className="col-span-3">
          <div className="bg-white p-2 shadow rounded-xl"></div>
        </div>
        <div className="col-span-2 bg-white p-2 shadow rounded-xl space-y-3">
          <h2 className="text-sm font-semibold">Transactions</h2>
          <TransactionItem
            description="Rent Deposit (James Kanyiri W) - King Serenity - Unit: MK240"
            date="Jul 21 2024 - 15:13 PM"
            status="Completed"
            transactionId="ADEFHNJT43GGF"
          />
        </div>
      </section>
    </>
  );
};

export default PropertyDashboard;
