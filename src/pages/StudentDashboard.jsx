import React, { useEffect, useState, useRef, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "./StudentDashboard.css";

const FALLBACK_CENTER = { lat: 40.834, lng: -74.273 };
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

  // 🍃 hold the raw map instance
  const mapRef = useRef(null);
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // listen to Firestore for location updates
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "shuttles", "bus1"), (snap) => {
      if (snap.exists()) {
        setShuttle(snap.data());
      }
    });
    return () => unsub();
  }, []);

  // pan the map whenever location changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo(shuttle.location);
    }
  }, [shuttle.location]);

  if (!isLoaded) return <p style={{ padding: "2rem" }}>Loading map …</p>;
  if (loadError) return <p style={{ padding: "2rem" }}>Error loading map</p>;

  // occupancy slider logic (optional)
  const capacity = 15;
  const count = Math.min(shuttle.occupancy, capacity);
  const percent = (count / capacity) * 100;
  const level = count <= 5 ? "low" : count <= 10 ? "mid" : "high";

  return (
    <div className="dashboard">
      <div className="map-wrapper">
        <GoogleMap
          mapContainerStyle={mapStyles}
          center={shuttle.location}
          zoom={14}
          onLoad={onMapLoad}
          options={{ disableDefaultUI: true, zoomControl: true }}
        >
          <Marker position={shuttle.location} title="Shuttle Live Location" />
        </GoogleMap>
      </div>

      <div className="info-panel">
        <div className="card">
          <h3>Location</h3>
          <p className="big-num">
            {shuttle.location.lat.toFixed(5)}, {shuttle.location.lng.toFixed(5)}
          </p>
        </div>
        <div className="card">
          <h3>Students on board</h3>
          <div className="slider-wrapper">
            <div
              className={`slider-fill ${level}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="big-num">
            {count}/{capacity}
          </p>
        </div>
      </div>
    </div>
  );
}
