import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/PriceSettings.css";
import FullScreenLoader from "../components/FullScreenLoader";
import toast from "react-hot-toast";

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

function PriceSettings() {
    const { accessToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        startPrice: "",
        pricePerKm: "",
        initialWaitTime: "",
        waitTimeCost: "",
        cancelFees: "",
        platformFee: "",
        adminCommission: "",
        sedanPricePerKm: "",
        suvPricePerKm: "",
        muvPricePerKm: "",
        coupePricePerKm: "",
        convertiblePricePerKm: "",
    });

    // ✅ Fetch current pricing settings
    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${apiUrl}/api/admin/fetch_pricing`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const data = await res.json();

                if (res.ok && data?.data) {
                    const settings = data.data;
                    setForm({
                        startPrice: settings.start_price?.toString() || "",
                        pricePerKm: settings.price_per_km?.toString() || "",
                        initialWaitTime: settings.initial_wait_time?.toString() || "",
                        waitTimeCost: settings.wait_time_cost?.toString() || "",
                        cancelFees: settings.cancel_fees?.toString() || "",
                        platformFee: settings.platform_fee?.toString() || "",
                        adminCommission: settings.admin_commission?.toString() || "",
                        sedanPricePerKm: settings.sedan_price_per_km?.toString() || "",
                        suvPricePerKm: settings.suv_price_per_km?.toString() || "",
                        muvPricePerKm: settings.muv_price_per_km?.toString() || "",
                        coupePricePerKm: settings.coupe_price_per_km?.toString() || "",
                        convertiblePricePerKm: settings.convertible_price_per_km?.toString() || "",
                    });
                } else {
                    toast.error("Failed to load pricing data");
                }
            } catch (error) {
                console.error("Error:", error);
                toast.error("Something went wrong while fetching");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [accessToken]);

    // ✅ Prevent negative values
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (parseFloat(value) < 0) return;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ✅ Submit updated pricing settings
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            const payload = {
                uuid: user.uuid,
                start_price: parseFloat(form.startPrice),
                price_per_km: parseFloat(form.pricePerKm),
                initial_wait_time: parseFloat(form.initialWaitTime),
                wait_time_cost: parseFloat(form.waitTimeCost),
                cancel_fees: parseFloat(form.cancelFees),
                platform_fee: parseFloat(form.platformFee),
                admin_commission: parseFloat(form.adminCommission),
                sedan_price_per_km: parseFloat(form.sedanPricePerKm),
                suv_price_per_km: parseFloat(form.suvPricePerKm),
                muv_price_per_km: parseFloat(form.muvPricePerKm),
                coupe_price_per_km: parseFloat(form.coupePricePerKm),
                convertible_price_per_km: parseFloat(form.convertiblePricePerKm),
            };

            const res = await fetch(`${apiUrl}/api/admin/add_Update_pricing`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || data?.error) {
                throw new Error(data?.message || "Failed to update pricing settings");
            }

            toast.success("Pricing settings updated!");
        } catch (error) {
            console.error("Save Error:", error);
            toast.error("Error saving settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tax-settings-container">
            {loading && <FullScreenLoader />}
            <h1 className="tax-title">Ride Price Settings</h1>

            <form className="price-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Start / Initial Price ($)</label>
                    <input
                        type="number"
                        name="startPrice"
                        value={form.startPrice}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="form-group">
                    <label>Default price per km ($)</label>
                    <input
                        type="number"
                        name="pricePerKm"
                        value={form.pricePerKm}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                    />
                </div>
                <div className="form-group">
                    <label>Sedan Price per km ($)</label>
                    <input
                        type="number"
                        name="sedanPricePerKm"
                        value={form.sedanPricePerKm}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="form-group">
                    <label>SUV Price per km ($)</label>
                    <input
                        type="number"
                        name="suvPricePerKm"
                        value={form.suvPricePerKm}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="form-group">
                    <label>MUV Price per km ($)</label>
                    <input
                        type="number"
                        name="muvPricePerKm"
                        value={form.muvPricePerKm}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="form-group">
                    <label>Coupe Price per km ($)</label>
                    <input
                        type="number"
                        name="coupePricePerKm"
                        value={form.coupePricePerKm}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="form-group">
                    <label>Convertible Price per km ($)</label>
                    <input
                        type="number"
                        name="convertiblePricePerKm"
                        value={form.convertiblePricePerKm}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                    />
                </div>


                <div className="form-group">
                    <label>Initial Waiting Time (minutes)</label>
                    <input
                        type="number"
                        name="initialWaitTime"
                        value={form.initialWaitTime}
                        onChange={handleChange}
                        min="0"
                    />
                </div>

                <div className="form-group">
                    <label>Waiting Time Cost (per minute) ($)</label>
                    <input
                        type="number"
                        name="waitTimeCost"
                        value={form.waitTimeCost}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="form-group">
                    <label>Cancel Fees ($)</label>
                    <input
                        type="number"
                        name="cancelFees"
                        value={form.cancelFees}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="form-group">
                    <label>Platform Fee ($)</label>
                    <input
                        type="number"
                        name="platformFee"
                        value={form.platformFee}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="form-group">
                    <label>Admin Commission %(percentage per ride) ($)</label>
                    <input
                        type="number"
                        name="adminCommission"
                        value={form.adminCommission}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                    />
                </div>

                <button type="submit" className="save-button">
                    Save Settings
                </button>
            </form>
        </div>
    );
}

export default PriceSettings;
