import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

const StepImages = ({ next, back, update, data }) => {
  const [files, setFiles] = useState(data.images || []);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    
    if (!files.length) {
      setPreviews([]);
      return;
    }

    const objectUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews(objectUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (files.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }
    update({ images: files });
    toast.success("Images uploaded successfully!");
    next();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="car-pages-steps image-upload">
      <h2 className="text-xl font-bold mb-2">Upload Car Images</h2>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />

      <div
        onClick={openFileDialog}
        style={{
          width: "100%",
          height: 100,
          border: "2px dashed #888",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          fontSize: 14,
          cursor: "pointer",
          userSelect: "none",
          marginBottom: 12,
        }}
        title="Click to upload images"
      >
        Upload Image{files.length !== 1 ? "s" : ""}
      </div>

      {previews.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {previews.map((src, idx) => (
            <div
              key={idx}
              style={{
                width: 100,
                height: 100,
                position: "relative",
                border: "1px solid #ccc",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <img
                src={src}
                alt={`Preview ${idx + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                onClick={() => removeImage(idx)}
                type="button"
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "white",
                  borderRadius: "50%",
                  width: 22,
                  height: 22,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex button-footer">
        <button onClick={back} className="text-white px-4 py-2 rounded back-btn">
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-500 text-white px-4 py-2 rounded nxt-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepImages;
