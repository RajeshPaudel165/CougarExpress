// Cards.jsx
import React from "react";
import "../css/Card.css";

export default function Cards() {
  return (
    <section id="about" className="card-container">
      <div className="card">
        <h3>Real-time Tracking</h3>
        <p>See the shuttle's current location on a map.</p>
      </div>
      <div className="card">
        <h3>Schedule Updates</h3>
        <p>Get the latest schedule changes and notifications.</p>
      </div>
      <div className="card">
        <h3>Mobile Friendly</h3>
        <p>Access the tracker on any device.</p>
      </div>
    </section>
  );
}
