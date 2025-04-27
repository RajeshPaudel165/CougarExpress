// src/components/SignOutBtn.jsx
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function SignOutBtn() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("role");
      navigate("/auth");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <button className="btn btn-outline-danger" onClick={handleSignOut}>
      Sign Out
    </button>
  );
}
