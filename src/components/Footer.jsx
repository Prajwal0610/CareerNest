import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const handleUnavailable = (event) => {
    event.preventDefault();
  };

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* =========================================
            BRAND
        ========================================= */}
        <div className="footer-brand">

          <Link to="/" className="footer-logo">
            Career<span>Nest</span>
          </Link>

          <p>
            Your complete platform for discovering opportunities,
            building skills, and growing your career.
          </p>

          <div className="footer-socials">

            <a
              href="#"
              aria-label="LinkedIn"
              onClick={handleUnavailable}
            >
              in
            </a>

            <a
              href="#"
              aria-label="GitHub"
              onClick={handleUnavailable}
            >
              GH
            </a>

            <a
              href="#"
              aria-label="Instagram"
              onClick={handleUnavailable}
            >
              IG
            </a>

            <a
              href="#"
              aria-label="X"
              onClick={handleUnavailable}
            >
              X
            </a>

          </div>

        </div>

        {/* =========================================
            PLATFORM
        ========================================= */}
        <div className="footer-column">

          <h3>Platform</h3>

          <Link to="/jobs">
            Find Jobs
          </Link>

          <Link to="/resume">
            Resume Builder
          </Link>

          <Link to="/skills">
            Skill Analyzer
          </Link>

          <Link to="/interview-prep">
            Interview Prep
          </Link>

          <Link to="/my-applications">
            My Applications
          </Link>

        </div>

        {/* =========================================
            COMPANY
        ========================================= */}
        <div className="footer-column">

          <h3>Company</h3>

          <a
            href="#"
            onClick={handleUnavailable}
          >
            About Us
          </a>

          <a
            href="#"
            onClick={handleUnavailable}
          >
            Contact
          </a>

          <a
            href="#"
            onClick={handleUnavailable}
          >
            Careers
          </a>

          <a
            href="#"
            onClick={handleUnavailable}
          >
            FAQs
          </a>

        </div>

        {/* =========================================
            RESOURCES
        ========================================= */}
        <div className="footer-column">

          <h3>Resources</h3>

          <a
            href="#"
            onClick={handleUnavailable}
          >
            Career Guides
          </a>

          <a
            href="#"
            onClick={handleUnavailable}
          >
            Help Center
          </a>

          <a
            href="#"
            onClick={handleUnavailable}
          >
            Privacy Policy
          </a>

          <a
            href="#"
            onClick={handleUnavailable}
          >
            Terms & Conditions
          </a>

        </div>

      </div>

      {/* =========================================
          FOOTER BOTTOM
      ========================================= */}
      <div className="footer-bottom">

        <p>
          © 2026 CareerNest. All rights reserved.
        </p>

        <p>
          Built for the next generation of professionals.
        </p>

      </div>

    </footer>
  );
}

export default Footer;