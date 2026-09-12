import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ApplyJob.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

function getJobId(job) {
  return job?._id || job?.id;
}

function getJobLogo(job) {
  return (
    job?.companyInitials ||
    job?.logo ||
    job?.company
      ?.slice(0, 2)
      .toUpperCase() ||
    "CN"
  );
}

function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [jobError, setJobError] =
    useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    resume: null,
    coverLetter: "",
  });

  const [errors, setErrors] =
    useState({});

  const [submitted, setSubmitted] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /* =========================================
     LOAD JOB FROM MONGODB
  ========================================== */

  useEffect(() => {
    const loadJob = async () => {
      setIsLoading(true);
      setJobError("");
      setJob(null);

      try {
        const response = await fetch(
          `${API_URL}/api/jobs`
        );

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
              "Unable to load job."
          );
        }

        const allJobs =
          Array.isArray(data.jobs)
            ? data.jobs
            : [];

        const foundJob =
          allJobs.find(
            (item) =>
              String(item._id) ===
                String(id) ||
              String(item.id) ===
                String(id)
          );

        if (!foundJob) {
          setJob(null);
          return;
        }

        setJob(foundJob);
      } catch (error) {
        console.error(
          "Apply Job Loading Error:",
          error
        );

        setJobError(
          error.message ||
            "Unable to load job details."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [id]);

  /* =========================================
     HANDLE INPUT
  ========================================== */

  const handleChange = (e) => {
    const {
      name,
      value,
      files,
    } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: files
        ? files[0]
        : value,
    }));

    if (errors[name]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [name]: "",
      }));
    }
  };

  /* =========================================
     VALIDATION
  ========================================== */

  const validateForm = () => {
    const newErrors = {};

    /* NAME */

    if (!formData.name.trim()) {
      newErrors.name =
        "Please enter your full name.";
    } else if (
      formData.name.trim().length < 3
    ) {
      newErrors.name =
        "Name must contain at least 3 characters.";
    }

    /* EMAIL */

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email =
        "Please enter your email address.";
    } else if (
      !emailPattern.test(
        formData.email.trim()
      )
    ) {
      newErrors.email =
        "Please enter a valid email address.";
    }

    /* PHONE */

    const phonePattern =
      /^[6-9]\d{9}$/;

    const cleanPhone =
      formData.phone.replace(
        /\D/g,
        ""
      );

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Please enter your phone number.";
    } else if (
      !phonePattern.test(cleanPhone)
    ) {
      newErrors.phone =
        "Enter a valid 10-digit Indian mobile number.";
    }

    /* RESUME */

    if (!formData.resume) {
      newErrors.resume =
        "Please upload your resume.";
    } else {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      const maxSize =
        5 * 1024 * 1024;

      if (
        !allowedTypes.includes(
          formData.resume.type
        )
      ) {
        newErrors.resume =
          "Only PDF, DOC and DOCX files are allowed.";
      } else if (
        formData.resume.size > maxSize
      ) {
        newErrors.resume =
          "Resume size must be less than 5 MB.";
      }
    }

    /* COVER LETTER */

    if (
      !formData.coverLetter.trim()
    ) {
      newErrors.coverLetter =
        "Please write a short cover letter.";
    } else if (
      formData.coverLetter.trim()
        .length < 50
    ) {
      newErrors.coverLetter =
        "Cover letter should contain at least 50 characters.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  /* =========================================
     SUBMIT APPLICATION
  ========================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid =
      validateForm();

    if (!isValid) {
      return;
    }

    if (!job) {
      alert(
        "Job not found."
      );
      return;
    }

    const token =
      localStorage.getItem(
        "careerNestToken"
      ) ||
      sessionStorage.getItem(
        "careerNestToken"
      );

    if (!token) {
      alert(
        "Please login to apply for a job."
      );

      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      /* =====================================
         GET SAVED RESUME FROM DATABASE
      ====================================== */

      let resumeId = null;

      try {
        const resumeResponse =
          await fetch(
            `${API_URL}/api/resume`,
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (
          resumeResponse.status ===
          401
        ) {
          localStorage.removeItem(
            "careerNestToken"
          );

          localStorage.removeItem(
            "careerNestUser"
          );

          sessionStorage.removeItem(
            "careerNestToken"
          );

          sessionStorage.removeItem(
            "careerNestUser"
          );

          alert(
            "Your session has expired. Please login again."
          );

          navigate("/login");
          return;
        }

        if (
          resumeResponse.ok
        ) {
          const resumeData =
            await resumeResponse.json();

          if (
            resumeData.success &&
            resumeData.resume
          ) {
            resumeId =
              resumeData.resume._id ||
              resumeData.resume.id ||
              null;
          }
        }
      } catch (resumeError) {
        console.warn(
          "Resume lookup failed:",
          resumeError
        );
      }

      /* =====================================
         CREATE MULTIPART FORM DATA
      ====================================== */

      const applicationFormData =
        new FormData();

      /*
        IMPORTANT:
        MongoDB _id is used here.
      */

      applicationFormData.append(
        "jobId",
        String(
          getJobId(job)
        )
      );

      applicationFormData.append(
        "jobTitle",
        job.title || ""
      );

      applicationFormData.append(
        "company",
        job.company || ""
      );

      applicationFormData.append(
        "location",
        job.location || ""
      );

      applicationFormData.append(
        "applicantName",
        formData.name.trim()
      );

      applicationFormData.append(
        "applicantEmail",
        formData.email
          .trim()
          .toLowerCase()
      );

      applicationFormData.append(
        "phone",
        formData.phone.replace(
          /\D/g,
          ""
        )
      );

      if (resumeId) {
        applicationFormData.append(
          "resumeId",
          resumeId
        );
      }

      applicationFormData.append(
        "coverLetter",
        formData.coverLetter.trim()
      );

      /* =====================================
         ACTUAL RESUME FILE
      ====================================== */

      applicationFormData.append(
        "resume",
        formData.resume
      );

      /* =====================================
         SEND APPLICATION
      ====================================== */

      const response =
        await fetch(
          `${API_URL}/api/applications`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body:
              applicationFormData,
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      /* =====================================
         SESSION EXPIRED
      ====================================== */

      if (
        response.status ===
        401
      ) {
        localStorage.removeItem(
          "careerNestToken"
        );

        localStorage.removeItem(
          "careerNestUser"
        );

        sessionStorage.removeItem(
          "careerNestToken"
        );

        sessionStorage.removeItem(
          "careerNestUser"
        );

        alert(
          "Your session has expired. Please login again."
        );

        navigate("/login");
        return;
      }

      /* =====================================
         DUPLICATE APPLICATION
      ====================================== */

      if (
        response.status ===
        409
      ) {
        alert(
          data.message ||
            "You have already applied to this job."
        );

        return;
      }

      /* =====================================
         FILE / VALIDATION ERROR
      ====================================== */

      if (
        response.status ===
        400
      ) {
        alert(
          data.message ||
            "Please check your application details and resume."
        );

        return;
      }

      /* =====================================
         OTHER API ERROR
      ====================================== */

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to submit application."
        );
      }

      /* =====================================
         SUCCESS
      ====================================== */

      console.log(
        "Application and resume uploaded successfully."
      );

      setSubmitted(true);

    } catch (error) {
      console.error(
        "Application Submission Error:",
        error
      );

      alert(
        error.message ||
          "Unable to submit application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================
     LOADING SCREEN
  ========================================== */

  if (isLoading) {
    return (
      <main className="apply-page">

        <div className="apply-not-found">

          <div className="apply-not-found-icon">
            ⏳
          </div>

          <p className="section-tag">
            CAREERNEST APPLICATION
          </p>

          <h1>
            Loading Job...
          </h1>

          <p>
            Please wait while we load
            the application details.
          </p>

        </div>

      </main>
    );
  }

  /* =========================================
     ERROR SCREEN
  ========================================== */

  if (jobError) {
    return (
      <main className="apply-page">

        <div className="apply-not-found">

          <div className="apply-not-found-icon">
            ⚠️
          </div>

          <p className="section-tag">
            CAREERNEST APPLICATION
          </p>

          <h1>
            Unable to Load Job
          </h1>

          <p>
            {jobError}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>

        </div>

      </main>
    );
  }

  /* =========================================
     JOB NOT FOUND
  ========================================== */

  if (!job) {
    return (
      <main className="apply-page">

        <div className="apply-not-found">

          <div className="apply-not-found-icon">
            🔍
          </div>

          <p className="section-tag">
            CAREERNEST APPLICATION
          </p>

          <h1>
            Job Not Found
          </h1>

          <p>
            The job you are trying to
            apply for does not exist or
            may have been removed.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/jobs")
            }
          >
            ← Back to Jobs
          </button>

        </div>

      </main>
    );
  }

  /* =========================================
     SUCCESS SCREEN
  ========================================== */

  if (submitted) {
    return (
      <main className="apply-page">

        <div className="application-success">

          <div className="success-icon">
            ✓
          </div>

          <p className="section-tag">
            APPLICATION COMPLETE
          </p>

          <h1>
            Application Submitted!
          </h1>

          <p>
            Your application for{" "}
            <strong>
              {job.title}
            </strong>{" "}
            at{" "}
            <strong>
              {job.company}
            </strong>{" "}
            has been submitted
            successfully.
          </p>

          <div className="success-message">

            <span>
              ✓
            </span>

            <div>

              <strong>
                What's next?
              </strong>

              <p>
                Keep an eye on your
                email for further
                communication from
                the employer.
              </p>

            </div>

          </div>

          <div className="success-actions">

            <button
              type="button"
              onClick={() =>
                navigate("/jobs")
              }
            >
              Browse More Jobs
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate(
                  `/jobs/${getJobId(job)}`
                )
              }
            >
              View Job
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate(
                  "/my-applications"
                )
              }
            >
              My Applications
            </button>

          </div>

        </div>

      </main>
    );
  }

  /* =========================================
     MAIN PAGE
  ========================================== */

  return (
    <main className="apply-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <section className="apply-header">

        <button
          type="button"
          className="back-to-job"
          onClick={() =>
            navigate(
              `/jobs/${getJobId(job)}`
            )
          }
        >
          ← Back to Job Details
        </button>

        <p className="section-tag">
          APPLICATION
        </p>

        <h1>
          Apply for{" "}
          <span>
            {job.title}
          </span>
        </h1>

        <p>
          Submit your application to{" "}
          <strong>
            {job.company}
          </strong>.
        </p>

      </section>

      {/* =====================================
          CONTENT
      ====================================== */}

      <section className="apply-content">

        {/* ===================================
            APPLICATION FORM
        ==================================== */}

        <div className="application-form-card">

          <div className="form-card-header">

            <div>

              <h2>
                Your Application
              </h2>

              <p className="form-description">
                Fill in your details below
                to apply for this position.
              </p>

            </div>

            <span className="required-note">
              * Required
            </span>

          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
          >

            {/* NAME */}

            <div
              className={
                errors.name
                  ? "form-group has-error"
                  : "form-group"
              }
            >

              <label htmlFor="name">
                Full Name *
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
              />

              {errors.name && (
                <small className="form-error">
                  {errors.name}
                </small>
              )}

            </div>

            {/* EMAIL */}

            <div
              className={
                errors.email
                  ? "form-group has-error"
                  : "form-group"
              }
            >

              <label htmlFor="email">
                Email Address *
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
              />

              {errors.email && (
                <small className="form-error">
                  {errors.email}
                </small>
              )}

            </div>

            {/* PHONE */}

            <div
              className={
                errors.phone
                  ? "form-group has-error"
                  : "form-group"
              }
            >

              <label htmlFor="phone">
                Phone Number *
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength="10"
                placeholder="Enter your 10-digit mobile number"
                value={
                  formData.phone
                }
                onChange={
                  handleChange
                }
              />

              {errors.phone && (
                <small className="form-error">
                  {errors.phone}
                </small>
              )}

            </div>

            {/* RESUME */}

            <div
              className={
                errors.resume
                  ? "form-group has-error"
                  : "form-group"
              }
            >

              <label htmlFor="resume">
                Resume *
              </label>

              <input
                id="resume"
                name="resume"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={
                  handleChange
                }
              />

              <small className="field-help">
                Accepted formats:
                PDF, DOC, DOCX.
                Maximum size: 5 MB.
              </small>

              {formData.resume && (
                <div className="selected-file">
                  📄{" "}
                  {formData.resume.name}{" "}
                  (
                  {(
                    formData.resume.size /
                    (1024 * 1024)
                  ).toFixed(2)}
                  {" MB)"}
                </div>
              )}

              {errors.resume && (
                <small className="form-error">
                  {errors.resume}
                </small>
              )}

            </div>

            {/* COVER LETTER */}

            <div
              className={
                errors.coverLetter
                  ? "form-group has-error"
                  : "form-group"
              }
            >

              <div className="label-row">

                <label htmlFor="coverLetter">
                  Cover Letter *
                </label>

                <span>
                  {
                    formData.coverLetter
                      .length
                  }
                  /1000
                </span>

              </div>

              <textarea
                id="coverLetter"
                name="coverLetter"
                rows="7"
                maxLength="1000"
                placeholder="Write a short and professional cover letter..."
                value={
                  formData.coverLetter
                }
                onChange={
                  handleChange
                }
              />

              {errors.coverLetter && (
                <small className="form-error">
                  {errors.coverLetter}
                </small>
              )}

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="submit-application-btn"
              disabled={
                isSubmitting
              }
            >
              {isSubmitting
                ? "Uploading Resume & Submitting..."
                : "Submit Application →"}
            </button>

          </form>

        </div>

        {/* ===================================
            SIDEBAR
        ==================================== */}

        <aside className="application-sidebar">

          {/* JOB CARD */}

          <div className="application-job-card">

            <div className="application-logo">
              {getJobLogo(job)}
            </div>

            <h2>
              {job.title}
            </h2>

            <p className="application-company">
              {job.company}
            </p>

            <div className="application-meta">

              <span>
                📍 {job.location ||
                  "Location not specified"}
              </span>

              <span>
                💼 {job.type ||
                  "Job Type not specified"}
              </span>

              <span>
                💰 {job.salary ||
                  "Salary not specified"}
              </span>

              <span>
                🎓 {job.experience ||
                  "Experience not specified"}
              </span>

            </div>

          </div>

          {/* APPLICATION TIPS */}

          <div className="application-tip">

            <div className="tip-heading">

              <span>
                💡
              </span>

              <h3>
                Application Tips
              </h3>

            </div>

            <ul>

              <li>
                Keep your resume updated.
              </li>

              <li>
                Highlight skills relevant
                to this job.
              </li>

              <li>
                Write a clear and
                professional cover letter.
              </li>

              <li>
                Double-check your contact
                details.
              </li>

            </ul>

          </div>

          {/* PRIVACY NOTE */}

          <div className="application-privacy">

            <span>
              🔒
            </span>

            <p>
              Your application information
              and uploaded resume are
              handled securely.
            </p>

          </div>

        </aside>

      </section>

    </main>
  );
}

export default ApplyJob;