import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyApplications.css";

const API_URL = "http://localhost:5000";

const STATUS_CONFIG = {
  Applied: {
    className: "status-applied",
    icon: "✓",
  },
  "Under Review": {
    className: "status-review",
    icon: "◷",
  },
  Shortlisted: {
    className: "status-shortlisted",
    icon: "★",
  },
  Rejected: {
    className: "status-rejected",
    icon: "✕",
  },
  Withdrawn: {
    className: "status-withdrawn",
    icon: "↩",
  },
};

function formatDate(dateValue) {
  if (!dateValue) return "Date unavailable";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "CN";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function MyApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);

  const [filter, setFilter] = useState("All");

  const [openingResumeId, setOpeningResumeId] = useState(null);
  const [downloadingResumeId, setDownloadingResumeId] = useState(null);

  /* =========================================
     GET AUTH TOKEN
  ========================================= */

  const getToken = () => {
    return (
      localStorage.getItem("careerNestToken") ||
      sessionStorage.getItem("careerNestToken")
    );
  };

  /* =========================================
     CLEAR SESSION
  ========================================= */

  const clearSessionAndLogin = () => {
    localStorage.removeItem("careerNestToken");
    localStorage.removeItem("careerNestUser");

    sessionStorage.removeItem("careerNestToken");
    sessionStorage.removeItem("careerNestUser");

    navigate("/login");
  };

  /* =========================================
     LOAD APPLICATIONS
  ========================================= */

  const loadApplications = async () => {
    const token = getToken();

    if (!token) {
      clearSessionAndLogin();
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/applications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      /* SESSION EXPIRED */

      if (response.status === 401) {
        alert(
          "Your session has expired. Please login again."
        );

        clearSessionAndLogin();
        return;
      }

      /* SERVER ERROR */

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to load your applications."
        );
      }

      /* SAVE APPLICATIONS */

      setApplications(
        Array.isArray(data.applications)
          ? data.applications
          : []
      );
    } catch (err) {
      console.error(
        "My Applications Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load applications. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================
     INITIAL LOAD
  ========================================= */

  useEffect(() => {
    loadApplications();
  }, []);

  /* =========================================
     VIEW RESUME
  ========================================= */

  const handleViewResume = async (applicationId) => {
    const token = getToken();

    if (!token) {
      clearSessionAndLogin();
      return;
    }

    setOpeningResumeId(applicationId);

    try {
      const response = await fetch(
        `${API_URL}/api/applications/${applicationId}/resume`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        alert(
          "Your session has expired. Please login again."
        );

        clearSessionAndLogin();
        return;
      }

      if (!response.ok) {
        let message = "Unable to open resume.";

        try {
          const data = await response.json();

          if (data.message) {
            message = data.message;
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const fileUrl =
        window.URL.createObjectURL(blob);

      window.open(
        fileUrl,
        "_blank",
        "noopener,noreferrer"
      );

      setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl);
      }, 60000);
    } catch (err) {
      console.error(
        "View Resume Error:",
        err
      );

      alert(
        err.message ||
          "Unable to open resume."
      );
    } finally {
      setOpeningResumeId(null);
    }
  };

  /* =========================================
     DOWNLOAD RESUME
  ========================================= */

  const handleDownloadResume = async (
    application
  ) => {
    const token = getToken();

    if (!token) {
      clearSessionAndLogin();
      return;
    }

    const applicationId =
      application._id || application.id;

    setDownloadingResumeId(applicationId);

    try {
      const response = await fetch(
        `${API_URL}/api/applications/${applicationId}/resume`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        alert(
          "Your session has expired. Please login again."
        );

        clearSessionAndLogin();
        return;
      }

      if (!response.ok) {
        let message =
          "Unable to download resume.";

        try {
          const data = await response.json();

          if (data.message) {
            message = data.message;
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const fileUrl =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = fileUrl;

      link.download =
        application.resumeFileName ||
        "CareerNest-Resume";

      document.body.appendChild(link);

      link.click();

      link.remove();

      setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl);
      }, 60000);
    } catch (err) {
      console.error(
        "Download Resume Error:",
        err
      );

      alert(
        err.message ||
          "Unable to download resume."
      );
    } finally {
      setDownloadingResumeId(null);
    }
  };

  /* =========================================
     WITHDRAW APPLICATION
  ========================================= */

  const handleWithdraw = async (applicationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to withdraw this application?"
    );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      clearSessionAndLogin();
      return;
    }

    setWithdrawingId(applicationId);

    try {
      const response = await fetch(
        `${API_URL}/api/applications/${applicationId}/withdraw`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.status === 401) {
        alert(
          "Your session has expired. Please login again."
        );

        clearSessionAndLogin();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to withdraw application."
        );
      }

      setApplications((current) =>
        current.map((application) =>
          application._id === applicationId
            ? {
                ...application,
                status: "Withdrawn",
              }
            : application
        )
      );
    } catch (err) {
      console.error(
        "Withdraw Application Error:",
        err
      );

      alert(
        err.message ||
          "Unable to withdraw application. Please try again."
      );
    } finally {
      setWithdrawingId(null);
    }
  };

  /* =========================================
     APPLICATION COUNTS
  ========================================= */

  const counts = {
    All: applications.length,

    Applied: applications.filter(
      (item) => item.status === "Applied"
    ).length,

    "Under Review": applications.filter(
      (item) => item.status === "Under Review"
    ).length,

    Shortlisted: applications.filter(
      (item) => item.status === "Shortlisted"
    ).length,

    Rejected: applications.filter(
      (item) => item.status === "Rejected"
    ).length,

    Withdrawn: applications.filter(
      (item) => item.status === "Withdrawn"
    ).length,
  };

  /* =========================================
     FILTER APPLICATIONS
  ========================================= */

  const filteredApplications =
    filter === "All"
      ? applications
      : applications.filter(
          (application) =>
            application.status === filter
        );

  /* =========================================
     LOADING SCREEN
  ========================================= */

  if (isLoading) {
    return (
      <div className="my-applications-page">
        <div className="applications-loading">
          <div className="loading-spinner"></div>

          <h2>
            Loading Applications...
          </h2>

          <p>
            Please wait while we fetch your applications.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================
     MAIN UI
  ========================================= */

  return (
    <div className="my-applications-page">

      {/* HERO */}

      <section className="applications-hero">

        <div>
          <span className="hero-label">
            CAREERNEST
          </span>

          <h1>
            My Applications
          </h1>

          <p>
            Track all your job applications and
            application status in one place.
          </p>
        </div>

        <Link
          to="/jobs"
          className="browse-jobs-button"
        >
          Browse Jobs
        </Link>

      </section>

      {/* MAIN */}

      <main className="applications-container">

        {/* STATISTICS */}

        <section className="application-stats">

          <div className="stat-card">
            <span className="stat-icon">
              📄
            </span>

            <div>
              <strong>
                {counts.All}
              </strong>

              <span>
                Total Applications
              </span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              ✓
            </span>

            <div>
              <strong>
                {counts.Applied}
              </strong>

              <span>
                Applied
              </span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              ◷
            </span>

            <div>
              <strong>
                {counts["Under Review"]}
              </strong>

              <span>
                Under Review
              </span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              ★
            </span>

            <div>
              <strong>
                {counts.Shortlisted}
              </strong>

              <span>
                Shortlisted
              </span>
            </div>
          </div>

        </section>

        {/* TOOLBAR */}

        <section className="applications-toolbar">

          <div>
            <h2>
              Application History
            </h2>

            <p>
              {applications.length === 0
                ? "You haven't applied to any jobs yet."
                : `${applications.length} application${
                    applications.length === 1
                      ? ""
                      : "s"
                  } found`}
            </p>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={loadApplications}
            disabled={isLoading}
          >
            ↻ Refresh
          </button>

        </section>

        {/* STATUS FILTERS */}

        <div className="status-filters">

          {Object.keys(counts).map(
            (status) => (
              <button
                type="button"
                key={status}
                className={
                  filter === status
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() =>
                  setFilter(status)
                }
              >
                {status}

                <span>
                  {counts[status]}
                </span>
              </button>
            )
          )}

        </div>

        {/* ERROR */}

        {error && (
          <div className="applications-error">

            <strong>
              Something went wrong
            </strong>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={loadApplications}
            >
              Try Again
            </button>

          </div>
        )}

        {/* EMPTY STATE */}

        {!error &&
          filteredApplications.length === 0 && (
            <section className="empty-applications">

              <div className="empty-icon">
                📋
              </div>

              <h2>
                {filter === "All"
                  ? "No Applications Yet"
                  : `No ${filter} Applications`}
              </h2>

              <p>
                {filter === "All"
                  ? "Start applying to jobs and your applications will appear here."
                  : `You don't have any ${filter.toLowerCase()} applications.`}
              </p>

              <Link
                to="/jobs"
                className="empty-browse-button"
              >
                Find Jobs
              </Link>

            </section>
          )}

        {/* APPLICATION LIST */}

        {!error &&
          filteredApplications.length > 0 && (

            <section className="applications-list">

              {filteredApplications.map(
                (application) => {

                  const status =
                    STATUS_CONFIG[
                      application.status
                    ] ||
                    STATUS_CONFIG.Applied;

                  const applicationId =
                    application._id ||
                    application.id;

                  return (
                    <article
                      className="application-card"
                      key={applicationId}
                    >

                      {/* COMPANY AVATAR */}

                      <div className="company-avatar">
                        {getInitials(
                          application.company
                        )}
                      </div>

                      {/* MAIN CONTENT */}

                      <div className="application-main">

                        {/* HEADING */}

                        <div className="application-heading">

                          <div>

                            <h3>
                              {application.jobTitle ||
                                "Job Position"}
                            </h3>

                            <h4>
                              {application.company ||
                                "Company"}
                            </h4>

                          </div>

                          {/* STATUS */}

                          <span
                            className={`application-status ${status.className}`}
                          >
                            <span>
                              {status.icon}
                            </span>

                            {application.status ||
                              "Applied"}
                          </span>

                        </div>

                        {/* META */}

                        <div className="application-meta">

                          <span>
                            📍{" "}
                            {application.location ||
                              "Location not specified"}
                          </span>

                          <span>
                            📅 Applied on{" "}
                            {formatDate(
                              application.createdAt
                            )}
                          </span>

                          {application.applicantEmail && (
                            <span>
                              ✉️{" "}
                              {application.applicantEmail}
                            </span>
                          )}

                        </div>

                        {/* RESUME INFORMATION */}

                        {application.resumeFileName && (
                          <div
                            className="application-meta"
                            style={{
                              marginTop: "8px",
                            }}
                          >
                            <span>
                              📄 Resume:{" "}
                              {application.resumeFileName}
                            </span>
                          </div>
                        )}

                        {/* ACTIONS */}

                        <div className="application-actions">

                          {/* VIEW JOB */}

                          <button
                            type="button"
                            className="view-job-button"
                            onClick={() =>
                              navigate(
                                `/jobs/${application.jobId}`
                              )
                            }
                          >
                            View Job
                          </button>

                          {/* VIEW RESUME */}

                          {application.resumeFilePath && (
                            <button
                              type="button"
                              className="view-job-button"
                              onClick={() =>
                                handleViewResume(
                                  applicationId
                                )
                              }
                              disabled={
                                openingResumeId ===
                                applicationId
                              }
                            >
                              {openingResumeId ===
                              applicationId
                                ? "Opening..."
                                : "View Resume"}
                            </button>
                          )}

                          {/* DOWNLOAD RESUME */}

                          {application.resumeFilePath && (
                            <button
                              type="button"
                              className="view-job-button"
                              onClick={() =>
                                handleDownloadResume(
                                  application
                                )
                              }
                              disabled={
                                downloadingResumeId ===
                                applicationId
                              }
                              style={{
                                background:
                                  "#ffffff",
                                color:
                                  "#2563eb",
                                border:
                                  "1px solid #2563eb",
                              }}
                            >
                              {downloadingResumeId ===
                              applicationId
                                ? "Downloading..."
                                : "⬇ Download Resume"}
                            </button>
                          )}

                          {/* WITHDRAW */}

                          {application.status !==
                            "Rejected" &&
                            application.status !==
                              "Withdrawn" && (

                              <button
                                type="button"
                                className="withdraw-button"
                                onClick={() =>
                                  handleWithdraw(
                                    applicationId
                                  )
                                }
                                disabled={
                                  withdrawingId ===
                                  applicationId
                                }
                              >
                                {withdrawingId ===
                                applicationId
                                  ? "Withdrawing..."
                                  : "Withdraw Application"}
                              </button>
                            )}

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </section>
          )}

      </main>
    </div>
  );
}

export default MyApplications;