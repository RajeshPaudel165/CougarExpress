// src/components/NavBar.jsx
import React, { useEffect, useState } from "react";
import { Navbar, Container, Nav, NavDropdown, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { BsPersonCircle, BsBoxArrowRight } from "react-icons/bs";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

import logo from "../assets/logo.png.webp";
import "./NavBar.css";

export default function NavBar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const handleSignOut = async () => {
    await signOut(auth);
    localStorage.removeItem("role");
    navigate("/auth");
  };

  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Navbar bg="danger" variant="dark" expand="md" fixed="top">
      <Container>
        {/* Logo navigates to root */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img src={logo} alt="Caldwell University" height="40" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-center">
            {/* Home navigates to "/" */}
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>

            {/* In-page scrolls */}
            <Nav.Link onClick={() => scrollTo("about")}>About</Nav.Link>
            <Nav.Link onClick={() => scrollTo("contact")}>Contact</Nav.Link>

            {user ? (
              <Nav.Link onClick={handleSignOut}>Sign Out</Nav.Link>
            ) : (
              <Nav.Link as={Link} to="/auth">
                Sign In
              </Nav.Link>
            )}

            {user && (
              <NavDropdown
                align="end"
                title={
                  <BsPersonCircle size={28} className="user-avatar-icon" />
                }
                id="user-dropdown"
                menuVariant="light"
                className="user-dropdown"
              >
                <Dropdown.Header className="user-info">
                  <strong>{user.displayName}</strong>
                  <br />
                  <small className="text-muted">{user.email}</small>
                </Dropdown.Header>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleSignOut}>
                  <BsBoxArrowRight className="me-2" size={16} />
                  Sign Out
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
