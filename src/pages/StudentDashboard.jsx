import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import QRCode from "react-qr-code";
import "./StaffDashboard.css";

const FALLBACK_CENTER = { lat: 40.834, lng: -74.273 };

const mapStyles = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
};

export default function StaffDashboard() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [shuttle, setShuttle] = useState({
    location: FALLBACK_CENTER,
    speed: 0,
    occupancy: 0,
  });
  const [tripStarted, setTripStarted] = useState(false);
  const watchIdRef = useRef(null); // 📍 fix here!

  // Firebase listener
  useEffect(() => {
    if (tripStarted) {
      const unsub = onSnapshot(doc(db, "shuttles", "bus1"), (snap) => {
        if (snap.exists()) setShuttle(snap.data());
      });
      return unsub;
    }
  }, [tripStarted]);

  // Location tracking
  useEffect(() => {
    if (tripStarted) {
      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude, speed } = position.coords;
            try {
              await setDoc(doc(db, "shuttles", "bus1"), {
                location: { lat: latitude, lng: longitude },
                speed: speed ? (speed * 2.23694).toFixed(1) : 0,
                occupancy: 10, // Hardcoded occupancy
              });
            } catch (err) {
              console.error("Failed to update location:", err);
            }
          },
          (error) => {
            console.error("Error getting location", error);
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
        watchIdRef.current = id;
      } else {
        alert("Geolocation not supported!");
      }
    } else {
      // Trip end clear
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }
  }, [tripStarted]);

  if (loadError) return <p style={{ padding: "2rem" }}>Error loading maps.</p>;
  if (!isLoaded) return <p style={{ padding: "2rem" }}>Loading map …</p>;

  const capacity = 15;
  const count = Math.min(shuttle.occupancy, capacity);
  const percent = (count / capacity) * 100;

  let level;
  if (count <= 5) level = "low";
  else if (count <= 10) level = "mid";
  else level = "high";

  return (
    <>
      <h1 className="dashboard-title">Student Dashboard</h1>

      {!tripStarted ? (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            className="start-trip-btn"
            onClick={() => setTripStarted(true)}
          >
            Start Trip
          </button>
        </div>
      ) : (
        <>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              className="end-trip-btn"
              onClick={() => setTripStarted(false)}
            >
              End Trip
            </button>
          </div>

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
                  title="Shuttle Live Location"
                />
              </GoogleMap>
            </div>

            <div className="info-panel">
              <div className="card">
                <h3>Location</h3>
                <p className="big-num">
                  {shuttle.location.lat?.toFixed(5)},{" "}
                  {shuttle.location.lng?.toFixed(5)}
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
                <p className="big-num" style={{ marginTop: "0.5rem" }}>
                  {count}/{capacity}
                </p>
              </div>

              <div className="card">
                <h3>Shuttle speed</h3>
                <p className="big-num">{shuttle.speed} mph</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
