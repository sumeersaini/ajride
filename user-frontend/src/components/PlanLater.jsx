import React from 'react';
import "../styles/PlanLater.css";

import { FaCalendarAlt, FaClock, FaRegClock, FaRegCalendarAlt, FaTimes } from 'react-icons/fa';

const PlanLater = () => {
  return (
    <section className="plan-later-section">
        <div className="heading-plan"><h2>Plan for later</h2></div>
        <div className="plan-later">
            <div className="plan-left">
            {/* <h2>Plan for later</h2> */}
            <div className="plan-card">
            <h3>Get your ride right with <span className="brand-name">AJ Reserve</span></h3>
            <p>Choose date and time</p>
            <div className="plan-inputs">
                <div className="input-group">
                <FaCalendarAlt />
                <input type="date" />
                </div>
                <div className="input-group">
                <FaClock />
                <input type="time" />
                </div>
            </div>
            <button className="plan-btn">Next</button>
            </div>
        </div>

        <div className="plan-right">
            <h4>Benefits</h4>
            <ul>
            <li>
                <FaRegCalendarAlt />
                <span>Choose your exact pickup time up to 15 days in advance.</span>
            </li>
            <li>
                <FaRegClock />
                <span>Extra wait time included to meet your ride.</span>
            </li>
            <li>
                <FaTimes />
                <span>Cancel at no charge up to 60 minutes in advance.</span>
            </li>
            </ul>
            <a href="#">See terms</a>
        </div>
        </div>
      
    </section>
  );
};

export default PlanLater;
