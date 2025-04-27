import React from "react";
import { Button } from "react-bootstrap";
import qrCode from "../assets/Rickrolling_QR_code.png";
import "../css/SignupHero.css";
import { useNavigate } from "react-router-dom";

export default function SignupHero() {
  const navigate = useNavigate();
  return (
    <div className="signup-hero">
      <div className="signup-hero__button">
        <Button variant="danger" size="lg" onClick={() => navigate("/auth")}>
          Signup
        </Button>
      </div>
      <div className="signup-hero__qr">
        <img src={qrCode} alt="Track Shuttle QR" />
        <p>Scan to Download the app</p>
      </div>
    </div>
  );
}
