import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const API_URL = "http://localhost:5000";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [loginMessage, setLoginMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /* =========================================
     HANDLE INPUT
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setLoginMessage("");
  };

  /* =========================================
     VALIDATE FORM
  ========================================= */

  const validateForm = () => {
    const newErrors = {};

    const email = formData.email.trim();
    const password = formData.password;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = "Please enter your email address.";
    } else if (!emailPattern.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Please enter your password.";
    } else if (password.length < 6) {
      newErrors.password =
        "Password must contain at least 6 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =========================================
     LOGIN
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoginMessage("");
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: formData.email.trim(),
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

      /* =====================================
         LOGIN FAILED
      ===================================== */

      if (!response.ok || !data.success) {
        setLoginMessage(
          data.message || "Invalid email or password."
        );

        return;
      }

      /* =====================================
         CHECK TOKEN
      ===================================== */

      if (!data.token || !data.user) {
        setLoginMessage(
          "Login response is incomplete. Please try again."
        );

        return;
      }

      /* =====================================
         CLEAR OLD AUTH DATA
      ===================================== */

      localStorage.removeItem("careerNestToken");
      localStorage.removeItem("careerNestUser");

      sessionStorage.removeItem("careerNestToken");
      sessionStorage.removeItem("careerNestUser");

      /* =====================================
         SAVE NEW AUTH DATA
      ===================================== */

      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      storage.setItem(
        "careerNestToken",
        data.token
      );

      storage.setItem(
        "careerNestUser",
        JSON.stringify(data.user)
      );

      /* =====================================
         SUCCESS
      ===================================== */

      setLoginMessage(
        `Welcome back, ${data.user.fullName}!`
      );

      /* Small delay so user can see success */

      setTimeout(() => {
        navigate("/");
      }, 500);

    } catch (error) {
      console.error("Login Error:", error);

      setLoginMessage(
        "Unable to connect to CareerNest server. Please make sure the backend is running."
      );

    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================
     FORGOT PASSWORD
  ========================================= */

  const handleForgotPassword = () => {
    if (isLoading) return;

    setLoginMessage(
      "Password recovery will be available soon."
    );
  };

  /* =========================================
     RETURN UI
  ========================================= */

  return (
    <main className="login-page">

      <div className="login-card">

        {/* =====================================
            LOGO
        ====================================== */}

        <Link
          to="/"
          className="login-logo"
        >
          Career<span>Nest</span>
        </Link>

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="login-header">

          <p className="login-section-tag">
            WELCOME BACK
          </p>

          <h1>
            Login to Your Account
          </h1>

          <p>
            Continue your CareerNest journey
            and explore new opportunities.
          </p>

        </div>

        {/* =====================================
            MESSAGE
        ====================================== */}

        {(loginMessage ||
          Object.keys(errors).length > 0) && (

          <div
            className={
              loginMessage
                ? "login-message"
                : "login-error"
            }
          >
            {loginMessage ||
              "Please fix the errors below and try again."}
          </div>
        )}

        {/* =====================================
            LOGIN FORM
        ====================================== */}

        <form
          onSubmit={handleSubmit}
          noValidate
        >

          {/* EMAIL */}

          <div
            className={
              errors.email
                ? "login-form-group has-error"
                : "login-form-group"
            }
          >

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
              disabled={isLoading}
            />

            {errors.email && (
              <small className="login-field-error">
                {errors.email}
              </small>
            )}

          </div>

          {/* PASSWORD */}

          <div
            className={
              errors.password
                ? "login-form-group has-error"
                : "login-form-group"
            }
          >

            <div className="password-label">

              <label htmlFor="password">
                Password
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Forgot Password?
              </button>

            </div>

            <div className="password-input">

              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />

              <button
                type="button"
                className="show-password"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                disabled={isLoading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

            {errors.password && (
              <small className="login-field-error">
                {errors.password}
              </small>
            )}

          </div>

          {/* REMEMBER ME */}

          <label className="remember-me">

            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) =>
                setRememberMe(
                  e.target.checked
                )
              }
              disabled={isLoading}
            />

            <span>
              Remember me
            </span>

          </label>

          {/* SUBMIT */}

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading
              ? "Logging in..."
              : "Login →"}
          </button>

        </form>

        {/* =====================================
            DIVIDER
        ====================================== */}

        <div className="login-divider">
          <span>or</span>
        </div>

        {/* =====================================
            SIGN UP
        ====================================== */}

        <div className="login-signup">

          <span>
            Don't have an account?
          </span>

          <Link to="/signup">
            Create an account
          </Link>

        </div>

        {/* =====================================
            SECURITY NOTE
        ====================================== */}

        <div className="login-security">

          <span>
            🔒
          </span>

          <p>
            Your account information is kept
            secure and private.
          </p>

        </div>

      </div>

    </main>
  );
}

export default Login;