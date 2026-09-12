const jwt = require("jsonwebtoken");

/* =========================================
   CareerNest - Authentication Middleware
========================================= */

const authMiddleware = (req, res, next) => {
  try {
    /* -----------------------------------------
       1. Check Authorization Header
    ----------------------------------------- */

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    /* -----------------------------------------
       2. Check Bearer Format
    ----------------------------------------- */

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication format.",
      });
    }

    /* -----------------------------------------
       3. Extract Token
    ----------------------------------------- */

    const token = authHeader
      .substring(7)
      .trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing.",
      });
    }

    /* -----------------------------------------
       4. Check JWT Secret
    ----------------------------------------- */

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is missing in backend .env"
      );

      return res.status(500).json({
        success: false,
        message:
          "Server authentication configuration error.",
      });
    }

    /* -----------------------------------------
       5. Verify JWT Token
    ----------------------------------------- */

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    /* -----------------------------------------
       6. Validate User ID
    ----------------------------------------- */

    if (
      !decoded ||
      !decoded.userId
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    /* -----------------------------------------
       7. Store Authenticated User
    ----------------------------------------- */

    req.user = {
      userId: decoded.userId,
    };

    /* -----------------------------------------
       8. Continue Request
    ----------------------------------------- */

    next();

  } catch (error) {
    console.error(
      "Auth Middleware Error:",
      error.message
    );

    /* -----------------------------------------
       Expired Token
    ----------------------------------------- */

    if (
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Your session has expired. Please login again.",
      });
    }

    /* -----------------------------------------
       Invalid Token
    ----------------------------------------- */

    if (
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token. Please login again.",
      });
    }

    /* -----------------------------------------
       General Authentication Error
    ----------------------------------------- */

    return res.status(401).json({
      success: false,
      message:
        "Authentication failed. Please login again.",
    });
  }
};

module.exports = authMiddleware;