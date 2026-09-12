import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Jobs.css";

/* =========================================
   API CONFIGURATION
========================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/* =========================================
   JOB TYPES
========================================= */

const JOB_TYPES = [
  "Full Time",
  "Part Time",
  "Remote",
  "Internship",
];

/* =========================================
   HELPERS
========================================= */

function getJobId(job) {
  return job?._id || job?.id;
}

function getJobSkills(job) {
  if (!Array.isArray(job?.skills)) {
    return [];
  }

  return job.skills;
}

/* =========================================
   JOBS COMPONENT
========================================= */

function Jobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================
     LOAD JOBS FROM BACKEND
  ========================================== */

  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/api/jobs`
        );

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load jobs."
          );
        }

        setJobs(
          Array.isArray(data.jobs)
            ? data.jobs
            : []
        );
      } catch (err) {
        console.error(
          "Jobs Loading Error:",
          err
        );

        setError(
          err.message ||
            "Unable to load jobs. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, []);

  /* =========================================
     HANDLE JOB TYPE FILTER
  ========================================== */

  const handleTypeChange = (type) => {
    setSelectedTypes((currentTypes) => {
      if (currentTypes.includes(type)) {
        return currentTypes.filter(
          (item) => item !== type
        );
      }

      return [
        ...currentTypes,
        type,
      ];
    });
  };

  /* =========================================
     CLEAR FILTERS
  ========================================== */

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setSelectedTypes([]);
  };

  /* =========================================
     FILTER JOBS
  ========================================== */

  const filteredJobs = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    const locationValue =
      location.trim().toLowerCase();

    return jobs.filter((job) => {
      const title =
        job.title || "";

      const company =
        job.company || "";

      const jobLocation =
        job.location || "";

      const description =
        job.description || "";

      const skills =
        getJobSkills(job).join(" ");

      const searchableText =
        `${title} ${company} ${description} ${skills}`
          .toLowerCase();

      const matchesSearch =
        !searchValue ||
        searchableText.includes(
          searchValue
        );

      const matchesLocation =
        !locationValue ||
        jobLocation
          .toLowerCase()
          .includes(locationValue);

      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.includes(
          job.type
        );

      return (
        matchesSearch &&
        matchesLocation &&
        matchesType
      );
    });
  }, [
    jobs,
    search,
    location,
    selectedTypes,
  ]);

  /* =========================================
     LOADING SCREEN
  ========================================== */

  if (isLoading) {
    return (
      <main className="jobs-page">
        <section className="jobs-header">
          <p className="section-tag">
            CAREERNEST JOBS
          </p>

          <h1>
            Find Your{" "}
            <span>Next Opportunity.</span>
          </h1>

          <p>
            Loading the latest jobs from
            CareerNest...
          </p>
        </section>

        <section className="jobs-content">
          <div className="jobs-loading">
            <div className="jobs-spinner" />

            <h2>
              Loading Jobs...
            </h2>

            <p>
              Please wait while we fetch
              available opportunities.
            </p>
          </div>
        </section>
      </main>
    );
  }

  /* =========================================
     ERROR SCREEN
  ========================================== */

  if (error) {
    return (
      <main className="jobs-page">
        <section className="jobs-header">
          <p className="section-tag">
            CAREERNEST JOBS
          </p>

          <h1>
            Find Your{" "}
            <span>Next Opportunity.</span>
          </h1>

          <p>
            Explore opportunities available
            on CareerNest.
          </p>
        </section>

        <section className="jobs-content">
          <div className="jobs-empty">
            <div className="jobs-empty-icon">
              ⚠️
            </div>

            <h2>
              Unable to Load Jobs
            </h2>

            <p>
              {error}
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
        </section>
      </main>
    );
  }

  /* =========================================
     MAIN UI
  ========================================== */

  return (
    <main className="jobs-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <section className="jobs-header">
        <p className="section-tag">
          CAREERNEST JOBS
        </p>

        <h1>
          Find Your{" "}
          <span>Next Opportunity.</span>
        </h1>

        <p>
          Explore the latest opportunities
          and find a job that matches your
          skills and career goals.
        </p>
      </section>

      {/* =====================================
          SEARCH
      ====================================== */}

      <section className="jobs-search-section">

        <div className="jobs-search-box">

          <div className="search-input-wrapper">
            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search by job title, company or skills..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>

          <div className="search-input-wrapper">
            <span className="search-icon">
              📍
            </span>

            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value
                )
              }
            />
          </div>

          <button
            type="button"
            className="search-jobs-button"
          >
            Search Jobs
          </button>

        </div>

      </section>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <section className="jobs-content">

        {/* ===================================
            SIDEBAR
        ==================================== */}

        <aside className="jobs-sidebar">

          <div className="filter-header">

            <h3>
              Filters
            </h3>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear
            </button>

          </div>

          <div className="filter-group">

            <h4>
              Job Type
            </h4>

            {JOB_TYPES.map(
              (type) => (
                <label
                  key={type}
                  className="filter-checkbox"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(
                      type
                    )}
                    onChange={() =>
                      handleTypeChange(
                        type
                      )
                    }
                  />

                  <span>
                    {type}
                  </span>
                </label>
              )
            )}

          </div>

        </aside>

        {/* ===================================
            JOB LIST
        ==================================== */}

        <div className="jobs-list">

          <div className="jobs-list-header">

            <div>
              <h2>
                Available Jobs
              </h2>

              <p>
                Showing{" "}
                <strong>
                  {
                    filteredJobs.length
                  }
                </strong>{" "}
                of{" "}
                <strong>
                  {jobs.length}
                </strong>{" "}
                jobs
              </p>
            </div>

          </div>

          {/* =================================
              NO JOBS
          ================================== */}

          {filteredJobs.length === 0 ? (
            <div className="jobs-empty">

              <div className="jobs-empty-icon">
                🔍
              </div>

              <h2>
                No Jobs Found
              </h2>

              <p>
                Try changing your search
                or filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>
          ) : (

            /* =================================
               JOB CARDS
            ================================== */

            <div className="job-cards">

              {filteredJobs.map(
                (job) => {

                  const jobId =
                    getJobId(job);

                  const skills =
                    getJobSkills(
                      job
                    );

                  return (
                    <article
                      className="job-card"
                      key={jobId}
                    >

                      {/* COMPANY LOGO */}

                      <div className="job-card-top">

                        <div className="company-logo">
                          {job.companyInitials ||
                            job.company
                              ?.slice(
                                0,
                                2
                              )
                              .toUpperCase() ||
                            "CN"}
                        </div>

                        <div className="job-card-info">

                          <h3>
                            {job.title}
                          </h3>

                          <p className="job-company">
                            {job.company}
                          </p>

                        </div>

                      </div>

                      {/* JOB META */}

                      <div className="job-meta">

                        <span>
                          📍{" "}
                          {job.location ||
                            "Location not specified"}
                        </span>

                        <span>
                          💼{" "}
                          {job.type ||
                            "Job Type"}
                        </span>

                        <span>
                          💰{" "}
                          {job.salary ||
                            "Salary not specified"}
                        </span>

                        <span>
                          🎓{" "}
                          {job.experience ||
                            "Experience not specified"}
                        </span>

                      </div>

                      {/* DESCRIPTION */}

                      <p className="job-description">
                        {job.description ||
                          "No job description available."}
                      </p>

                      {/* SKILLS */}

                      {skills.length > 0 && (
                        <div className="job-skills">

                          {skills
                            .slice(
                              0,
                              6
                            )
                            .map(
                              (
                                skill,
                                index
                              ) => (
                                <span
                                  key={`${skill}-${index}`}
                                  className="skill-tag"
                                >
                                  {skill}
                                </span>
                              )
                            )}

                        </div>
                      )}

                      {/* FOOTER */}

                      <div className="job-card-footer">

                        <span className="job-posted">
                          {job.createdAt
                            ? `Posted ${new Date(
                                job.createdAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month:
                                    "short",
                                  year:
                                    "numeric",
                                }
                              )}`
                            : "Recently posted"}
                        </span>

                        <button
                          type="button"
                          className="view-job-button"
                          onClick={() =>
                            navigate(
                              `/jobs/${jobId}`
                            )
                          }
                        >
                          View Job →
                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </div>

      </section>

    </main>
  );
}

export default Jobs;