// src/components/ContactSection.jsx
import CampusMap from "./CampusMap";
import FeedbackForm from "./FeedbackForm";
import "../css/contact-section.css";

export default function ContactSection() {
  return (
    <div className="contact-section">
      <div className="map-col">
        <CampusMap />
      </div>

      <div className="form-col">
        <FeedbackForm />
      </div>
    </div>
  );
}
