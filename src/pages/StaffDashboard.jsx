import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "./StaffDashboard.css";

const FALLBACK_CENTER = { lat: 40.834, lng: -74.273 }; // Caldwell University approx

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
        const newData = snap.data();
        animateMove(newData.location);
        setShuttle((prev) => ({
          ...prev,
          speed: newData.speed,
          occupancy: newData.occupancy,
        }));
      }
    });
    return unsub;
  }, []);

  function animateMove(newLocation) {
    setShuttle((prevShuttle) => {
      const { location } = prevShuttle;

      if (!location) return { ...prevShuttle, location: newLocation };

      const deltaLat = (newLocation.lat - location.lat) / 20;
      const deltaLng = (newLocation.lng - location.lng) / 20;

      let i = 0;
      const interval = setInterval(() => {
        i++;
        setShuttle((prev) => ({
          ...prev,
          location: {
            lat: prev.location.lat + deltaLat,
            lng: prev.location.lng + deltaLng,
          },
        }));
        if (i >= 20) {
          clearInterval(interval);
        }
      }, 50); // 20 frames over 1 second
      return prevShuttle;
    });
  }

  if (loadError) return <p style={{ padding: "2rem" }}>Error loading maps.</p>;
  if (!isLoaded) return <p style={{ padding: "2rem" }}>Loading map …</p>;

  return (
    <>
      <h1 className="dashboard-title">Staff Dashboard</h1>

      <div className="dashboard">
        <div className="map-wrapper">
          <GoogleMap
            mapContainerClassName="map-wrapper"
            center={shuttle.location}
            zoom={14}
            options={{ disableDefaultUI: true, zoomControl: true }}
          >
            <Marker
              position={shuttle.location}
              title="Shuttle Current Location"
              icon={{
                url: "/bus-icon.png",
                scaledSize: new window.google.maps.Size(50, 50),
              }}
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
