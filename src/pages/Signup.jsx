import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

const API_URL = "http://localhost:5000";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================
  // HANDLE INPUT CHANGE
  // =========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================
  // VALIDATE FORM
  // =========================================
  const validateForm = () => {
    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return false;
    }

    if (fullName.length < 2) {
      setError("Please enter your full name.");
      return false;
    }

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    return true;
  };

  // =========================================
  // HANDLE SIGNUP
  // =========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/signup`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // =========================================
      // SIGNUP FAILED
      // =========================================
      if (!response.ok || !data.success) {
        setError(
          data.message || "Unable to create your account."
        );
        return;
      }

      // =========================================
      // CLEAR OLD AUTH DATA
      // =========================================
      localStorage.removeItem("careerNestToken");
      localStorage.removeItem("careerNestUser");

      sessionStorage.removeItem("careerNestToken");
      sessionStorage.removeItem("careerNestUser");

      // =========================================
      // SAVE USER INFORMATION
      // =========================================
      if (data.user) {
        localStorage.setItem(
          "careerNestUser",
          JSON.stringify(data.user)
        );
      }

      // =========================================
      // SUCCESS
      // =========================================
      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      // =========================================
      // RESET FORM
      // =========================================
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setShowPassword(false);
      setShowConfirmPassword(false);

      // =========================================
      // REDIRECT TO LOGIN
      // =========================================
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error("Signup Error:", error);

      setError(
        "Unable to connect to CareerNest server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">

      <div className="signup-card">

        {/* =====================================
            LOGO
        ===================================== */}
        <Link to="/" className="signup-logo">
          Career<span>Nest</span>
        </Link>

        {/* =====================================
            HEADER
        ===================================== */}
        <div className="signup-header">

          <h1>
            Create Your Account
          </h1>

          <p>
            Start building your career with CareerNest.
          </p>

        </div>

        {/* =====================================
            ERROR
        ===================================== */}
        {error && (
          <div className="signup-error" role="alert">
            {error}
          </div>
        )}

        {/* =====================================
            SUCCESS
        ===================================== */}
        {success && (
          <div className="signup-success" role="status">
            {success}
          </div>
        )}

        {/* =====================================
            FORM
        ===================================== */}
        <form onSubmit={handleSubmit} noValidate>

          {/* Full Name */}
          <div className="signup-form-group">

            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
              required
            />

          </div>

          {/* Email */}
          <div className="signup-form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />

          </div>

          {/* Password */}
          <div className="signup-form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="signup-password-input">

              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />

              <button
                type="button"
                className="signup-show-password"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

            <small>
              Use at least 6 characters.
            </small>

          </div>

          {/* Confirm Password */}
          <div className="signup-form-group">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <div className="signup-password-input">

              <input
                id="confirmPassword"
                name="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
              />

              <button
                type="button"
                className="signup-show-password"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) => !current
                  )
                }
                disabled={loading}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>

          {/* Terms */}
          <label className="signup-terms">

            <input
              type="checkbox"
              required
              disabled={loading}
            />

            <span>
              I agree to the Terms & Conditions
              and Privacy Policy.
            </span>

          </label>

          {/* Submit */}
          <button
            type="submit"
            className="signup-submit-btn"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account →"}
          </button>

        </form>

        {/* =====================================
            LOGIN
        ===================================== */}
        <div className="signup-login">

          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Login
          </Link>

        </div>

      </div>

    </main>
  );
}

export default Signup;