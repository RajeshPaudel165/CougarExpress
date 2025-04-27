import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

import "./welcome.css";

export default function Welcome() {
  const navigate = useNavigate();

  const choose = (role) => {
    const { uid } = auth.currentUser;
    localStorage.setItem(`role_${uid}`, role);
    navigate(`/dashboard/${role}`);
  };

  return (
    <div className="choice-container">
      <h2 className="title">Who are you?</h2>

      <div className="card-grid">
        <button className="role-card" onClick={() => choose("student")}>
          <h3> I’m a Student</h3>
          <p>Track suttle service.</p>
        </button>

        <button className="role-card" onClick={() => choose("staff")}>
          <h3> I’m Staff</h3>
          <p>manage rides and announcements.</p>
        </button>
      </div>
    </div>
  );
}
