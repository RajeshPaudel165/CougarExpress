import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "./StudentDashboard.css";

const FALLBACK_CENTER = { lat: 40.83392, lng: -74.27238 };

const mapContainerStyle = {
  width: "100%",
  height: "100%",
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
      if (snap.exists()) setShuttle(snap.data());
    });
    return unsub;
  }, []);

  if (loadError) return <div>Error loading map</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <div className="map-wrapper">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={shuttle.location}
          zoom={15}
        >
          <Marker position={shuttle.location} />
        </GoogleMap>
      </div>

      <div className="info-panel">
        <div className="card">
          <h3>Shuttle Current Location</h3>
          <div className="big-num">
            {shuttle.location.lat.toFixed(5)}, {shuttle.location.lng.toFixed(5)}
          </div>
        </div>

        <div className="card">
          <h3>Speed</h3>
          <div className="big-num">{shuttle.speed} mph</div>
        </div>

        <div className="card">
          <h3>Students on Board</h3>
          <div className="big-num">{shuttle.occupancy}/15</div>
        </div>
      </div>
    </div>
  );
}
