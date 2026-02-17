import React from "react";

const tags = [
  "🔥 Popular choice",
  "🏁 High-performance drive",
  "❄️ A/C & leather seats",
  "✅ Free cancellation before 5 Jul",
];

const Tags = () => {
  return (
    <div className="badges">
      {tags.map((tag, i) => (
        <span key={i} className="badge">{tag}</span>
      ))}
    </div>
  );
};

export default Tags;
