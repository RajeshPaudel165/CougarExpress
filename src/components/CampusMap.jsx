// src/components/CampusMap.jsx
import React from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const CENTER = { lat: 40.834, lng: -74.273 };

const containerStyle = {
  width: "100%",
  height: "400px",
  maxWidth: "800px",
  margin: "2rem auto",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

export default function CampusMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (loadError) return <p>Error loading maps</p>;
  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={CENTER}
      zoom={15}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      <Marker position={CENTER} title="Caldwell University" />
    </GoogleMap>
  );
}
