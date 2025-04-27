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
import { Card } from "react-bootstrap";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/welcome" element={<Welcome />} />

        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/staff" element={<StaffDashboard />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
