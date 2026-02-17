import React, { useEffect, useState } from "react";
import axios from "axios";
import { supabase } from "../services/supabaseClient";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export default function ViewCarList() {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchCarList = async (page = 1, perPage = 10, search = "") => {
    setLoading(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        throw new Error("Unable to retrieve user session");
      }

      const uuid = session.user.id;

      const response = await axios.post(
        `${apiUrl}/api/merchant/get_car_list`,
        { uuid, page, recordsPerPage: perPage, search },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.data) {
        setCars(response.data.data.cars);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalRecords(response.data.data.pagination.totalRecords);
        setCurrentPage(response.data.data.pagination.currentPage);
        setRecordsPerPage(response.data.data.pagination.recordsPerPage);
      }
    } catch (error) {
      console.error("Error fetching car list:", error);
      toast.error("Error fetching car list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarList(currentPage, recordsPerPage, searchTerm);
  }, [currentPage, recordsPerPage, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async (carId) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;

    try {
      await axios.post(
        `${apiurl}/api/merchant/delete_car`,
        { car_id: carId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Car deleted successfully!");
      fetchCarList(currentPage, recordsPerPage, searchTerm);
    } catch (error) {
      console.error("Failed to delete car:", error);
      toast.error("Something went wrong while deleting the car.");
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRecordsChange = (e) => {
    setRecordsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  if (loading)
    return (
      <div className="loading-cr">
        <img src="loading-cr.svg" className="loading-cls" alt="Loading" />
      </div>
    );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search by car name, type or engine"
          className="form-control w-50"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearchTerm(searchInput);
            }
          }}
        />

        <select
          className="form-select w-auto"
          value={recordsPerPage}
          onChange={handleRecordsChange}
        >
          <option value={recordsPerPage}>{recordsPerPage} per page</option>
          {/* Optionally add fixed options:
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          */}
        </select>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Car Name</th>
            <th>Type</th>
            <th>Price ($/mile)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cars.length > 0 ? (
            cars.map((car) => (
              <tr key={car.id}>
                <td>{car.car_name}</td>
                <td>{car.car_type}</td>
                <td className="text-price fw-bold">
                  ${car.price_per_mile} (CAD)
                </td>
                <td>
                  <button
                    className="btn btn-sm view-btn me-2"
                    onClick={() => navigate(`/car/${car.id}`)}
                    title="View Details"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    className="btn btn-sm del-btn"
                    onClick={() => handleDelete(car.id)}
                    title="Delete Car"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No cars found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <nav>
        <ul className="pagination justify-content-center flex-wrap list-page-pagination-end">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <li
              key={pageNum}
              className={`page-item ${
                currentPage === pageNum ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="text-center text-muted mt-2">
        Total Records: {totalRecords}
      </div>
    </div>
  );
}
