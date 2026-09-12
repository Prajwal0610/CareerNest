import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResumeBuilder.css";

/* =========================================
   API
========================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* =========================================
   INITIAL FORM DATA
========================================= */

const initialFormData = {
  fullName: "",
  jobTitle: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  education: "",
  experience: "",
  skills: "",
  certifications: "",
  projects: "",
};


/* =========================================
   VALID TEMPLATES
========================================= */

const validTemplates = [
  "modern",
  "professional",
  "creative",
];


/* =========================================
   TEMPLATE NAMES
========================================= */

const templateNames = {
  modern: "Modern Blue",
  professional: "Professional ATS",
  creative: "Creative",
};


/* =========================================
   COMPONENT
========================================= */

function ResumeBuilder() {
  const navigate = useNavigate();


  /* =========================================
     STATES
  ========================================== */

  const [formData, setFormData] =
    useState(initialFormData);

  const [selectedTemplate, setSelectedTemplate] =
    useState("modern");

  const [saved, setSaved] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [saveMessage, setSaveMessage] =
    useState("");

  const [saveStatus, setSaveStatus] =
    useState("idle");

  const [lastSavedAt, setLastSavedAt] =
    useState(null);


  /* =========================================
     GET AUTH TOKEN
  ========================================== */

  const getAuthToken = () => {
    return (
      localStorage.getItem("careerNestToken") ||
      sessionStorage.getItem("careerNestToken")
    );
  };

  /* =========================================
     AUTH / DATA HELPERS
  ========================================== */

  const clearAuthAndRedirect = () => {
    localStorage.removeItem("careerNestToken");
    localStorage.removeItem("careerNestUser");
    sessionStorage.removeItem("careerNestToken");
    sessionStorage.removeItem("careerNestUser");
    navigate("/login");
  };

  const saveLocalBackup = (data = formData, template = selectedTemplate) => {
    try {
      localStorage.setItem(
        "careernestResume",
        JSON.stringify(data)
      );

      localStorage.setItem(
        "selectedResumeTemplate",
        template
      );
    } catch (error) {
      console.error("Local Resume Backup Error:", error);
    }
  };

  const getResumePayload = (
    data = formData,
    template = selectedTemplate
  ) => ({
    ...initialFormData,
    ...data,
    selectedTemplate: validTemplates.includes(template)
      ? template
      : "modern",
  });

  const formatSavedTime = (date) => {
    if (!date) return "";

    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };


  /* =========================================
     LOAD LOCAL BACKUP
  ========================================== */

  const loadLocalBackup = () => {
    try {
      const savedResume =
        localStorage.getItem(
          "careernestResume"
        );

      const savedUser =
        localStorage.getItem("careerNestUser");

      let userEmail = "";

      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          userEmail = parsedUser?.email || "";
        } catch {
          userEmail = "";
        }
      }

      if (savedResume) {
        const parsedResume =
          JSON.parse(savedResume);

        setFormData({
          ...initialFormData,
          ...parsedResume,
          email: parsedResume.email || userEmail,
        });
      } else if (userEmail) {
        setFormData((current) => ({
          ...current,
          email: userEmail,
        }));
      }


      const localTemplate =
        localStorage.getItem(
          "selectedResumeTemplate"
        );

      if (
        validTemplates.includes(
          localTemplate
        )
      ) {
        setSelectedTemplate(
          localTemplate
        );
      }

    } catch (error) {
      console.error(
        "Local Resume Load Error:",
        error
      );
    }
  };


  /* =========================================
     LOAD RESUME
  ========================================== */

  useEffect(() => {
    const loadResume = async () => {
      const token = getAuthToken();

      if (!token) {
        setIsLoading(false);
        navigate("/login");
        return;
      }

      try {
        setLoadError("");

        const response = await fetch(
          `${API_URL}/api/resume`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        /* ================================
           TOKEN EXPIRED
        ================================= */

        if (response.status === 401) {
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

          navigate("/login");
          return;
        }


        /* ================================
           NO RESUME
        ================================= */

        if (response.status === 404) {
          loadLocalBackup();
          return;
        }


        const data =
          await response.json();


        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
            "Unable to load resume."
          );
        }


        /* =================================
           DATABASE RESUME
        ================================= */

        if (data.resume) {
          const resume =
            data.resume;


          setFormData({
            fullName:
              resume.fullName || "",

            jobTitle:
              resume.jobTitle || "",

            email:
              resume.email || "",

            phone:
              resume.phone || "",

            location:
              resume.location || "",

            summary:
              resume.summary || "",

            education:
              resume.education || "",

            experience:
              resume.experience || "",

            skills:
              resume.skills || "",

            certifications:
              resume.certifications || "",

            projects:
              resume.projects || "",
          });


          /* =================================
             TEMPLATE PRIORITY

             1. Local selected template
             2. MongoDB template
             3. Modern
          ================================== */

          const localTemplate =
            localStorage.getItem(
              "selectedResumeTemplate"
            );

          const databaseTemplate =
            resume.selectedTemplate;


          let finalTemplate = "modern";


          if (
            validTemplates.includes(
              localTemplate
            )
          ) {
            finalTemplate =
              localTemplate;

          } else if (
            validTemplates.includes(
              databaseTemplate
            )
          ) {
            finalTemplate =
              databaseTemplate;
          }


          setSelectedTemplate(
            finalTemplate
          );


          /* =================================
             UPDATE LOCAL BACKUP
          ================================= */

          localStorage.setItem(
            "careernestResume",
            JSON.stringify({
              fullName:
                resume.fullName || "",

              jobTitle:
                resume.jobTitle || "",

              email:
                resume.email || "",

              phone:
                resume.phone || "",

              location:
                resume.location || "",

              summary:
                resume.summary || "",

              education:
                resume.education || "",

              experience:
                resume.experience || "",

              skills:
                resume.skills || "",

              certifications:
                resume.certifications || "",

              projects:
                resume.projects || "",
            })
          );


          localStorage.setItem(
            "selectedResumeTemplate",
            finalTemplate
          );


          setSaved(true);
        }

      } catch (error) {
        console.error(
          "Load Resume Error:",
          error
        );

        setLoadError(
          "Unable to load saved resume. Using local backup."
        );

        loadLocalBackup();

      } finally {
        setIsLoading(false);
      }
    };


    loadResume();

  }, [navigate]);


  /* =========================================
     HANDLE INPUT
  ========================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;


    setFormData(
      (currentData) => ({
        ...currentData,
        [name]: value,
      })
    );


    setSaved(false);
    setSaveMessage("");
    setLoadError("");
  };


  /* =========================================
     SKILLS LIST
  ========================================== */

  const skillList = useMemo(() => {
    return formData.skills
      .split(",")
      .map((skill) =>
        skill.trim()
      )
      .filter(Boolean);
  }, [formData.skills]);


  /* =========================================
     COMPLETION
  ========================================== */

  const completionPercentage =
    useMemo(() => {
      const weights = {
        fullName: 12,
        jobTitle: 10,
        email: 10,
        phone: 8,
        location: 5,
        summary: 15,
        education: 10,
        experience: 12,
        skills: 8,
        certifications: 5,
        projects: 5,
      };

      const totalWeight =
        Object.values(weights).reduce(
          (total, weight) => total + weight,
          0
        );

      const completedWeight =
        Object.entries(weights).reduce(
          (total, [field, weight]) =>
            formData[field]?.trim()
              ? total + weight
              : total,
          0
        );

      return Math.min(
        100,
        Math.round(
          (completedWeight / totalWeight) * 100
        )
      );
    }, [formData]);


  /* =========================================
     VALIDATE RESUME
  ========================================== */

  const validateResume = () => {
    const errors = [];

    if (!formData.fullName.trim()) {
      errors.push("Full Name");
    }

    if (!formData.jobTitle.trim()) {
      errors.push("Job Title");
    }

    if (
      formData.email.trim() &&
      !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      errors.push("valid Email");
    }

    if (
      formData.phone.trim() &&
      !/^[+\\d][\\d\\s()-]{7,}$/.test(
        formData.phone.trim()
      )
    ) {
      errors.push("valid Phone");
    }

    return errors;
  };


  /* =========================================
     SAVE RESUME
  ========================================== */

  const saveResume = async (options = {}) => {
    const { silent = false } = options;

    const token =
      getAuthToken();

    if (!token) {
      if (!silent) {
        alert(
          "Please login to save your resume."
        );
      }

      clearAuthAndRedirect();
      return false;
    }

    const validationErrors =
      validateResume();

    if (
      validationErrors.length > 0 &&
      !silent
    ) {
      alert(
        `Please check: ${validationErrors.join(", ")}.`
      );
      return false;
    }

    setIsSaving(true);
    setSaveStatus("saving");

    if (!silent) {
      setSaved(false);
      setSaveMessage("");
    }

    try {
      const response =
        await fetch(
          `${API_URL}/api/resume`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify(
              getResumePayload()
            ),
          }
        );


      const data =
        await response.json();


      /* =================================
         SESSION EXPIRED
      ================================== */

      if (response.status === 401) {
        if (!silent) {
          alert(
            "Your session has expired. Please login again."
          );
        }

        clearAuthAndRedirect();
        return false;
      }


      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
          "Unable to save resume."
        );
      }


      /* =================================
         LOCAL BACKUP
      ================================== */

      saveLocalBackup();

      setSaved(true);
      setSaveStatus("saved");
      setLastSavedAt(new Date());

      if (!silent) {
        setSaveMessage(
          "Resume saved successfully."
        );
      }

      console.log(
        "Resume saved to MongoDB successfully ✅"
      );

      return true;

    } catch (error) {
      console.error(
        "Resume Save Error:",
        error
      );


      setSaveStatus("error");

      if (!silent) {
        setSaveMessage(
          error.message ||
          "Unable to save resume."
        );

        alert(
          error.message ||
          "Unable to save resume. Please try again."
        );
      }

      return false;

    } finally {
      setIsSaving(false);
    }
  };


  /* =========================================
     AUTO SAVE
  ========================================== */

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const hasData =
      Object.values(formData).some(
        (value) =>
          typeof value === "string" &&
          value.trim() !== ""
      );

    if (!hasData) {
      return;
    }

    saveLocalBackup();

    const timer =
      setTimeout(async () => {
        const token = getAuthToken();

        if (!token) {
          return;
        }

        try {
          await saveResume({
            silent: true,
          });
        } catch (error) {
          console.error(
            "Automatic Resume Save Error:",
            error
          );
        }
      }, 2000);

    return () =>
      clearTimeout(timer);
  }, [
    formData,
    selectedTemplate,
    isLoading,
  ]);


  /* =========================================
     CLEAR RESUME
  ========================================== */

  const handleClear = async () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to clear your resume?"
      );


    if (!confirmed) {
      return;
    }


    const token =
      getAuthToken();


    try {
      /* ================================
         DELETE FROM DATABASE
      ================================= */

      if (token) {
        const response =
          await fetch(
            `${API_URL}/api/resume`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        if (
          !response.ok &&
          response.status !== 404
        ) {
          const data =
            await response.json();

          throw new Error(
            data.message ||
            "Unable to delete resume."
          );
        }
      }


      /* ================================
         RESET FORM
      ================================= */

      setFormData({
        ...initialFormData,
      });


      setSelectedTemplate(
        "modern"
      );


      setSaved(false);
      setSaveMessage("");
      setLoadError("");


      /* ================================
         REMOVE LOCAL DATA
      ================================= */

      localStorage.removeItem(
        "careernestResume"
      );

      localStorage.removeItem(
        "selectedResumeTemplate"
      );

      setSaveStatus("idle");
      setLastSavedAt(null);


    } catch (error) {
      console.error(
        "Clear Resume Error:",
        error
      );

      alert(
        error.message ||
        "Unable to clear resume."
      );
    }
  };


  /* =========================================
     PRINT / PDF
  ========================================== */

  const handlePrint = () => {
    localStorage.setItem(
      "careernestResume",
      JSON.stringify(formData)
    );

    localStorage.setItem(
      "selectedResumeTemplate",
      selectedTemplate
    );


    setTimeout(() => {
      window.print();
    }, 100);
  };


  /* =========================================
     CHANGE TEMPLATE
  ========================================== */

  const openTemplates = () => {
    localStorage.setItem(
      "careernestResume",
      JSON.stringify(formData)
    );

    localStorage.setItem(
      "selectedResumeTemplate",
      selectedTemplate
    );


    navigate(
      "/resume-templates"
    );
  };


  /* =========================================
     LOADING
  ========================================== */

  if (isLoading) {
    return (
      <main className="resume-builder-page">

        <section className="resume-builder-header">

          <p className="section-tag">
            CAREERNEST TOOL
          </p>

          <h1>
            Loading Your{" "}
            <span>
              Resume...
            </span>
          </h1>

          <p>
            Fetching your saved resume
            from CareerNest.
          </p>

        </section>

      </main>
    );
  }


  /* =========================================
     RETURN
  ========================================== */

  return (
    <main
      className={
        `resume-builder-page template-${selectedTemplate}`
      }
    >

      {/* =====================================
          HEADER
      ====================================== */}

      <section className="resume-builder-header">

        <p className="section-tag">
          CAREERNEST TOOL
        </p>


        <h1>
          Build Your{" "}
          <span>
            Professional Resume.
          </span>
        </h1>


        <p>
          Create a clean, professional resume
          that helps you stand out to recruiters.
        </p>


        {loadError && (
          <small>
            {loadError}
          </small>
        )}

      </section>


      {/* =====================================
          BUILDER
      ====================================== */}

      <section className="resume-builder-content">


        {/* ===================================
            FORM
        ==================================== */}

        <div className="resume-form-card">


          {/* FORM HEADER */}

          <div className="resume-form-heading">

            <div>

              <h2>
                Resume Information
              </h2>

              <p className="resume-form-description">
                Enter your details to build
                your resume.
              </p>

            </div>


            {/* COMPLETION */}

            <div className="resume-completion">

              <div className="completion-top">

                <span>
                  Resume Completion
                </span>

                <strong>
                  {completionPercentage}%
                </strong>

              </div>


              <div className="completion-bar">

                <div
                  className="completion-progress"
                  style={{
                    width:
                      `${completionPercentage}%`,
                  }}
                />

              </div>

            </div>

          </div>


          {/* =================================
              PERSONAL DETAILS
          ================================== */}

          <div className="resume-section">

            <h3>
              Personal Details
            </h3>


            <div className="resume-grid">


              <div className="resume-form-group">

                <label>
                  Full Name
                </label>

                <input
                  name="fullName"
                  type="text"
                  placeholder="e.g. Your Name"
                  value={formData.fullName}
                  onChange={handleChange}
                />

              </div>


              <div className="resume-form-group">

                <label>
                  Job Title
                </label>

                <input
                  name="jobTitle"
                  type="text"
                  placeholder="e.g. Software Developer"
                  value={formData.jobTitle}
                  onChange={handleChange}
                />

              </div>


              <div className="resume-form-group">

                <label>
                  Email
                </label>

                <input
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />

              </div>


              <div className="resume-form-group">

                <label>
                  Phone
                </label>

                <input
                  name="phone"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                />

              </div>


              <div className="resume-form-group resume-full-width">

                <label>
                  Location
                </label>

                <input
                  name="location"
                  type="text"
                  placeholder="e.g. Pune, Maharashtra"
                  value={formData.location}
                  onChange={handleChange}
                />

              </div>

            </div>

          </div>


          {/* =================================
              SUMMARY
          ================================== */}

          <div className="resume-section">

            <h3>
              Professional Summary
            </h3>

            <div className="resume-form-group">

              <textarea
                name="summary"
                rows="5"
                placeholder="Write a short professional summary..."
                value={formData.summary}
                onChange={handleChange}
              />

            </div>

          </div>


          {/* =================================
              EDUCATION
          ================================== */}

          <div className="resume-section">

            <h3>
              Education
            </h3>

            <div className="resume-form-group">

              <textarea
                name="education"
                rows="5"
                placeholder="Example: B.E. Computer Engineering - XYZ College, 2026"
                value={formData.education}
                onChange={handleChange}
              />

            </div>

          </div>


          {/* =================================
              EXPERIENCE
          ================================== */}

          <div className="resume-section">

            <h3>
              Experience
            </h3>

            <div className="resume-form-group">

              <textarea
                name="experience"
                rows="5"
                placeholder="Add your work experience, internships, or relevant experience..."
                value={formData.experience}
                onChange={handleChange}
              />

            </div>

          </div>


          {/* =================================
              SKILLS
          ================================== */}

          <div className="resume-section">

            <h3>
              Skills
            </h3>

            <div className="resume-form-group">

              <input
                name="skills"
                type="text"
                placeholder="JavaScript, React, Node.js, MongoDB..."
                value={formData.skills}
                onChange={handleChange}
              />

              <small>
                Separate skills using commas.
              </small>

            </div>

          </div>


          {/* =================================
              CERTIFICATIONS
          ================================== */}

          <div className="resume-section">

            <h3>
              Certifications
            </h3>

            <div className="resume-form-group">

              <textarea
                name="certifications"
                rows="4"
                placeholder="Add your certifications..."
                value={formData.certifications}
                onChange={handleChange}
              />

            </div>

          </div>


          {/* =================================
              PROJECTS
          ================================== */}

          <div className="resume-section">

            <h3>
              Projects
            </h3>

            <div className="resume-form-group">

              <textarea
                name="projects"
                rows="5"
                placeholder="Add your projects and technologies used..."
                value={formData.projects}
                onChange={handleChange}
              />

            </div>

          </div>


          {/* =================================
              ACTIONS
          ================================== */}

          <div className="resume-actions">

            <button
              type="button"
              className="save-resume-btn"
              onClick={() => saveResume()}
              disabled={isSaving}
            >
              {isSaving
                ? "⏳ Saving..."
                : saved
                ? "✓ Resume Saved"
                : "💾 Save Resume"}
            </button>


            <button
              type="button"
              className="print-resume-btn"
              onClick={handlePrint}
            >
              🖨️ Print / PDF
            </button>


            <button
              type="button"
              className="clear-resume-btn"
              onClick={handleClear}
            >
              Clear
            </button>

          </div>


          {saveMessage && (
            <p className="resume-save-message">
              {saveMessage}
            </p>
          )}

          <div
            className={`resume-save-status status-${saveStatus}`}
            aria-live="polite"
          >
            {saveStatus === "saving" && "⏳ Saving changes..."}
            {saveStatus === "saved" &&
              `✓ Saved${lastSavedAt ? ` at ${formatSavedTime(lastSavedAt)}` : ""}`}
            {saveStatus === "error" &&
              "⚠️ Auto-save failed. You can try Save Resume again."}
            {saveStatus === "idle" &&
              "Changes are saved automatically."}
          </div>

        </div>


        {/* ===================================
            LIVE PREVIEW
        ==================================== */}

        <aside className="resume-preview-card">

          <div className="resume-preview-header">

            <div>

              <h2>
                Live Preview
              </h2>

              <span>
                {
                  templateNames[
                    selectedTemplate
                  ]
                }
              </span>

            </div>


            <button
              type="button"
              className="change-template-btn"
              onClick={openTemplates}
            >
              Change Template
            </button>

          </div>


          <div
            className={
              `resume-preview resume-${selectedTemplate}`
            }
          >


            {/* =================================
                MODERN TEMPLATE
            ================================== */}

            {selectedTemplate ===
              "modern" && (

              <div className="modern-template">

                <header className="modern-header">

                  <div className="preview-name">
                    {
                      formData.fullName ||
                      "Your Name"
                    }
                  </div>


                  <div className="preview-title">
                    {
                      formData.jobTitle ||
                      "Professional Title"
                    }
                  </div>


                  <div className="preview-contact">

                    {
                      formData.email ||
                      "email@example.com"
                    }

                    {formData.phone &&
                      ` • ${formData.phone}`}

                    {formData.location &&
                      ` • ${formData.location}`}

                  </div>

                </header>


                {formData.summary && (
                  <div className="preview-section">

                    <h3>
                      PROFILE
                    </h3>

                    <p>
                      {formData.summary}
                    </p>

                  </div>
                )}


                {formData.education && (
                  <div className="preview-section">

                    <h3>
                      EDUCATION
                    </h3>

                    <p>
                      {formData.education}
                    </p>

                  </div>
                )}


                {formData.experience && (
                  <div className="preview-section">

                    <h3>
                      EXPERIENCE
                    </h3>

                    <p>
                      {formData.experience}
                    </p>

                  </div>
                )}


                {skillList.length > 0 && (
                  <div className="preview-section">

                    <h3>
                      SKILLS
                    </h3>

                    <div className="preview-skills">

                      {skillList.map(
                        (skill) => (
                          <span
                            key={skill}
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>

                  </div>
                )}


                {formData.certifications && (
                  <div className="preview-section">

                    <h3>
                      CERTIFICATIONS
                    </h3>

                    <p>
                      {
                        formData.certifications
                      }
                    </p>

                  </div>
                )}


                {formData.projects && (
                  <div className="preview-section">

                    <h3>
                      PROJECTS
                    </h3>

                    <p>
                      {formData.projects}
                    </p>

                  </div>
                )}

              </div>
            )}


            {/* =================================
                PROFESSIONAL ATS
            ================================== */}

            {selectedTemplate ===
              "professional" && (

              <div className="professional-template">

                <header className="professional-header">

                  <div className="preview-name">
                    {
                      formData.fullName ||
                      "YOUR NAME"
                    }
                  </div>


                  <div className="preview-title">
                    {
                      formData.jobTitle ||
                      "Professional Title"
                    }
                  </div>


                  <div className="preview-contact">

                    {
                      formData.email ||
                      "email@example.com"
                    }

                    {formData.phone &&
                      ` | ${formData.phone}`}

                    {formData.location &&
                      ` | ${formData.location}`}

                  </div>

                </header>


                {formData.summary && (
                  <div className="preview-section">

                    <h3>
                      PROFESSIONAL SUMMARY
                    </h3>

                    <p>
                      {formData.summary}
                    </p>

                  </div>
                )}


                {formData.experience && (
                  <div className="preview-section">

                    <h3>
                      EXPERIENCE
                    </h3>

                    <p>
                      {formData.experience}
                    </p>

                  </div>
                )}


                {formData.education && (
                  <div className="preview-section">

                    <h3>
                      EDUCATION
                    </h3>

                    <p>
                      {formData.education}
                    </p>

                  </div>
                )}


                {skillList.length > 0 && (
                  <div className="preview-section">

                    <h3>
                      SKILLS
                    </h3>

                    <p className="ats-skills">
                      {
                        skillList.join(
                          " • "
                        )
                      }
                    </p>

                  </div>
                )}


                {formData.certifications && (
                  <div className="preview-section">

                    <h3>
                      CERTIFICATIONS
                    </h3>

                    <p>
                      {
                        formData.certifications
                      }
                    </p>

                  </div>
                )}


                {formData.projects && (
                  <div className="preview-section">

                    <h3>
                      PROJECTS
                    </h3>

                    <p>
                      {formData.projects}
                    </p>

                  </div>
                )}

              </div>
            )}


            {/* =================================
                CREATIVE TEMPLATE
            ================================== */}

            {selectedTemplate ===
              "creative" && (

              <div className="creative-template">

                <aside className="creative-sidebar">

                  <div className="creative-name">
                    {
                      formData.fullName ||
                      "Your Name"
                    }
                  </div>


                  <div className="creative-title">
                    {
                      formData.jobTitle ||
                      "Professional Title"
                    }
                  </div>


                  <div className="creative-contact">

                    <span>
                      {
                        formData.email ||
                        "email@example.com"
                      }
                    </span>


                    {formData.phone && (
                      <span>
                        {formData.phone}
                      </span>
                    )}


                    {formData.location && (
                      <span>
                        {formData.location}
                      </span>
                    )}

                  </div>


                  {skillList.length > 0 && (
                    <div className="creative-skills">

                      <h3>
                        SKILLS
                      </h3>


                      {skillList.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="creative-skill"
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>
                  )}

                </aside>


                <div className="creative-main">

                  {formData.summary && (
                    <div className="preview-section">

                      <h3>
                        PROFILE
                      </h3>

                      <p>
                        {formData.summary}
                      </p>

                    </div>
                  )}


                  {formData.experience && (
                    <div className="preview-section">

                      <h3>
                        EXPERIENCE
                      </h3>

                      <p>
                        {formData.experience}
                      </p>

                    </div>
                  )}


                  {formData.education && (
                    <div className="preview-section">

                      <h3>
                        EDUCATION
                      </h3>

                      <p>
                        {formData.education}
                      </p>

                    </div>
                  )}


                  {formData.projects && (
                    <div className="preview-section">

                      <h3>
                        PROJECTS
                      </h3>

                      <p>
                        {formData.projects}
                      </p>

                    </div>
                  )}


                  {formData.certifications && (
                    <div className="preview-section">

                      <h3>
                        CERTIFICATIONS
                      </h3>

                      <p>
                        {
                          formData.certifications
                        }
                      </p>

                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

        </aside>

      </section>

    </main>
  );
}


export default ResumeBuilder;