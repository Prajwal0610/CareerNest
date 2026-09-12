import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./JobDetails.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  /* =====================================================
     LOAD SINGLE JOB FROM MONGODB
  ===================================================== */

  useEffect(() => {
    const loadJob = async () => {
      setIsLoading(true);
      setError("");
      setJob(null);

      try {
        if (!id) {
          throw new Error("Job ID is missing.");
        }

        /*
          First try the direct MongoDB job endpoint.
          This is the correct method for MongoDB ObjectId.
        */

        const response = await fetch(
          `${API_URL}/api/jobs/${encodeURIComponent(id)}`
        );

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success && data.job) {
          setJob(data.job);
          return;
        }

        /*
          Fallback:
          If old/static numeric IDs are still present,
          search the complete jobs list.
        */

        const listResponse = await fetch(`${API_URL}/api/jobs`);

        const listData = await listResponse
          .json()
          .catch(() => ({}));

        if (!listResponse.ok || !listData.success) {
          throw new Error(
            data.message || "Unable to load job."
          );
        }

        const allJobs = Array.isArray(listData.jobs)
          ? listData.jobs
          : [];

        const foundJob = allJobs.find(
          (item) =>
            String(item._id) === String(id) ||
            String(item.id) === String(id)
        );

        if (!foundJob) {
          setJob(null);
          return;
        }

        setJob(foundJob);
      } catch (err) {
        console.error("Job Details Error:", err);

        setError(
          err.message || "Unable to load job details."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [id]);

  /* =====================================================
     SHARE JOB
  ===================================================== */

  const handleShare = async () => {
    if (!job) {
      return;
    }

    const jobUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: job.title,
          text: `${job.title} at ${job.company}`,
          url: jobUrl,
        });

        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(jobUrl);

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);

        return;
      }

      window.prompt(
        "Copy this job link:",
        jobUrl
      );
    } catch (error) {
      /*
        User may simply cancel the share dialog.
        No error message is required.
      */

      console.log("Share cancelled.");
    }
  };

  /* =====================================================
     SAVE JOB
  ===================================================== */

  const handleSave = () => {
    setSaved((current) => !current);
  };

  /* =====================================================
     RETRY
  ===================================================== */

  const handleRetry = () => {
    window.location.reload();
  };

  /* =====================================================
     HELPERS
  ===================================================== */

  const skills = Array.isArray(job?.skills)
    ? job.skills
    : [];

  const responsibilities = Array.isArray(
    job?.responsibilities
  )
    ? job.responsibilities
    : [];

  const requirements = Array.isArray(
    job?.requirements
  )
    ? job.requirements
    : [];

  const whyConsider = Array.isArray(
    job?.whyConsider
  )
    ? job.whyConsider
    : [];

  const companyInitials =
    job?.companyInitials ||
    job?.company?.slice(0, 2).toUpperCase() ||
    "CN";

  /*
    Always use MongoDB _id when available.
  */

  const jobId = job?._id || job?.id;

  /* =====================================================
     LOADING
  ===================================================== */

  if (isLoading) {
    return (
      <main className="job-details-page">
        <div className="job-not-found">
          <div className="job-not-found-icon">
            ⏳
          </div>

          <p className="section-tag">
            CAREERNEST JOBS
          </p>

          <h1>Loading Job...</h1>

          <p>
            Please wait while we load the job details.
          </p>
        </div>
      </main>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <main className="job-details-page">
        <div className="job-not-found">
          <div className="job-not-found-icon">
            ⚠️
          </div>

          <p className="section-tag">
            CAREERNEST JOBS
          </p>

          <h1>Unable to Load Job</h1>

          <p>{error}</p>

          <button
            type="button"
            onClick={handleRetry}
          >
            Try Again
          </button>

          <button
            type="button"
            onClick={() => navigate("/jobs")}
            style={{
              marginTop: "10px",
            }}
          >
            ← Back to Jobs
          </button>
        </div>
      </main>
    );
  }

  /* =====================================================
     JOB NOT FOUND
  ===================================================== */

  if (!job) {
    return (
      <main className="job-details-page">
        <div className="job-not-found">
          <div className="job-not-found-icon">
            🔍
          </div>

          <p className="section-tag">
            CAREERNEST JOBS
          </p>

          <h1>Job Not Found</h1>

          <p>
            The job you are looking for does not exist
            or may have been removed.
          </p>

          <button
            type="button"
            onClick={() => navigate("/jobs")}
          >
            ← Back to Jobs
          </button>
        </div>
      </main>
    );
  }

  /* =====================================================
     MAIN PAGE
  ===================================================== */

  return (
    <main className="job-details-page">

      {/* =================================================
          BACK NAVIGATION
      ================================================= */}

      <div className="job-details-topbar">
        <button
          type="button"
          className="back-to-jobs"
          onClick={() => navigate("/jobs")}
        >
          ← Back to Jobs
        </button>
      </div>

      {/* =================================================
          JOB HERO
      ================================================= */}

      <section className="job-details-hero">

        <div className="job-details-company-logo">
          {companyInitials}
        </div>

        <div className="job-details-heading">

          <p className="job-details-company">
            {job.company}
          </p>

          <h1>{job.title}</h1>

          <div className="job-details-meta">

            <span>
              📍 {job.location || "Not specified"}
            </span>

            <span>
              💼 {job.type || "Not specified"}
            </span>

            <span>
              💰 {job.salary || "Not specified"}
            </span>

          </div>

        </div>

        {/* HERO ACTIONS */}

        <div className="job-hero-actions">

          <button
            type="button"
            className={
              saved
                ? "job-action-btn saved"
                : "job-action-btn"
            }
            onClick={handleSave}
          >
            {saved ? "♥ Saved" : "♡ Save Job"}
          </button>

          <button
            type="button"
            className="job-action-btn"
            onClick={handleShare}
          >
            {copied ? "✓ Link Copied" : "↗ Share"}
          </button>

        </div>

      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <section className="job-details-content">

        {/* =================================================
            LEFT CONTENT
        ================================================= */}

        <div className="job-description">

          {/* DESCRIPTION */}

          <section className="job-detail-section">

            <h2>Job Description</h2>

            <p>
              {job.description ||
                `We are looking for a talented ${job.title} to join ${job.company}.`}
            </p>

          </section>

          {/* RESPONSIBILITIES */}

          <section className="job-detail-section">

            <h2>Responsibilities</h2>

            {responsibilities.length > 0 ? (
              <ul>
                {responsibilities.map(
                  (item, index) => (
                    <li
                      key={`${item}-${index}`}
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <ul>
                <li>
                  Work on assigned projects and
                  contribute to product development.
                </li>

                <li>
                  Collaborate with team members to
                  develop effective solutions.
                </li>

                <li>
                  Write clean, maintainable and
                  reliable code.
                </li>

                <li>
                  Test, debug and improve existing
                  applications.
                </li>

                <li>
                  Continuously learn and adapt to
                  new technologies.
                </li>
              </ul>
            )}

          </section>

          {/* REQUIREMENTS */}

          <section className="job-detail-section">

            <h2>Requirements</h2>

            {requirements.length > 0 ? (
              <ul>
                {requirements.map(
                  (item, index) => (
                    <li
                      key={`${item}-${index}`}
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <ul>
                <li>
                  {job.experience ||
                    "Relevant experience"}{" "}
                  of relevant experience.
                </li>

                <li>
                  Strong understanding of the
                  required technologies.
                </li>

                <li>
                  Good problem-solving and
                  communication skills.
                </li>

                <li>
                  Ability to work effectively in
                  a team.
                </li>

                <li>
                  Willingness to learn and adapt
                  to new technologies.
                </li>
              </ul>
            )}

          </section>

          {/* SKILLS */}

          <section className="job-detail-section">

            <h2>Required Skills</h2>

            <div className="details-skills">

              {skills.length > 0 ? (
                skills.map(
                  (skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                    >
                      {skill}
                    </span>
                  )
                )
              ) : (
                <span>
                  Skills not specified
                </span>
              )}

            </div>

          </section>

          {/* WHY THIS JOB */}

          <section className="job-detail-section">

            <h2>
              Why Consider This Opportunity?
            </h2>

            {whyConsider.length > 0 ? (
              <ul>
                {whyConsider.map(
                  (item, index) => (
                    <li
                      key={`${item}-${index}`}
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p>
                This role provides an opportunity
                to work on practical projects,
                strengthen your professional skills,
                collaborate with experienced
                professionals and grow your career.
              </p>
            )}

          </section>

        </div>

        {/* =================================================
            RIGHT SIDEBAR
        ================================================= */}

        <aside className="job-details-sidebar">

          {/* APPLY CARD */}

          <div className="apply-card">

            <h2>Ready to Apply?</h2>

            <p>
              Take the next step toward your career.
            </p>

            <button
              type="button"
              className="apply-button"
              onClick={() =>
                navigate(
                  `/jobs/${jobId}/apply`
                )
              }
            >
              Apply Now →
            </button>

          </div>

          {/* JOB SUMMARY */}

          <div className="job-summary">

            <h3>Job Summary</h3>

            <div>
              <span>Job Type</span>

              <strong>
                {job.type || "Not specified"}
              </strong>
            </div>

            <div>
              <span>Experience</span>

              <strong>
                {job.experience ||
                  "Not specified"}
              </strong>
            </div>

            <div>
              <span>Salary</span>

              <strong>
                {job.salary ||
                  "Not specified"}
              </strong>
            </div>

            <div>
              <span>Location</span>

              <strong>
                {job.location ||
                  "Not specified"}
              </strong>
            </div>

          </div>

          {/* QUICK INFO */}

          <div className="job-quick-info">

            <div className="quick-info-icon">
              💡
            </div>

            <div>

              <h3>Application Tip</h3>

              <p>
                Make sure your resume highlights
                the skills required for this role
                before applying.
              </p>

            </div>

          </div>

        </aside>

      </section>

      {/* =================================================
          BOTTOM APPLY
      ================================================= */}

      <section className="job-bottom-apply">

        <div>

          <h2>
            Interested in this opportunity?
          </h2>

          <p>
            Take the next step and submit your
            application today.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/jobs/${jobId}/apply`
            )
          }
        >
          Apply Now →
        </button>

      </section>

    </main>
  );
}

export default JobDetails;