import React from "react";
import "../styles/Innovations.css";

const Innovations = () => {
  return (
    <section className="innovations-container">
      {/* Left side: Image or Video */}
      <div className="innovations-media">
        {/* Replace src with actual video or optimized image */}
        <div className="innovations-media">
            <video
                src="innovation.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="responsive-video"
            />
</div>
      </div>

      {/* Right side: Text content with vertical bars */}
      <div className="innovations-content">
        <h2>
          Making <span className="highlight">innovations</span> <br />
          since <strong>2025</strong>
        </h2>

        <div className="info-block">
          <div className="progress-bar" />
          <div>
            <h4>For Riders</h4>
            <p>
              We continually innovate to deliver industry-first features for our riders—many of which go on to become the standard
            </p>
          </div>
        </div>

        <div className="info-block">
          <div className="progress-bar" />
          <div>
            <h4>For Drivers</h4>
            <p>
              Our drivers receive real-time insights to optimize their rides and maximize earnings—directly through the app.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Innovations;
