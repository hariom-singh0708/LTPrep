import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
  FaUserCircle,
  FaBookOpen,
  FaChalkboardTeacher,
  FaSignOutAlt,
  FaSignInAlt,
  FaHome,
  FaBars,
  FaTimes,
  FaChartBar,
} from "react-icons/fa";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => setShowMenu(!showMenu);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top border-bottom">
      <div className="container py-2">
        {/* Brand */}
        <Link to="/" className="navbar-brand fw-bold text-primary d-flex align-items-center gap-2">
          <FaBookOpen className="text-primary fs-4" />
          <span className="fs-5">LTPrep</span>
        </Link>

        {/* Mobile Toggler */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={toggleMenu}
        >
          {showMenu ? (
            <FaTimes className="text-primary fs-3" />
          ) : (
            <FaBars className="text-primary fs-3" />
          )}
        </button>

        <div className={`collapse navbar-collapse ${showMenu ? "show" : ""}`}>
          {/* Left Navigation */}
          {user && (
            <ul className="navbar-nav me-auto mt-3 mt-lg-0">
              <li className="nav-item mx-1">
                <Link className="nav-link d-flex align-items-center gap-1" to="/">
                  <FaHome className="text-primary" />
                  Home
                </Link>
              </li>
              {user.role === "student" && (
                <li className="nav-item mx-1">
                  <Link className="nav-link d-flex align-items-center gap-1" to="/subjects">
                  <FaBookOpen className="text-primary" />
                  Subjects
                </Link>
                </li>
              )}
              {user.role === "admin" && (
                <li className="nav-item mx-1">
                  <Link className="nav-link d-flex align-items-center gap-1" to="/admin/dashboard">
                    <FaChartBar className="text-primary" />
                    Dashboard
                  </Link>
                </li>
              )}
              {user.role === "admin" && (
                <li className="nav-item mx-1">
                  <Link className="nav-link d-flex align-items-center gap-1" to="/admin">
                    <FaChalkboardTeacher className="text-primary" />
                    Admin Panel
                  </Link>
                </li>
              )}
            </ul>
          )}

          {/* Right Side Actions */}
          <ul className="navbar-nav ms-auto align-items-lg-center mt-3 mt-lg-0">
            {!user ? (
              <li className="nav-item">
                <Link
                  className="btn btn-primary px-4 d-flex align-items-center gap-2"
                  to="/login"
                >
                  <FaSignInAlt />
                  Login
                </Link>
              </li>
            ) : (
              <>
                <li className="nav-item d-flex align-items-center me-lg-3 mb-2 mb-lg-0">
                  <FaUserCircle className="text-secondary fs-4 me-2" />
                  <span className="text-dark small">
                    <strong>{user.name}</strong> ({user.role})
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-danger px-4 d-flex align-items-center gap-2"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Simple gradient underline */}
      <div
        style={{
          height: "3px",
          background:
            "linear-gradient(90deg, #0d6efd, #6610f2, #d63384, #20c997)",
        }}
      ></div>
    </nav>
  );
}
