import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const API_URL = "http://localhost:5000";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // =========================================
  // LOAD LOGGED-IN USER
  // =========================================
  useEffect(() => {
    const localUser = localStorage.getItem("careerNestUser");
    const sessionUser = sessionStorage.getItem("careerNestUser");

    const storedUser = localUser || sessionUser;

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Invalid stored user:", error);

        localStorage.removeItem("careerNestUser");
        sessionStorage.removeItem("careerNestUser");
      }
    }
  }, []);

  // =========================================
  // CHECK ADMIN
  // =========================================
  useEffect(() => {
    const checkAdmin = async () => {
      const token =
        localStorage.getItem("careerNestToken") ||
        sessionStorage.getItem("careerNestToken");

      if (!token) {
        setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/admin/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setIsAdmin(response.ok);
      } catch (error) {
        console.error("Admin check failed:", error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  // =========================================
  // LOGOUT
  // =========================================
  const handleLogout = () => {
    localStorage.removeItem("careerNestToken");
    localStorage.removeItem("careerNestUser");

    sessionStorage.removeItem("careerNestToken");
    sessionStorage.removeItem("careerNestUser");

    setUser(null);
    setIsAdmin(false);

    navigate("/login");
  };

  // =========================================
  // NAVIGATION LINK STYLE
  // =========================================
  const navClass = ({ isActive }) =>
    isActive ? "active-link" : "";

  // =========================================
  // USER INITIAL
  // =========================================
  const userInitial = user?.fullName
    ? user.fullName.charAt(0).toUpperCase()
    : "U";

  // =========================================
  // FIRST NAME
  // =========================================
  const firstName = user?.fullName
    ? user.fullName.split(" ")[0]
    : "User";

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* =====================================
            LOGO
        ===================================== */}
        <Link to="/" className="navbar-logo">
          Career<span>Nest</span>
        </Link>

        {/* =====================================
            NAVIGATION
        ===================================== */}
        <div className="navbar-links">

          <NavLink
            to="/"
            end
            className={navClass}
          >
            Home
          </NavLink>

          <NavLink
            to="/jobs"
            className={navClass}
          >
            Jobs
          </NavLink>

          <NavLink
            to="/resume"
            className={navClass}
          >
            Resume Builder
          </NavLink>

          <NavLink
            to="/skills"
            className={navClass}
          >
            Skill Analyzer
          </NavLink>

          <NavLink
            to="/interview-prep"
            className={navClass}
          >
            Interview Prep
          </NavLink>

          {/* My Applications */}
          {user && (
            <NavLink
              to="/my-applications"
              className={navClass}
            >
              My Applications
            </NavLink>
          )}

          {/* Admin */}
          {user && isAdmin && (
            <NavLink
              to="/admin"
              className={navClass}
            >
              Admin
            </NavLink>
          )}

        </div>

        {/* =====================================
            RIGHT SIDE ACTIONS
        ===================================== */}
        <div className="navbar-actions">

          {user ? (
            <>
              {/* Logged-in User */}
              <div className="navbar-user">

                <div className="navbar-user-avatar">
                  {userInitial}
                </div>

                <span className="navbar-user-name">
                  Hi, {firstName}
                </span>

              </div>

              {/* Logout */}
              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                to="/login"
                className="login-btn"
              >
                Login
              </Link>

              {/* Sign Up */}
              <Link
                to="/signup"
                className="signup-btn"
              >
                Sign Up
              </Link>
            </>
          )}

        </div>

      </div>
    </nav>
  );
}

export default Navbar;