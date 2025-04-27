import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  Circle,
} from "@react-google-maps/api";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "./StudentDashboard.css";

const FALLBACK_CENTER = { lat: 40.834, lng: -74.273 }; // Caldwell University approx

const mapStyles = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
};

const circleOptions = {
  strokeColor: "#0000FF",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: "#ADD8E6",
  fillOpacity: 0.35,
  radius: 50, // Adjust the radius as needed (in meters)
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
        const newData = snap.data();
        setShuttle((prev) => ({
          ...prev,
          location: newData.location, // Directly update the location for smoother movement
          speed: newData.speed,
          occupancy: newData.occupancy,
        }));
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
            mapContainerClassName="map-wrapper"
            center={shuttle.location}
            zoom={15} // Slightly increased zoom for better visibility
            options={{ disableDefaultUI: true, zoomControl: true }}
          >
            <Circle center={shuttle.location} options={circleOptions} />
            {/* OPTIONAL: Keep the marker if you prefer both the circle and the icon */}
            {/* <Marker
              position={shuttle.location}
              title="Shuttle Current Location"
              icon={{
                url: "/bus-icon.png",
                scaledSize: new window.google.maps.Size(50, 50),
              }}
            /> */}
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
