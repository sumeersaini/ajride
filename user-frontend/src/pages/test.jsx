import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function TestDeletePage() {
  const [message, setMessage] = useState("");

  const deleteImage = async () => {
    const oldAvatarUrl =
      "https://wodjlquoforyqcqnyqtf.supabase.co/storage/v1/object/public/ridezy/cars/d79d0a7e-fe95-473f-9385-c62517fef1b7-ax2.avif";

    try {
      if (!oldAvatarUrl || !oldAvatarUrl.includes("supabase")) {
        setMessage("Invalid image URL.");
        return;
      }

      const parts = oldAvatarUrl.split("/storage/v1/object/public/ridezy/");
      if (parts.length !== 2) {
        setMessage("Failed to extract path from image URL.");
        return;
      }

      const pathToDelete = parts[1];
      console.log("pathToDelete",pathToDelete)
      const { error } = await supabase.storage.from("ridezy").remove([pathToDelete]);

      if (error) {
        console.warn("Failed to delete image:", error.message);
        setMessage(`Error: ${error.message}`);
      } else {
        console.log("Image deleted successfully");
        setMessage("Image deleted successfully!");
      }
    } catch (err) {
      console.error("Unexpected error during deletion", err);
      setMessage("Unexpected error occurred.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Test Supabase Image Delete</h2>
      <button onClick={deleteImage}>Delete Test Image</button>
      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}
