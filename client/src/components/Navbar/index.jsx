import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        🎤 AI Interview
      </Link>

      <div className="navbar-right">
        {user && (
          <>
            <Link to="/" className="navbar-link">
              Home
            </Link>
            <Link to="/history" className="navbar-link">
              History
            </Link>

            <span className="navbar-user">👤 {user.name}</span>

            <button onClick={handleLogout} className="navbar-logout">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
