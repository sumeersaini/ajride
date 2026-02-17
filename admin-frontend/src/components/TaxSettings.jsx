import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/TaxSettings.css";
// import "../styles/ConfirmModal.css"; // Only for the confirmation box
import FullScreenLoader from "../components/FullScreenLoader";

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

function TaxSettings() {
    const { accessToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [taxes, setTaxes] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        tax_id: null,
        tax_name: "",
        tax_type: "",
        city: "",
        tax_percentage: "",
    });

    const [showConfirm, setShowConfirm] = useState(false);
    const [taxToDelete, setTaxToDelete] = useState(null);

    const fetchTaxes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/api/admin/list_tax`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({}),
            });
            setLoading(false);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();
            setTaxes(result.data || []);
        } catch (err) {
            console.error("Error fetching taxes:", err);
        }
    };

    useEffect(() => {
        if (accessToken) fetchTaxes();
    }, [accessToken]);

    const handleDelete = async (tax_id) => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/api/admin/delete_tax`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ tax_id }),
            });
            setLoading(false);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            fetchTaxes();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const url = formData.tax_id
            ? `${apiUrl}/api/admin/edit_tax`
            : `${apiUrl}/api/admin/add_tax`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ ...formData }),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            await fetchTaxes();
            setShowForm(false);
            setLoading(false);
            setFormData({
                tax_id: null,
                tax_name: "",
                tax_type: "",
                city: "",
                tax_percentage: "",
            });
        } catch (err) {
            console.error("Submit failed:", err);
        }
    };

    const handleEdit = (tax) => {
        setFormData({
            tax_id: tax.id,
            tax_name: tax.tax_name,
            tax_type: tax.tax_type,
            city: tax.city,
            tax_percentage: tax.tax_percentage,
        });
        setShowForm(true);
    };

    const handleConfirmDelete = () => {
        if (taxToDelete) {
            handleDelete(taxToDelete);
            setTaxToDelete(null);
            setShowConfirm(false);
        }
    };

    return (
        <div className="tax-settings-container">
            {loading && <FullScreenLoader />}
            <h1 className="tax-title">Tax Settings</h1>

            <div className="flex justify-end mb-4">
                <button
                    className="add-button"
                    onClick={() => {
                        setShowForm(!showForm);
                        setFormData({
                            tax_id: null,
                            tax_name: "",
                            tax_type: "",
                            city: "",
                            tax_percentage: "",
                        });
                    }}
                >
                    {showForm ? "Close Form" : "Add New Tax"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="tax-form">
                    <input
                        type="text"
                        placeholder="Tax Name"
                        value={formData.tax_name}
                        onChange={(e) =>
                            setFormData({ ...formData, tax_name: e.target.value })
                        }
                        required
                    />
                    <input
                        type="text"
                        placeholder="Tax Type"
                        value={formData.tax_type}
                        onChange={(e) =>
                            setFormData({ ...formData, tax_type: e.target.value })
                        }
                    />
                    <input
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Tax Percentage"
                        value={formData.tax_percentage}
                        onChange={(e) =>
                            setFormData({ ...formData, tax_percentage: e.target.value })
                        }
                    />
                    <button type="submit" className="submit-button">
                        {formData.tax_id ? "Update Tax" : "Add Tax"}
                    </button>
                </form>
            )}

            <table className="tax-table">
                <thead>
                    <tr>
                        <th>Tax Name</th>
                        <th>Type</th>
                        <th>City</th>
                        <th>Tax %</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {taxes.map((tax) => (
                        <tr key={tax.id}>
                            <td>{tax.tax_name}</td>
                            <td>{tax.tax_type}</td>
                            <td>{tax.city}</td>
                            <td>{tax.tax_percentage}</td>
                            <td>
                                <button className="edit-button" onClick={() => handleEdit(tax)}>
                                    Edit
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={() => {
                                        setTaxToDelete(tax.id);
                                        setShowConfirm(true);
                                    }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {taxes.length === 0 && (
                        <tr>
                            <td colSpan={5} className="no-records">
                                No tax records found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Delete</h2>
                        <p>Are you sure you want to delete this tax?</p>
                        <div className="modal-buttons">
                            <button className="cancel-btn" onClick={() => setShowConfirm(false)}>
                                Cancel
                            </button>
                            <button className="confirm-btn" onClick={handleConfirmDelete}>
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TaxSettings;
