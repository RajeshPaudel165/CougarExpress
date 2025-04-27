// src/components/AuthForm.jsx
import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/form.css";

export default function AuthForm() {
  const [isSignup, setIsSignup] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });

  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validation effects
  useEffect(() => {
    setErrors((prev) => ({
      ...prev,
      firstName:
        isSignup && firstName.trim() === "" ? "First name is required" : "",
    }));
  }, [firstName, isSignup]);

  useEffect(() => {
    setErrors((prev) => ({
      ...prev,
      lastName:
        isSignup && lastName.trim() === "" ? "Last name is required" : "",
    }));
  }, [lastName, isSignup]);

  useEffect(() => {
    setErrors((prev) => ({
      ...prev,
      email: email && !validateEmail(email) ? "Invalid email format" : "",
    }));
  }, [email]);

  useEffect(() => {
    let msg = "";
    if (password && password.length < 8) {
      msg = "Password must be at least 8 characters.";
    } else if (password && !/[A-Z]/.test(password)) {
      msg = "Must include at least one uppercase letter.";
    } else if (password && !/[0-9]/.test(password)) {
      msg = "Must include at least one number.";
    }
    setErrors((prev) => ({ ...prev, password: msg }));
  }, [password]);

  useEffect(() => {
    let msg = "";
    if (isSignup && confirm && confirm !== password) {
      msg = "Passwords don't match.";
    }
    setErrors((prev) => ({ ...prev, confirm: msg }));
  }, [confirm, password, isSignup]);

  const isFormValid = () => {
    if (!email || !password || (isSignup && !confirm)) return false;
    if (isSignup && (!firstName || !lastName)) return false;
    return (
      !errors.firstName &&
      !errors.lastName &&
      !errors.email &&
      !errors.password &&
      !errors.confirm
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.error("Please fix form errors before submitting.");
      return;
    }

    try {
      if (isSignup) {
        // Optionally use firstName/lastName after account creation
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created! Please log in.");

        await signOut(auth);
        setTimeout(() => navigate("/auth"), 1500);
      } else {
        await signInWithEmailAndPassword(auth, email, password);

        const { uid } = auth.currentUser;
        const role = localStorage.getItem(`role_${uid}`);

        if (role === "student" || role === "staff") {
          navigate(`/dashboard/${role}`);
        } else {
          navigate("/welcome");
        }
      }
    } catch (err) {
      toast.error(err.message.replace("Firebase: ", ""));
    }
  };

  return (
    <>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <h2 className="signuplogin">
          {isSignup ? "Create account" : "Log in"}
        </h2>

        {isSignup && (
          <>
            <div className="form-group">
              <input
                type="text"
                placeholder="First name"
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              {errors.firstName && (
                <small className="error">{errors.firstName}</small>
              )}
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Last name"
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              {errors.lastName && (
                <small className="error">{errors.lastName}</small>
              )}
            </div>
          </>
        )}

        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
          />
          {errors.email && <small className="error">{errors.email}</small>}
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errors.password && (
            <small className="error">{errors.password}</small>
          )}
        </div>

        {isSignup && (
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm password"
              className="form-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {errors.confirm && (
              <small className="error">{errors.confirm}</small>
            )}
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={!isFormValid()}>
          {isSignup ? "Sign up" : "Log in"}
        </button>

        <p className="span">
          {isSignup ? "Already have an account? " : "Need an account? "}
          <span
            className="login-signup-link"
            onClick={() => setIsSignup((prev) => !prev)}
          >
            {isSignup ? "Log in" : "Sign up"}
          </span>
        </p>
      </form>

      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}
