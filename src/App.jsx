// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import AuthForm from "./components/AuthForm";
import Home from "./pages/Home";
import Welcome from "./pages/Welcome";
import StudentDashboard from "./pages/StudentDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "./components/Footer";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/welcome" element={<Welcome />} />

        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/staff" element={<StaffDashboard />} />

        <Route
          path="*"
          element={<h2 style={{ padding: "2rem" }}>404 – page not found</h2>}
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
