// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import toast from "react-hot-toast";
import { FiCamera } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import FullScreenLoader from "../components/FullScreenLoader";
import "../styles/Profile.css";
import countriesData from "../utils/countries.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext"; // ✅ Import AuthContext
import { updateProfile } from "../api/profile";
// const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export default function Profile() {
  const { user, setUser, accessToken, loading } = useAuth(); // ✅ Use AuthContext

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    address: "",
    apartment_number: "",
    postal_code: "",
    phone: "",
  });

  const [submit, setSubmit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [deviceType, setDeviceType] = useState("desktop");
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [fullPhoneNumber, setFullPhoneNumber] = useState("");

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setDeviceType(isMobile ? "mobile" : "desktop");
  }, []);

  useEffect(() => {
    if (!user) return;

    const metadata = user.user_metadata || {};
    setForm({
      first_name: metadata.first_name || "",
      last_name: metadata.last_name || "",
      address: metadata.address || "",
      apartment_number: metadata.apartment_number || "",
      postal_code: metadata.postal_code || "",
      phone: user.phone || "",
    });
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSubmit(true);

    const { error } = await supabase.auth.updateUser({ data: { ...form } });

    if (error) {
      toast.error("Failed to update profile");
      setSubmit(false);
      return;
    }

    try {
      // await axios.post(
      //   `${apiUrl}/api/merchant/update_profile`,
      //   {
      //     ...form,
      //     avatar_url: user.user_metadata?.avatar_url || null,
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${accessToken}`,
      //     },
      //   }
      // );
       await updateProfile(
        {
          ...form,
          avatar_url: user.user_metadata?.avatar_url || null,
        },
        accessToken
      );
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Profile saved, but backend update failed");
    } finally {
      setSubmit(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const uploadAvatar = async (event) => {
    setUploading(true);
    setSubmit(true);
    const file = event.target.files[0];
    if (!file) {
      toast.error("No file selected");
      setUploading(false);
      return;
    }

    const oldAvatarUrl = user.user_metadata?.avatar_url;
    if (oldAvatarUrl && oldAvatarUrl.includes("supabase")) {
      const parts = oldAvatarUrl.split("/");
      const bucketIndex = parts.findIndex((p) => p === "ajride");
      const pathToDelete = parts.slice(bucketIndex + 1).join("/");
      await supabase.storage.from("ajride").remove([pathToDelete]);
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${uuidv4()}.${fileExt}`;
    const filePath = `profile/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("ajride")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed");
      setUploading(false);
      setSubmit(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("ajride")
      .getPublicUrl(filePath);

    const avatarUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        ...form,
        avatar_url: avatarUrl,
      },
    });

    if (updateError) {
      toast.error("Failed to update avatar");
    } else {
      setUser((prev) => ({
        ...prev,
        user_metadata: { ...prev.user_metadata, avatar_url: avatarUrl },
      }));

      try {
        await updateProfile(
          {
            ...form,
            avatar_url: avatarUrl,
          },
          accessToken
        );
        toast.success("Avatar updated!");
      } catch (err) {
        toast.error("Avatar saved, but backend update failed");
      }
    }

    setUploading(false);
    setSubmit(false);
  };

  const handleAddPhone = async () => {
    const fullPhone = countryCode + phone;

    if (!phone) {
      toast.error("Please enter a phone number.");
      return;
    }

    setCheckingPhone(true);

    try {
      setFullPhoneNumber("");

      const { error } = await supabase.auth.updateUser({ phone: fullPhone });

      if (error) {
        toast.error("Phone number already in use or invalid.");
        return;
      }

      setFullPhoneNumber(fullPhone);
      setUser((prev) => ({ ...prev, phone: fullPhone }));
      setForm((prev) => ({ ...prev, phone: fullPhone }));
      setPhone("");
      setShowPhoneInput(false);
      setShowOtpModal(true);
    } catch (err) {
      toast.error("Failed to update phone.");
    } finally {
      setCheckingPhone(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!fullPhoneNumber) {
      toast.error("No phone number to verify.");
      return;
    }

    setVerifyingOtp(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhoneNumber,
        token: otp,
        type: "phone_change",
      });

      if (error) {
        toast.error("Invalid OTP. Please try again.");
        return;
      }

      // await axios.post(
      //   `${apiUrl}/api/merchant/update_profile`,
      //   {
      //     ...form,
      //     phone: fullPhoneNumber,
      //     avatar_url: user.user_metadata?.avatar_url || null,
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${accessToken}`,
      //     },
      //   }
      // );

      await updateProfile(
        {
          ...form,
          phone: fullPhoneNumber,
          avatar_url: user.user_metadata?.avatar_url || null,
        },
        accessToken
      );

      toast.success("Phone number verified!");
      setUser((prev) => ({ ...prev, phone: fullPhoneNumber }));
      setForm((prev) => ({ ...prev, phone: fullPhoneNumber }));
      setPhone("");
      setOtp("");
      setShowOtpModal(false);
    } catch (err) {
      toast.error("Failed to verify OTP.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading || !user) return <FullScreenLoader />;

  return (
    <div className="profile-page">
      <div className="profile-container">
        {submit && <FullScreenLoader />}
        <h2 className="profile-title">My Profile</h2>

        <div className="profile-card">
          <div className="avatar-wrapper">
            <img
              src={
                user.user_metadata?.avatar_url ||
                `https://ui-avatars.com/api/?name=${form.first_name || user.email}&background=007BFF&color=fff`
              }
              alt="Profile"
              className="profile-avatar"
            />
            <label htmlFor="upload-avatar" className="upload-icon" title="Upload new avatar">
              <FiCamera size={18} />
            </label>
            <input
              type="file"
              id="upload-avatar"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
              style={{ display: "none" }}
            />
          </div>

          <div className="profile-info">
            <p><strong>Email:</strong> {user.email}</p>
            <p>
              <strong>Phone:</strong> {form.phone || "N/A"}
              {!form.phone && (
                <button
                  type="button"
                  className="btn btn-link p-0 ms-2 plus-icon"
                  onClick={() => setShowPhoneInput(true)}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              )}
            </p>

            {showPhoneInput && (
              <div className="add-phone-section my-3">
                <h5>Add Phone Number</h5>
                <div className="d-flex gap-2 mb-2">
                  <select
                    className="form-select"
                    style={{ maxWidth: "120px" }}
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    {countriesData.map((country, idx) => (
                      <option key={idx} value={country.dial_code}>
                        {country.code} {deviceType !== "mobile" ? `(${country.dial_code})` : ""}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary cancel-ph"
                    onClick={() => setShowPhoneInput(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary add-ph"
                    onClick={handleAddPhone}
                    disabled={checkingPhone}
                  >
                    {checkingPhone ? "Adding..." : "Add Phone"}
                  </button>
                </div>
              </div>
            )}

            {showOtpModal && (
              <div className="verify-otp-section my-3">
                <h5>Verify OTP</h5>
                <p>Enter the OTP sent to {fullPhoneNumber}</p>
                <input
                  type="text"
                  className="form-control my-2"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <div className="d-flex gap-2">
                  <button className="btn btn-secondary" onClick={() => setShowOtpModal(false)}>Cancel</button>
                  <button className="btn btn-primary add-ph" onClick={handleVerifyOtp} disabled={verifyingOtp}>
                    {verifyingOtp ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              </div>
            )}

            <label>First Name:
              <input type="text" name="first_name" value={form.first_name} onChange={handleChange} />
            </label>

            <label>Last Name:
              <input type="text" name="last_name" value={form.last_name} onChange={handleChange} />
            </label>

            <label>Address:
              <input type="text" name="address" value={form.address} onChange={handleChange} />
            </label>

            <label>Apartment Number:
              <input type="text" name="apartment_number" value={form.apartment_number} onChange={handleChange} />
            </label>

            <label>Postal Code:
              <input type="text" name="postal_code" value={form.postal_code} onChange={handleChange} />
            </label>

            <div className="profile-buttons mt-3">
              <button className="save-btn btn btn-success me-2" onClick={handleSave} disabled={uploading}>
                {uploading ? "Uploading..." : "Save"}
              </button>
              <button className="logout-btn btn btn-outline-danger" onClick={handleLogout}>Log Out</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
