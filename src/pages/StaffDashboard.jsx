// src/pages/StaffDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import QRCode from "react-qr-code";
import "./StaffDashboard.css";

const FALLBACK_CENTER = { lat: 40.834, lng: -74.273 };
const capacity = 15;

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
  const watchIdRef = useRef(null);

  // Listen to Firestore shuttle doc
  useEffect(() => {
    if (!tripStarted) return;
    const unsub = onSnapshot(doc(db, "shuttles", "bus1"), (snap) => {
      if (snap.exists()) {
        setShuttle(snap.data());
      }
    });
    return unsub;
  }, [tripStarted]);

  // Geo watch
  useEffect(() => {
    if (tripStarted) {
      if (!navigator.geolocation) {
        alert("Geolocation not supported!");
        return;
      }
      const id = navigator.geolocation.watchPosition(
        async ({ coords }) => {
          const { latitude, longitude, speed } = coords;
          // update location & speed
          await updateDoc(doc(db, "shuttles", "bus1"), {
            location: { lat: latitude, lng: longitude },
            speed: speed ? (speed * 2.23694).toFixed(1) : 0,
          });
        },
        (err) => console.error("Geo error", err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
      watchIdRef.current = id;
    } else if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, [tripStarted]);

  const handleChangeCount = async (delta) => {
    const newCount = Math.max(0, Math.min(capacity, shuttle.occupancy + delta));
    try {
      await updateDoc(doc(db, "shuttles", "bus1"), { occupancy: newCount });
      // local update will come via onSnapshot but we can optimistically set:
      setShuttle((s) => ({ ...s, occupancy: newCount }));
    } catch (err) {
      console.error("Failed to update count:", err);
    }
  };

  if (loadError) return <p style={{ padding: "2rem" }}>Error loading maps.</p>;
  if (!isLoaded) return <p style={{ padding: "2rem" }}>Loading map…</p>;

  const count = Math.min(shuttle.occupancy, capacity);
  const percent = (count / capacity) * 100;
  let level = count <= 5 ? "low" : count <= 10 ? "mid" : "high";

  return (
    <>
      <h1 className="dashboard-title">Driver Dashboard</h1>
      {!tripStarted ? (
        <div className="center-btn">
          <button
            className="start-trip-btn"
            onClick={() => setTripStarted(true)}
          >
            Start Trip
          </button>
        </div>
      ) : (
        <>
          <div className="center-btn">
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
              {/* Location Card */}
              <div className="card">
                <h3>Location</h3>
                <p className="big-num">
                  {shuttle.location.lat.toFixed(5)},{" "}
                  {shuttle.location.lng.toFixed(5)}
                </p>
              </div>

              {/* Occupancy Card */}
              <div className="cardOne">
                <h3>Students on board</h3>
                <div className="slider-wrapper">
                  <div
                    className={`slider-fill ${level}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="count-controls">
                  <button
                    onClick={() => handleChangeCount(-1)}
                    disabled={count === 0}
                  >
                    –
                  </button>
                  <span className="big-num">{count}</span>
                  <button
                    onClick={() => handleChangeCount(1)}
                    disabled={count === capacity}
                  >
                    +
                  </button>
                </div>
                <p style={{ marginTop: "0.5rem" }}>
                  {count}/{capacity}
                </p>
              </div>

              {/* Speed Card */}
              <div className="card">
                <h3>Shuttle speed</h3>
                <p className="big-num">{shuttle.speed} mph</p>
              </div>

              {/* QR Code Card */}
              {/* <div className="card">
                <h3>Trip QR Code</h3>
                <QRCode value={`shuttle-${Date.now()}`} size={128} />
              </div> */}
            </div>
          </div>
        </>
      )}
    </>
  );
}
