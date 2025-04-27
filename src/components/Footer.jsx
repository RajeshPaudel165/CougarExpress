import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import "../css/Footer.css";

export default function Footer() {
  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Brand Section */}
        <div className="footer-section about">
          <h3>Caldwell University</h3>
          <p>
            Your go-to app for shuttle tracking and more. Stay connected, stay
            informed.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section links">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Home
              </button>
            </li>
            <li>
              <button onClick={() => scrollTo("about")}>About</button>
            </li>
            <li>
              <button onClick={() => scrollTo("contact")}>Contact</button>
            </li>
            <li>
              <a href="/auth">Sign In</a>
            </li>
          </ul>
        </div>

        {/* Social Media Icons */}
        <div className="footer-section social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <hr />
        &copy; {new Date().getFullYear()} Caldwell University. All rights
        reserved.
      </div>
    </footer>
  );
}
