import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "./StudentDashboard.css";

const FALLBACK_CENTER = { lat: 40.834, lng: -74.273 }; // Caldwell University approx

const mapStyles = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
};

export default function StudentDashboard() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [shuttle, setShuttle] = useState({
    location: FALLBACK_CENTER,
    speed: 0,
    occupancy: 0,
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "shuttles", "bus1"), (snap) => {
      if (snap.exists()) {
        setShuttle(snap.data());
      }
    });
    return unsub;
  }, []);

  if (loadError) return <p style={{ padding: "2rem" }}>Error loading maps.</p>;
  if (!isLoaded) return <p style={{ padding: "2rem" }}>Loading map …</p>;

  return (
    <>
      <h1 className="dashboard-title">Student Dashboard</h1>

      <div className="dashboard">
        <div className="map-wrapper">
          <GoogleMap
            mapContainerStyle={mapStyles}
            center={shuttle.location}
            zoom={14}
            options={{ disableDefaultUI: true, zoomControl: true }}
          >
            <Marker
              position={shuttle.location}
              title="Shuttle Current Location"
            />
          </GoogleMap>
        </div>

        <div className="info-panel">
          <div className="card">
            <h3>Shuttle Current Location</h3>
            <p className="big-num">
              {shuttle.location.lat?.toFixed(5)},{" "}
              {shuttle.location.lng?.toFixed(5)}
            </p>
          </div>

          <div className="card">
            <h3>Speed</h3>
            <p className="big-num">{shuttle.speed} mph</p>
          </div>

          <div className="card">
            <h3>Students on Board</h3>
            <p className="big-num">{shuttle.occupancy}/15</p>
          </div>
        </div>
      </div>
    </>
  );
}
