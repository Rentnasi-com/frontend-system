import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Header, Pagination, PropertyTable } from "./propertyListing";

const PropertyListing = () => {
  const [properties, setProperties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_BASE_URL || "https://pm.api.rentnasi.com/api/v1";

  useEffect(() => {
    fetchProperties();
  }, [currentPage, token]);

  const fetchProperties = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/manage-property/view-properties/saved?page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (response.data.success) {
        setProperties(response.data.result.data);
        setCurrentPage(response.data.result.current_page);
        setTotalPages(response.data.result.last_page);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load properties. Please try again.");
    }
  };

  const formatCurrency = (value) => {
    return value
      .toLocaleString("en-US", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 0,
      })
      .replace("KES", "KES ");
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewProperty = (propertyId) => {
    navigate(`/property/view-property?property_id=${propertyId}`);
  };

  return (
    <section>
      <Header />
      {error && <p className="text-red-500 text-center">{error}</p>}
      <PropertyTable
        properties={properties}
        formatCurrency={formatCurrency}
        handleViewProperty={handleViewProperty}
        currentPage={currentPage}
      />
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      )}
    </section>
  );
};



export default PropertyListing;
