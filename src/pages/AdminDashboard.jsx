import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const STATUS_OPTIONS = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Rejected",
  "Withdrawn",
];

const JOB_TYPES = [
  "Full Time",
  "Part Time",
  "Remote",
  "Internship",
];

const EMPTY_STATS = {
  total: 0,
  applied: 0,
  underReview: 0,
  shortlisted: 0,
  rejected: 0,
  withdrawn: 0,
  users: 0,
  jobs: 0,
  activeJobs: 0,
};

const EMPTY_JOB = {
  title: "",
  company: "",
  location: "",
  type: "Full Time",
  salary: "",
  experience: "",
  description: "",
  responsibilities: "",
  requirements: "",
  skills: "",
  whyConsider: "",
  companyInitials: "",
};

function getToken() {
  return (
    localStorage.getItem("careerNestToken") ||
    sessionStorage.getItem("careerNestToken")
  );
}

function clearAuth() {
  localStorage.removeItem("careerNestToken");
  localStorage.removeItem("careerNestUser");
  sessionStorage.removeItem("careerNestToken");
  sessionStorage.removeItem("careerNestUser");
}

function AdminDashboard() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] =
    useState("All");

  const [selectedApplication, setSelectedApplication] =
    useState(null);

  /* =========================================
     JOB MANAGEMENT STATE
  ========================================= */

  const [jobSearch, setJobSearch] = useState("");
  const [jobFilter, setJobFilter] =
    useState("All");

  const [showJobForm, setShowJobForm] =
    useState(false);

  const [editingJob, setEditingJob] =
    useState(null);

  const [jobForm, setJobForm] =
    useState(EMPTY_JOB);

  const [jobSaving, setJobSaving] =
    useState(false);

  const [jobDeletingId, setJobDeletingId] =
    useState("");

  const [jobTogglingId, setJobTogglingId] =
    useState("");

  /* =========================================
     AUTH
  ========================================= */

  const handleUnauthorized = useCallback(() => {
    clearAuth();

    navigate("/login", {
      replace: true,
    });
  }, [navigate]);

  /* =========================================
     LOAD ADMIN DATA
  ========================================= */

  const loadAdminData = useCallback(
    async () => {
      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      setLoading(true);
      setError("");

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const adminResponse = await fetch(
          `${API_URL}/api/admin/me`,
          {
            headers,
          }
        );

        if (adminResponse.status === 401) {
          handleUnauthorized();
          return;
        }

        if (adminResponse.status === 403) {
          setAdmin(null);

          setError(
            "Admin access denied. This account is not configured as admin."
          );

          return;
        }

        const adminData =
          await adminResponse
            .json()
            .catch(() => ({}));

        if (!adminResponse.ok) {
          throw new Error(
            adminData.message ||
              "Unable to verify admin access."
          );
        }

        setAdmin(
          adminData.admin || null
        );

        const [
          statsResponse,
          applicationsResponse,
          jobsResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/api/admin/stats`,
            {
              headers,
            }
          ),

          fetch(
            `${API_URL}/api/admin/applications`,
            {
              headers,
            }
          ),

          fetch(
            `${API_URL}/api/admin/jobs`,
            {
              headers,
            }
          ),
        ]);

        if (
          statsResponse.status === 401 ||
          applicationsResponse.status ===
            401 ||
          jobsResponse.status === 401
        ) {
          handleUnauthorized();
          return;
        }

        const statsData =
          await statsResponse
            .json()
            .catch(() => ({}));

        const applicationsData =
          await applicationsResponse
            .json()
            .catch(() => ({}));

        const jobsData =
          await jobsResponse
            .json()
            .catch(() => ({}));

        if (!statsResponse.ok) {
          throw new Error(
            statsData.message ||
              "Unable to load admin statistics."
          );
        }

        if (!applicationsResponse.ok) {
          throw new Error(
            applicationsData.message ||
              "Unable to load applications."
          );
        }

        if (!jobsResponse.ok) {
          throw new Error(
            jobsData.message ||
              "Unable to load jobs."
          );
        }

        setStats({
          ...EMPTY_STATS,
          ...(statsData.stats || {}),
        });

        setApplications(
          Array.isArray(
            applicationsData.applications
          )
            ? applicationsData.applications
            : []
        );

        setJobs(
          Array.isArray(jobsData.jobs)
            ? jobsData.jobs
            : []
        );
      } catch (err) {
        console.error(
          "Admin Dashboard Error:",
          err
        );

        setError(
          err.message ||
            "Unable to load admin dashboard data."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      handleUnauthorized,
      navigate,
    ]
  );

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  /* =========================================
     APPLICATION STATUS UPDATE
  ========================================= */

  const updateStatus = async (
    applicationId,
    status
  ) => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    const previousApplication =
      applications.find(
        (application) =>
          application._id ===
          applicationId
      );

    if (!previousApplication) {
      return;
    }

    const previousStatus =
      previousApplication.status;

    if (previousStatus === status) {
      return;
    }

    setUpdatingId(applicationId);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/applications/${applicationId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to update application status."
        );
      }

      setApplications(
        (current) =>
          current.map(
            (application) =>
              application._id ===
              applicationId
                ? {
                    ...application,
                    status,
                  }
                : application
          )
      );

      setSelectedApplication(
        (current) =>
          current?._id ===
          applicationId
            ? {
                ...current,
                status,
              }
            : current
      );

      await loadAdminData();
    } catch (err) {
      console.error(
        "Status Update Error:",
        err
      );

      setError(
        err.message ||
          "Unable to update application status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  /* =========================================
     APPLICATION FILTER
  ========================================= */

  const filteredApplications =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      return applications.filter(
        (application) => {
          const applicantName =
            application.applicantName ||
            application.userId?.fullName ||
            "";

          const applicantEmail =
            application.applicantEmail ||
            application.userId?.email ||
            "";

          const matchesSearch =
            !query ||
            applicantName
              .toLowerCase()
              .includes(query) ||
            applicantEmail
              .toLowerCase()
              .includes(query) ||
            (
              application.jobTitle || ""
            )
              .toLowerCase()
              .includes(query) ||
            (
              application.company || ""
            )
              .toLowerCase()
              .includes(query) ||
            (
              application.location || ""
            )
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            filterStatus === "All" ||
            application.status ===
              filterStatus;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      applications,
      search,
      filterStatus,
    ]);

  /* =========================================
     JOB FILTER
  ========================================= */

  const filteredJobs = useMemo(() => {
    const query = jobSearch
      .trim()
      .toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        (job.title || "")
          .toLowerCase()
          .includes(query) ||
        (job.company || "")
          .toLowerCase()
          .includes(query) ||
        (job.location || "")
          .toLowerCase()
          .includes(query) ||
        (job.skills || [])
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        jobFilter === "All" ||
        (jobFilter === "Active" &&
          job.isActive) ||
        (jobFilter === "Inactive" &&
          !job.isActive);

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    jobs,
    jobSearch,
    jobFilter,
  ]);

  /* =========================================
     FORM HELPERS
  ========================================= */

  const arrayToText = (value) => {
    if (!Array.isArray(value)) {
      return "";
    }

    return value.join("\n");
  };

  const textToArray = (value) => {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const openAddJobForm = () => {
    setEditingJob(null);

    setJobForm({
      ...EMPTY_JOB,
    });

    setShowJobForm(true);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openEditJobForm = (job) => {
    setEditingJob(job);

    setJobForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      type:
        job.type || "Full Time",
      salary: job.salary || "",
      experience:
        job.experience || "",
      description:
        job.description || "",
      responsibilities:
        arrayToText(
          job.responsibilities
        ),
      requirements:
        arrayToText(
          job.requirements
        ),
      skills:
        arrayToText(
          job.skills
        ),
      whyConsider:
        arrayToText(
          job.whyConsider
        ),
      companyInitials:
        job.companyInitials || "",
    });

    setShowJobForm(true);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const closeJobForm = () => {
    if (jobSaving) {
      return;
    }

    setShowJobForm(false);
    setEditingJob(null);
    setJobForm({
      ...EMPTY_JOB,
    });
  };

  const handleJobInput = (event) => {
    const {
      name,
      value,
    } = event.target;

    setJobForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* =========================================
     CREATE / UPDATE JOB
  ========================================= */

  const saveJob = async (event) => {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    if (
      !jobForm.title.trim() ||
      !jobForm.company.trim() ||
      !jobForm.location.trim() ||
      !jobForm.salary.trim() ||
      !jobForm.experience.trim() ||
      !jobForm.description.trim()
    ) {
      setError(
        "Please fill in all required job fields."
      );

      return;
    }

    setJobSaving(true);
    setError("");

    try {
      const payload = {
        title:
          jobForm.title.trim(),

        company:
          jobForm.company.trim(),

        location:
          jobForm.location.trim(),

        type:
          jobForm.type,

        salary:
          jobForm.salary.trim(),

        experience:
          jobForm.experience.trim(),

        description:
          jobForm.description.trim(),

        responsibilities:
          textToArray(
            jobForm.responsibilities
          ),

        requirements:
          textToArray(
            jobForm.requirements
          ),

        skills:
          textToArray(
            jobForm.skills
          ),

        whyConsider:
          textToArray(
            jobForm.whyConsider
          ),

        companyInitials:
          jobForm.companyInitials
            .trim(),
      };

      const url = editingJob
        ? `${API_URL}/api/admin/jobs/${editingJob._id}`
        : `${API_URL}/api/admin/jobs`;

      const response =
        await fetch(url, {
          method: editingJob
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(
            payload
          ),
        });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to save job."
        );
      }

      setShowJobForm(false);
      setEditingJob(null);
      setJobForm({
        ...EMPTY_JOB,
      });

      await loadAdminData();
    } catch (err) {
      console.error(
        "Save Job Error:",
        err
      );

      setError(
        err.message ||
          "Unable to save job."
      );
    } finally {
      setJobSaving(false);
    }
  };

  /* =========================================
     DELETE JOB
  ========================================= */

  const deleteJob = async (job) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${job.title}"?`
      );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    setJobDeletingId(
      job._id
    );

    setError("");

    try {
      const response =
        await fetch(
          `${API_URL}/api/admin/jobs/${job._id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to delete job."
        );
      }

      await loadAdminData();
    } catch (err) {
      console.error(
        "Delete Job Error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete job."
      );
    } finally {
      setJobDeletingId("");
    }
  };

  /* =========================================
     TOGGLE JOB
  ========================================= */

  const toggleJob = async (job) => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    setJobTogglingId(
      job._id
    );

    setError("");

    try {
      const response =
        await fetch(
          `${API_URL}/api/admin/jobs/${job._id}/toggle`,
          {
            method: "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to change job status."
        );
      }

      await loadAdminData();
    } catch (err) {
      console.error(
        "Toggle Job Error:",
        err
      );

      setError(
        err.message ||
          "Unable to change job status."
      );
    } finally {
      setJobTogglingId("");
    }
  };

  /* =========================================
     GENERAL HELPERS
  ========================================= */

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusClass = (
    status
  ) => {
    return `admin-status admin-status-${String(
      status || ""
    )
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
  };

  const openApplicationDetails = (
    application
  ) => {
    setSelectedApplication(
      application
    );
  };

  const closeApplicationDetails =
    () => {
      setSelectedApplication(
        null
      );
    };

  const getApplicantName = (
    application
  ) =>
    application?.applicantName ||
    application?.userId
      ?.fullName ||
    "Unknown User";

  const getApplicantEmail = (
    application
  ) =>
    application?.applicantEmail ||
    application?.userId
      ?.email ||
    "No email";

  const getResume = (
    application
  ) =>
    application?.resumeId ||
    null;

  const getUploadedResume = (
    application
  ) =>
    application?.resumeFilePath
      ? {
          fileName:
            application.resumeFileName ||
            "Resume",

          mimeType:
            application.resumeMimeType ||
            "application/octet-stream",

          size:
            application.resumeFileSize ||
            0,
        }
      : null;

  const openResume = async (
    application,
    download = false
  ) => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    if (
      !application?.resumeFilePath
    ) {
      setError(
        "No uploaded resume file is available for this application."
      );

      return;
    }

    try {
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/applications/${application._id}/resume`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (
        response.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          data.message ||
            "Unable to open the uploaded resume."
        );
      }

      const blob =
        await response.blob();

      const fileUrl =
        window.URL.createObjectURL(
          blob
        );

      if (download) {
        const link =
          document.createElement(
            "a"
          );

        link.href = fileUrl;

        link.download =
          application.resumeFileName ||
          "resume";

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();
      } else {
        window.open(
          fileUrl,
          "_blank",
          "noopener,noreferrer"
        );
      }

      window.setTimeout(
        () => {
          window.URL.revokeObjectURL(
            fileUrl
          );
        },
        60000
      );
    } catch (err) {
      console.error(
        "Resume Open Error:",
        err
      );

      setError(
        err.message ||
          "Unable to open the uploaded resume."
      );
    }
  };

  const formatFileSize = (
    bytes
  ) => {
    if (!bytes) {
      return "—";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (
      bytes <
      1024 * 1024
    ) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  };

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner" />

          <h2>
            Loading Admin Dashboard...
          </h2>

          <p>
            Please wait.
          </p>
        </div>
      </main>
    );
  }

  /* =========================================
     ADMIN ERROR
  ========================================= */

  if (error && !admin) {
    return (
      <main className="admin-page">
        <div className="admin-access-card">
          <div className="admin-lock">
            🔐
          </div>

          <h1>
            Admin Access Required
          </h1>

          <p>
            {error}
          </p>

          <div className="admin-access-actions">
            <button
              type="button"
              onClick={
                loadAdminData
              }
            >
              Try Again
            </button>

            <button
              type="button"
              className="secondary-admin-btn"
              onClick={() =>
                navigate("/")
              }
            >
              Go Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-container">

        {/* =====================================
            HEADER
        ====================================== */}

        <section className="admin-header">
          <div>
            <span className="admin-eyebrow">
              CAREERNEST ADMIN
            </span>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Manage jobs, applications
              and platform activity
              from one place.
            </p>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">
              {admin?.fullName
                ?.charAt(0)
                ?.toUpperCase() ||
                "A"}
            </div>

            <div>
              <strong>
                {admin?.fullName ||
                  "Admin"}
              </strong>

              <span>
                {admin?.email || ""}
              </span>
            </div>
          </div>
        </section>

        {/* =====================================
            ERROR
        ====================================== */}

        {error && (
          <div className="admin-error">
            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={
                loadAdminData
              }
            >
              Retry
            </button>
          </div>
        )}

        {/* =====================================
            STATISTICS
        ====================================== */}

        <section className="admin-stats-grid">

          <div className="admin-stat-card">
            <span className="admin-stat-icon">
              📋
            </span>

            <div>
              <p>
                Total Applications
              </p>

              <h2>
                {stats.total}
              </h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-icon">
              👥
            </span>

            <div>
              <p>
                Total Users
              </p>

              <h2>
                {stats.users}
              </h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-icon">
              💼
            </span>

            <div>
              <p>
                Total Jobs
              </p>

              <h2>
                {stats.jobs ??
                  jobs.length}
              </h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-icon">
              🟢
            </span>

            <div>
              <p>
                Active Jobs
              </p>

              <h2>
                {stats.activeJobs ??
                  jobs.filter(
                    (job) =>
                      job.isActive
                  ).length}
              </h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-icon">
              🟡
            </span>

            <div>
              <p>
                Under Review
              </p>

              <h2>
                {stats.underReview}
              </h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-icon">
              🟢
            </span>

            <div>
              <p>
                Shortlisted
              </p>

              <h2>
                {stats.shortlisted}
              </h2>
            </div>
          </div>

        </section>

        {/* =====================================
            JOB MANAGEMENT
        ====================================== */}

        <section className="admin-applications-card">

          <div className="admin-table-header">
            <div>
              <h2>
                💼 Job Management
              </h2>

              <p>
                Create and manage
                CareerNest job listings.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="admin-refresh-btn"
                onClick={
                  loadAdminData
                }
              >
                ↻ Refresh
              </button>

              <button
                type="button"
                onClick={
                  openAddJobForm
                }
                style={{
                  border: "none",
                  borderRadius:
                    "10px",
                  padding:
                    "10px 16px",
                  background:
                    "#2563eb",
                  color:
                    "#ffffff",
                  fontWeight:
                    "700",
                  cursor:
                    "pointer",
                }}
              >
                + Add Job
              </button>
            </div>
          </div>

          {/* =================================
              JOB FORM
          ================================== */}

          {showJobForm && (
            <form
              onSubmit={
                saveJob
              }
              style={{
                margin:
                  "0 0 24px",
                padding:
                  "22px",
                border:
                  "1px solid #dbeafe",
                borderRadius:
                  "16px",
                background:
                  "#f8fbff",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap: "15px",
                  marginBottom:
                    "18px",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin:
                        "0 0 5px",
                      color:
                        "#111827",
                    }}
                  >
                    {editingJob
                      ? "✏️ Edit Job"
                      : "➕ Add New Job"}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color:
                        "#64748b",
                      fontSize:
                        "13px",
                    }}
                  >
                    Fill in the job
                    details below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeJobForm
                  }
                  style={{
                    border:
                      "1px solid #cbd5e1",
                    borderRadius:
                      "8px",
                    padding:
                      "8px 12px",
                    background:
                      "#ffffff",
                    cursor:
                      "pointer",
                  }}
                >
                  ✕ Close
                </button>
              </div>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "14px",
                }}
              >

                {/* TITLE */}

                <div>
                  <label>
                    Job Title *
                  </label>

                  <input
                    name="title"
                    value={
                      jobForm.title
                    }
                    onChange={
                      handleJobInput
                    }
                    placeholder="e.g. React Developer"
                    required
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "6px",
                      padding:
                        "11px 12px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius:
                        "9px",
                      boxSizing:
                        "border-box",
                    }}
                  />
                </div>

                {/* COMPANY */}

                <div>
                  <label>
                    Company *
                  </label>

                  <input
                    name="company"
                    value={
                      jobForm.company
                    }
                    onChange={
                      handleJobInput
                    }
                    placeholder="e.g. TechNova Solutions"
                    required
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "6px",
                      padding:
                        "11px 12px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius:
                        "9px",
                      boxSizing:
                        "border-box",
                    }}
                  />
                </div>

                {/* LOCATION */}

                <div>
                  <label>
                    Location *
                  </label>

                  <input
                    name="location"
                    value={
                      jobForm.location
                    }
                    onChange={
                      handleJobInput
                    }
                    placeholder="e.g. Pune"
                    required
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "6px",
                      padding:
                        "11px 12px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius:
                        "9px",
                      boxSizing:
                        "border-box",
                    }}
                  />
                </div>

                {/* TYPE */}

                <div>
                  <label>
                    Job Type *
                  </label>

                  <select
                    name="type"
                    value={
                      jobForm.type
                    }
                    onChange={
                      handleJobInput
                    }
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "6px",
                      padding:
                        "11px 12px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius:
                        "9px",
                      boxSizing:
                        "border-box",
                      background:
                        "#ffffff",
                    }}
                  >
                    {JOB_TYPES.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* SALARY */}

                <div>
                  <label>
                    Salary *
                  </label>

                  <input
                    name="salary"
                    value={
                      jobForm.salary
                    }
                    onChange={
                      handleJobInput
                    }
                    placeholder="e.g. ₹5-9 LPA"
                    required
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "6px",
                      padding:
                        "11px 12px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius:
                        "9px",
                      boxSizing:
                        "border-box",
                    }}
                  />
                </div>

                {/* EXPERIENCE */}

                <div>
                  <label>
                    Experience *
                  </label>

                  <input
                    name="experience"
                    value={
                      jobForm.experience
                    }
                    onChange={
                      handleJobInput
                    }
                    placeholder="e.g. 0-2 Years"
                    required
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "6px",
                      padding:
                        "11px 12px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius:
                        "9px",
                      boxSizing:
                        "border-box",
                    }}
                  />
                </div>

                {/* INITIALS */}

                <div>
                  <label>
                    Company Initials
                  </label>

                  <input
                    name="companyInitials"
                    value={
                      jobForm.companyInitials
                    }
                    onChange={
                      handleJobInput
                    }
                    placeholder="e.g. TN"
                    maxLength={
                      5
                    }
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "6px",
                      padding:
                        "11px 12px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius:
                        "9px",
                      boxSizing:
                        "border-box",
                    }}
                  />
                </div>

                {/* DESCRIPTION */}

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <label>
                    Description *
                  </label>

                  <textarea
                    name="description"
                    value={
                      jobForm.description
                    }
                    onChange={
                      handleJobInput
                    }
                    placeholder="Write a detailed job description..."
                    required
                    rows="5"
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "6px",
                      padding:
                        "11px 12px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius:
                        "9px",
                      resize:
                        "vertical",
                      boxSizing:
                        "border-box",
                    }}
                  />
                </div>

                {/* RESPONSIBILITIES */}

                <div>
                  <label>
                    Responsibilities
                  </label>

                  <textarea
                    name="responsibilities"
                    value={
                      jobForm.responsibilities
                    }
                    onChange={
                      handleJobInput
                    }
                    placeholder={
                      "One responsibility per line"
                    }
                    rows="6"
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "6px",
                      padding:
                        "11px 12px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius:
                        "9px",
                      resize:
                        "vertical",
                      boxSizing:
                        "border-box",
                    }}
                  />

                  <small
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    One item per line
                  </small>
                </div>

                {/* REQUIREMENTS */}

                <div>
                  <label>
                    Requirements
                  </label>

                  <textarea
                    name="requirements"
                    value={
                      jobForm.requirements
                    }
                    onChange={
                      handleJobInput
                    }
                    placeholder={
                      "One requirement per line"
                    }
                    rows="6"
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "6px",
                      padding:
                        "11px 12px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius:
                        "9px",
                      resize:
                        "vertical",
                      boxSizing:
                        "border-box",
                    }}
                  />

                  <small
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    One item per line
                  </small>
                </div>

                {/* SKILLS */}

                <div>
                  <label>
                    Skills
                  </label>

                  <textarea
                    name="skills"
                    value={
                      jobForm.skills
                    }
                    onChange={
                      handleJobInput
                    }
                    placeholder={
                      "React\nJavaScript\nNode.js"
                    }
                    rows="6"
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "6px",
                      padding:
                        "11px 12px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius:
                        "9px",
                      resize:
                        "vertical",
                      boxSizing:
                        "border-box",
                    }}
                  />

                  <small
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    One skill per line
                  </small>
                </div>

                {/* WHY CONSIDER */}

                <div>
                  <label>
                    Why Consider This Job
                  </label>

                  <textarea
                    name="whyConsider"
                    value={
                      jobForm.whyConsider
                    }
                    onChange={
                      handleJobInput
                    }
                    placeholder={
                      "One point per line"
                    }
                    rows="6"
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "6px",
                      padding:
                        "11px 12px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius:
                        "9px",
                      resize:
                        "vertical",
                      boxSizing:
                        "border-box",
                    }}
                  />

                  <small
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    One item per line
                  </small>
                </div>
              </div>

              {/* FORM BUTTONS */}

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                  marginTop:
                    "18px",
                  flexWrap:
                    "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={
                    closeJobForm
                  }
                  disabled={
                    jobSaving
                  }
                  style={{
                    border:
                      "1px solid #cbd5e1",
                    borderRadius:
                      "9px",
                    padding:
                      "11px 18px",
                    background:
                      "#ffffff",
                    cursor:
                      "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    jobSaving
                  }
                  style={{
                    border:
                      "none",
                    borderRadius:
                      "9px",
                    padding:
                      "11px 20px",
                    background:
                      "#2563eb",
                    color:
                      "#ffffff",
                    fontWeight:
                      "700",
                    cursor:
                      jobSaving
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {jobSaving
                    ? "Saving..."
                    : editingJob
                    ? "Update Job"
                    : "Create Job"}
                </button>
              </div>
            </form>
          )}

          {/* =================================
              JOB SEARCH / FILTER
          ================================== */}

          <div className="admin-filters">

            <input
              type="search"
              placeholder="Search job, company, location or skill..."
              value={
                jobSearch
              }
              onChange={(
                event
              ) =>
                setJobSearch(
                  event.target
                    .value
                )
              }
            />

            <select
              value={
                jobFilter
              }
              onChange={(
                event
              ) =>
                setJobFilter(
                  event.target
                    .value
                )
              }
            >
              <option value="All">
                All Jobs
              </option>

              <option value="Active">
                Active Jobs
              </option>

              <option value="Inactive">
                Inactive Jobs
              </option>
            </select>
          </div>

          {/* =================================
              JOB LIST
          ================================== */}

          {filteredJobs.length ===
          0 ? (
            <div className="admin-empty">
              <div>
                💼
              </div>

              <h3>
                No jobs found
              </h3>

              <p>
                Click "Add Job" to
                create your first
                CareerNest job.
              </p>
            </div>
          ) : (
            <div
              style={{
                display:
                  "grid",
                gap: "14px",
              }}
            >
              {filteredJobs.map(
                (job) => (
                  <div
                    key={
                      job._id
                    }
                    style={{
                      border:
                        "1px solid #e5e7eb",
                      borderRadius:
                        "14px",
                      padding:
                        "18px",
                      background:
                        "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "15px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "10px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <h3
                            style={{
                              margin:
                                0,
                              color:
                                "#111827",
                            }}
                          >
                            {
                              job.title
                            }
                          </h3>

                          <span
                            style={{
                              padding:
                                "5px 9px",
                              borderRadius:
                                "999px",
                              fontSize:
                                "11px",
                              fontWeight:
                                "700",
                              background:
                                job.isActive
                                  ? "#dcfce7"
                                  : "#fee2e2",
                              color:
                                job.isActive
                                  ? "#166534"
                                  : "#991b1b",
                            }}
                          >
                            {job.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>

                        <p
                          style={{
                            margin:
                              "7px 0 0",
                            color:
                              "#475569",
                            fontWeight:
                              "600",
                          }}
                        >
                          {job.company}
                        </p>

                        <p
                          style={{
                            margin:
                              "5px 0 0",
                            color:
                              "#64748b",
                            fontSize:
                              "13px",
                          }}
                        >
                          📍{" "}
                          {
                            job.location
                          }
                          {" • "}
                          {
                            job.type
                          }
                          {" • "}
                          {
                            job.salary
                          }
                          {" • "}
                          {
                            job.experience
                          }
                        </p>
                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          gap: "8px",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            openEditJobForm(
                              job
                            )
                          }
                          style={{
                            border:
                              "1px solid #2563eb",
                            borderRadius:
                              "8px",
                            padding:
                              "9px 12px",
                            background:
                              "#ffffff",
                            color:
                              "#2563eb",
                            fontWeight:
                              "700",
                            cursor:
                              "pointer",
                          }}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleJob(
                              job
                            )
                          }
                          disabled={
                            jobTogglingId ===
                            job._id
                          }
                          style={{
                            border:
                              "1px solid #64748b",
                            borderRadius:
                              "8px",
                            padding:
                              "9px 12px",
                            background:
                              "#ffffff",
                            color:
                              "#334155",
                            fontWeight:
                              "700",
                            cursor:
                              "pointer",
                          }}
                        >
                          {jobTogglingId ===
                          job._id
                            ? "Saving..."
                            : job.isActive
                            ? "⏸ Deactivate"
                            : "▶ Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteJob(
                              job
                            )
                          }
                          disabled={
                            jobDeletingId ===
                            job._id
                          }
                          style={{
                            border:
                              "none",
                            borderRadius:
                              "8px",
                            padding:
                              "9px 12px",
                            background:
                              "#dc2626",
                            color:
                              "#ffffff",
                            fontWeight:
                              "700",
                            cursor:
                              "pointer",
                          }}
                        >
                          {jobDeletingId ===
                          job._id
                            ? "Deleting..."
                            : "🗑 Delete"}
                        </button>
                      </div>
                    </div>

                    {Array.isArray(
                      job.skills
                    ) &&
                      job.skills
                        .length >
                        0 && (
                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "7px",
                            flexWrap:
                              "wrap",
                            marginTop:
                              "13px",
                          }}
                        >
                          {job.skills.map(
                            (
                              skill,
                              index
                            ) => (
                              <span
                                key={`${skill}-${index}`}
                                style={{
                                  padding:
                                    "5px 9px",
                                  borderRadius:
                                    "7px",
                                  background:
                                    "#eff6ff",
                                  color:
                                    "#1d4ed8",
                                  fontSize:
                                    "11px",
                                  fontWeight:
                                    "600",
                                }}
                              >
                                {
                                  skill
                                }
                              </span>
                            )
                          )}
                        </div>
                      )}

                    <p
                      style={{
                        margin:
                          "12px 0 0",
                        color:
                          "#64748b",
                        fontSize:
                          "12px",
                      }}
                    >
                      Created:{" "}
                      {formatDate(
                        job.createdAt
                      )}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* =====================================
            APPLICATIONS
        ====================================== */}

        <section className="admin-applications-card">

          <div className="admin-table-header">
            <div>
              <h2>
                All Applications
              </h2>

              <p>
                {
                  filteredApplications.length
                }{" "}
                application(s)
                shown
              </p>
            </div>

            <button
              type="button"
              className="admin-refresh-btn"
              onClick={
                loadAdminData
              }
            >
              ↻ Refresh
            </button>
          </div>

          {/* SEARCH + FILTER */}

          <div className="admin-filters">

            <input
              type="search"
              placeholder="Search applicant, email, company or job..."
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
            />

            <select
              value={
                filterStatus
              }
              onChange={(
                event
              ) =>
                setFilterStatus(
                  event.target
                    .value
                )
              }
            >
              <option value="All">
                All Statuses
              </option>

              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={
                      status
                    }
                    value={
                      status
                    }
                  >
                    {
                      status
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* APPLICATION TABLE */}

          {filteredApplications.length ===
          0 ? (
            <div className="admin-empty">
              <div>
                📭
              </div>

              <h3>
                No applications
                found
              </h3>

              <p>
                Applications will
                appear here when
                users apply for
                jobs.
              </p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>
                      Applicant
                    </th>

                    <th>
                      Job
                    </th>

                    <th>
                      Company
                    </th>

                    <th>
                      Applied On
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map(
                    (
                      application
                    ) => (
                      <tr
                        key={
                          application._id
                        }
                      >
                        <td>
                          <div className="applicant-cell">
                            <div className="applicant-avatar">
                              {getApplicantName(
                                application
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {getApplicantName(
                                  application
                                )}
                              </strong>

                              <span>
                                {getApplicantEmail(
                                  application
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <strong>
                            {application.jobTitle ||
                              "—"}
                          </strong>
                        </td>

                        <td>
                          {application.company ||
                            "—"}
                        </td>

                        <td>
                          {formatDate(
                            application.createdAt
                          )}
                        </td>

                        <td>
                          <div className="status-cell">
                            <span
                              className={getStatusClass(
                                application.status
                              )}
                            >
                              {application.status ||
                                "Applied"}
                            </span>

                            <select
                              value={
                                application.status ||
                                "Applied"
                              }
                              disabled={
                                updatingId ===
                                application._id
                              }
                              onChange={(
                                event
                              ) =>
                                updateStatus(
                                  application._id,
                                  event.target
                                    .value
                                )
                              }
                            >
                              {STATUS_OPTIONS.map(
                                (
                                  status
                                ) => (
                                  <option
                                    key={
                                      status
                                    }
                                    value={
                                      status
                                    }
                                  >
                                    {
                                      status
                                    }
                                  </option>
                                )
                              )}
                            </select>

                            {updatingId ===
                              application._id && (
                              <small>
                                Saving...
                              </small>
                            )}
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              openApplicationDetails(
                                application
                              )
                            }
                            style={{
                              border:
                                "none",
                              borderRadius:
                                "9px",
                              padding:
                                "9px 13px",
                              background:
                                "#2563eb",
                              color:
                                "#ffffff",
                              fontWeight:
                                "700",
                              fontSize:
                                "12px",
                              cursor:
                                "pointer",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* =====================================
          APPLICANT DETAILS MODAL
      ====================================== */}

      {selectedApplication && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Applicant Details"
          onClick={
            closeApplicationDetails
          }
          style={{
            position:
              "fixed",
            inset: 0,
            zIndex: 9999,
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "20px",
            background:
              "rgba(15, 23, 42, 0.58)",
          }}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width:
                "min(760px, 100%)",
              maxHeight:
                "calc(100vh - 40px)",
              overflowY:
                "auto",
              background:
                "#ffffff",
              borderRadius:
                "20px",
              boxShadow:
                "0 25px 70px rgba(15, 23, 42, 0.25)",
            }}
          >
            {/* MODAL HEADER */}

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "flex-start",
                justifyContent:
                  "space-between",
                gap:
                  "20px",
                padding:
                  "24px 26px",
                borderBottom:
                  "1px solid #e5e7eb",
              }}
            >
              <div>
                <span
                  style={{
                    color:
                      "#2563eb",
                    fontSize:
                      "11px",
                    fontWeight:
                      "800",
                    letterSpacing:
                      "1.2px",
                  }}
                >
                  APPLICANT DETAILS
                </span>

                <h2
                  style={{
                    margin:
                      "6px 0 4px",
                    color:
                      "#111827",
                    fontSize:
                      "24px",
                  }}
                >
                  {getApplicantName(
                    selectedApplication
                  )}
                </h2>

                <p
                  style={{
                    margin: 0,
                    color:
                      "#64748b",
                    fontSize:
                      "13px",
                  }}
                >
                  {selectedApplication.jobTitle ||
                    "Job Application"}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeApplicationDetails
                }
                aria-label="Close"
                style={{
                  width:
                    "36px",
                  height:
                    "36px",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "50%",
                  background:
                    "#f8fafc",
                  color:
                    "#334155",
                  fontSize:
                    "20px",
                  cursor:
                    "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}

            <div
              style={{
                padding:
                  "24px 26px",
              }}
            >
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap:
                    "14px",
                }}
              >
                <div
                  style={{
                    padding:
                      "15px",
                    background:
                      "#f8fafc",
                    borderRadius:
                      "12px",
                  }}
                >
                  <small
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    Full Name
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                      color:
                        "#1e293b",
                    }}
                  >
                    {getApplicantName(
                      selectedApplication
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    padding:
                      "15px",
                    background:
                      "#f8fafc",
                    borderRadius:
                      "12px",
                  }}
                >
                  <small
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    Email
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                      color:
                        "#1e293b",
                      wordBreak:
                        "break-word",
                    }}
                  >
                    {getApplicantEmail(
                      selectedApplication
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    padding:
                      "15px",
                    background:
                      "#f8fafc",
                    borderRadius:
                      "12px",
                  }}
                >
                  <small
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    Phone
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                      color:
                        "#1e293b",
                    }}
                  >
                    {selectedApplication.phone ||
                      "Not provided"}
                  </strong>
                </div>

                <div
                  style={{
                    padding:
                      "15px",
                    background:
                      "#f8fafc",
                    borderRadius:
                      "12px",
                  }}
                >
                  <small
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    Location
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                      color:
                        "#1e293b",
                    }}
                  >
                    {selectedApplication.location ||
                      "Not provided"}
                  </strong>
                </div>

                <div
                  style={{
                    padding:
                      "15px",
                    background:
                      "#f8fafc",
                    borderRadius:
                      "12px",
                  }}
                >
                  <small
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    Job
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                      color:
                        "#1e293b",
                    }}
                  >
                    {selectedApplication.jobTitle ||
                      "—"}
                  </strong>
                </div>

                <div
                  style={{
                    padding:
                      "15px",
                    background:
                      "#f8fafc",
                    borderRadius:
                      "12px",
                  }}
                >
                  <small
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    Company
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                      color:
                        "#1e293b",
                    }}
                  >
                    {selectedApplication.company ||
                      "—"}
                  </strong>
                </div>

                <div
                  style={{
                    padding:
                      "15px",
                    background:
                      "#f8fafc",
                    borderRadius:
                      "12px",
                  }}
                >
                  <small
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    Applied On
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                      color:
                        "#1e293b",
                    }}
                  >
                    {formatDateTime(
                      selectedApplication.createdAt
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    padding:
                      "15px",
                    background:
                      "#f8fafc",
                    borderRadius:
                      "12px",
                  }}
                >
                  <small
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    Current Status
                  </small>

                  <div
                    style={{
                      marginTop:
                        "7px",
                    }}
                  >
                    <span
                      className={getStatusClass(
                        selectedApplication.status
                      )}
                    >
                      {selectedApplication.status ||
                        "Applied"}
                    </span>
                  </div>
                </div>
              </div>

              {/* RESUME */}

              <div
                style={{
                  marginTop:
                    "18px",
                  padding:
                    "18px",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius:
                    "14px",
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 10px",
                    color:
                      "#111827",
                    fontSize:
                      "16px",
                  }}
                >
                  📄 Resume
                </h3>

                {getUploadedResume(
                  selectedApplication
                ) ? (
                  <div
                    style={{
                      color:
                        "#475569",
                      fontSize:
                        "13px",
                      lineHeight:
                        "1.7",
                    }}
                  >
                    <div>
                      <strong>
                        File:
                      </strong>{" "}
                      {
                        getUploadedResume(
                          selectedApplication
                        )
                          ?.fileName
                      }
                    </div>

                    <div>
                      <strong>
                        Type:
                      </strong>{" "}
                      {
                        selectedApplication.resumeMimeType ||
                        "Resume file"
                      }
                    </div>

                    <div>
                      <strong>
                        Size:
                      </strong>{" "}
                      {formatFileSize(
                        selectedApplication.resumeFileSize
                      )}
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        flexWrap:
                          "wrap",
                        gap:
                          "10px",
                        marginTop:
                          "14px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          openResume(
                            selectedApplication,
                            false
                          )
                        }
                        style={{
                          border:
                            "none",
                          borderRadius:
                            "9px",
                          padding:
                            "10px 15px",
                          background:
                            "#2563eb",
                          color:
                            "#ffffff",
                          fontWeight:
                            "700",
                          fontSize:
                            "12px",
                          cursor:
                            "pointer",
                        }}
                      >
                        👁 View Resume
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openResume(
                            selectedApplication,
                            true
                          )
                        }
                        style={{
                          border:
                            "1px solid #2563eb",
                          borderRadius:
                            "9px",
                          padding:
                            "10px 15px",
                          background:
                            "#ffffff",
                          color:
                            "#2563eb",
                          fontWeight:
                            "700",
                          fontSize:
                            "12px",
                          cursor:
                            "pointer",
                        }}
                      >
                        ⬇ Download Resume
                      </button>
                    </div>

                    {getResume(
                      selectedApplication
                    ) && (
                      <p
                        style={{
                          margin:
                            "12px 0 0",
                          color:
                            "#64748b",
                          fontSize:
                            "12px",
                        }}
                      >
                        CareerNest Resume ID:{" "}
                        {
                          getResume(
                            selectedApplication
                          )?._id
                        }
                      </p>
                    )}
                  </div>
                ) : getResume(
                    selectedApplication
                  ) ? (
                  <div
                    style={{
                      color:
                        "#475569",
                      fontSize:
                        "13px",
                      lineHeight:
                        "1.7",
                    }}
                  >
                    <div>
                      <strong>
                        Resume ID:
                      </strong>{" "}
                      {
                        getResume(
                          selectedApplication
                        )?._id
                      }
                    </div>

                    {getResume(
                      selectedApplication
                    )?.fullName && (
                      <div>
                        <strong>
                          Name:
                        </strong>{" "}
                        {
                          getResume(
                            selectedApplication
                          ).fullName
                        }
                      </div>
                    )}

                    {getResume(
                      selectedApplication
                    )?.jobTitle && (
                      <div>
                        <strong>
                          Resume Title:
                        </strong>{" "}
                        {
                          getResume(
                            selectedApplication
                          ).jobTitle
                        }
                      </div>
                    )}

                    <p
                      style={{
                        margin:
                          "10px 0 0",
                        color:
                          "#64748b",
                        fontSize:
                          "12px",
                      }}
                    >
                      This application has a saved CareerNest resume, but no uploaded PDF/DOC/DOCX file.
                    </p>
                  </div>
                ) : (
                  <p
                    style={{
                      margin: 0,
                      color:
                        "#64748b",
                      fontSize:
                        "13px",
                    }}
                  >
                    No resume is linked to
                    this application.
                  </p>
                )}
              </div>

              {/* COVER LETTER */}

              <div
                style={{
                  marginTop:
                    "18px",
                  padding:
                    "18px",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius:
                    "14px",
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 10px",
                    color:
                      "#111827",
                    fontSize:
                      "16px",
                  }}
                >
                  📝 Cover Letter
                </h3>

                <div
                  style={{
                    padding:
                      "14px",
                    minHeight:
                      "80px",
                    background:
                      "#f8fafc",
                    borderRadius:
                      "10px",
                    color:
                      "#475569",
                    fontSize:
                      "13px",
                    lineHeight:
                      "1.7",
                    whiteSpace:
                      "pre-wrap",
                  }}
                >
                  {selectedApplication.coverLetter ||
                    "No cover letter provided."}
                </div>
              </div>

              {/* STATUS UPDATE */}

              <div
                style={{
                  marginTop:
                    "18px",
                  padding:
                    "18px",
                  background:
                    "#eff6ff",
                  borderRadius:
                    "14px",
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 10px",
                    color:
                      "#1e3a8a",
                    fontSize:
                      "16px",
                  }}
                >
                  🔄 Update Application
                  Status
                </h3>

                <select
                  value={
                    selectedApplication.status ||
                    "Applied"
                  }
                  disabled={
                    updatingId ===
                    selectedApplication._id
                  }
                  onChange={(
                    event
                  ) =>
                    updateStatus(
                      selectedApplication._id,
                      event.target
                        .value
                    )
                  }
                  style={{
                    width:
                      "100%",
                    height:
                      "42px",
                    padding:
                      "0 12px",
                    border:
                      "1px solid #bfdbfe",
                    borderRadius:
                      "10px",
                    background:
                      "#ffffff",
                    color:
                      "#1e293b",
                    fontSize:
                      "13px",
                  }}
                >
                  {STATUS_OPTIONS.map(
                    (status) => (
                      <option
                        key={
                          status
                        }
                        value={
                          status
                        }
                      >
                        {
                          status
                        }
                      </option>
                    )
                  )}
                </select>

                {updatingId ===
                  selectedApplication._id && (
                  <small
                    style={{
                      display:
                        "block",
                      marginTop:
                        "7px",
                      color:
                        "#64748b",
                    }}
                  >
                    Saving...
                  </small>
                )}
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                padding:
                  "16px 26px",
                borderTop:
                  "1px solid #e5e7eb",
              }}
            >
              <button
                type="button"
                onClick={
                  closeApplicationDetails
                }
                style={{
                  border:
                    "none",
                  borderRadius:
                    "10px",
                  padding:
                    "10px 18px",
                  background:
                    "#2563eb",
                  color:
                    "#ffffff",
                  fontWeight:
                    "700",
                  cursor:
                    "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;