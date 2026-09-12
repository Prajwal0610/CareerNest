import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResumeTemplates.css";


/* =========================================
   API URL
========================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* =========================================
   VALID TEMPLATES
========================================= */

const validTemplates = [
  "modern",
  "professional",
  "creative",
];


function ResumeTemplates() {

  const navigate = useNavigate();


  /* =========================================
     SELECTED TEMPLATE
  ========================================= */

  const [selectedTemplate, setSelectedTemplate] =
    useState("modern");


  /* =========================================
     LOADING
  ========================================= */

  const [isLoading, setIsLoading] =
    useState(true);


  /* =========================================
     SAVING
  ========================================= */

  const [savingTemplate, setSavingTemplate] =
    useState("");


  /* =========================================
     TEMPLATES
  ========================================= */

  const templates = [

    {
      id: "modern",
      number: "01",
      name: "Modern Blue",
      category: "Modern",

      description:
        "A clean and modern resume design with professional blue accents.",

      style: "modern",

      bestFor:
        "Software developers, engineers and tech professionals.",

      features: [
        "Clean layout",
        "Blue accents",
        "Easy to scan",
      ],
    },


    {
      id: "professional",
      number: "02",
      name: "Professional ATS",
      category: "ATS Friendly",

      description:
        "A simple, structured layout designed for professional and ATS-friendly resumes.",

      style: "professional",

      bestFor:
        "Corporate jobs, freshers and experienced professionals.",

      features: [
        "ATS friendly",
        "Simple structure",
        "Professional layout",
      ],
    },


    {
      id: "creative",
      number: "03",
      name: "Creative",
      category: "Creative",

      description:
        "A stylish resume layout for candidates who want a more creative presentation.",

      style: "creative",

      bestFor:
        "Designers, marketers and creative professionals.",

      features: [
        "Creative design",
        "Visual sections",
        "Modern presentation",
      ],
    },

  ];


  /* =========================================
     GET AUTH TOKEN
  ========================================= */

  const getAuthToken = () => {

    return (
      localStorage.getItem(
        "careerNestToken"
      ) ||
      sessionStorage.getItem(
        "careerNestToken"
      )
    );

  };


  /* =========================================
     LOAD SELECTED TEMPLATE
  ========================================= */

  useEffect(() => {

    const loadSelectedTemplate =
      async () => {

        const token =
          getAuthToken();


        /* =====================================
           NOT LOGGED IN
        ===================================== */

        if (!token) {

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


          setIsLoading(false);

          navigate("/login");

          return;
        }


        try {

          /* ===================================
             GET RESUME FROM DATABASE
          =================================== */

          const response =
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


          /* ===================================
             RESUME NOT FOUND
          =================================== */

          if (
            response.status === 404
          ) {

            loadLocalTemplate();

            return;
          }


          /* ===================================
             EXPIRED TOKEN
          =================================== */

          if (
            response.status === 401
          ) {

            clearAuth();

            alert(
              "Your session has expired. Please login again."
            );

            navigate("/login");

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
                "Unable to load template."
            );
          }


          /* ===================================
             DATABASE TEMPLATE
          =================================== */

          const databaseTemplate =
            data.resume?.selectedTemplate;


          if (
            validTemplates.includes(
              databaseTemplate
            )
          ) {

            setSelectedTemplate(
              databaseTemplate
            );


            /* Local backup */

            localStorage.setItem(
              "selectedResumeTemplate",
              databaseTemplate
            );

          } else {

            loadLocalTemplate();

          }


        } catch (error) {

          console.error(
            "Template Load Error:",
            error
          );


          loadLocalTemplate();

        } finally {

          setIsLoading(false);

        }

      };


    loadSelectedTemplate();

  }, [navigate]);


  /* =========================================
     LOCAL TEMPLATE
  ========================================= */

  const loadLocalTemplate = () => {

    const savedTemplate =
      localStorage.getItem(
        "selectedResumeTemplate"
      );


    if (
      validTemplates.includes(
        savedTemplate
      )
    ) {

      setSelectedTemplate(
        savedTemplate
      );

    }

  };


  /* =========================================
     CLEAR AUTH
  ========================================= */

  const clearAuth = () => {

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

  };


  /* =========================================
     SELECT TEMPLATE
  ========================================= */

  const handleTemplateSelect =
    async (templateId) => {

      const token =
        getAuthToken();


      /* =====================================
         LOGIN CHECK
      ===================================== */

      if (!token) {

        alert(
          "Please login to select a resume template."
        );

        navigate("/login");

        return;
      }


      /* =====================================
         VALIDATION
      ===================================== */

      if (
        !validTemplates.includes(
          templateId
        )
      ) {

        alert(
          "Invalid resume template."
        );

        return;
      }


      setSavingTemplate(
        templateId
      );


      try {

        /* ===================================
           SAVE TEMPLATE TO DATABASE
        =================================== */

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

              /*
               * We only send the selected
               * template here.
               *
               * Backend currently updates
               * the resume document.
               */

              body: JSON.stringify({
                selectedTemplate:
                  templateId,
              }),
            }
          );


        /* ===================================
           TOKEN EXPIRED
        =================================== */

        if (
          response.status === 401
        ) {

          clearAuth();

          alert(
            "Your session has expired. Please login again."
          );

          navigate("/login");

          return;
        }


        const data =
          await response.json();


        /* ===================================
           ERROR
        =================================== */

        if (
          !response.ok ||
          !data.success
        ) {

          throw new Error(
            data.message ||
              "Unable to save template."
          );

        }


        /* ===================================
           UPDATE UI
        =================================== */

        setSelectedTemplate(
          templateId
        );


        /* ===================================
           LOCAL BACKUP
        =================================== */

        localStorage.setItem(
          "selectedResumeTemplate",
          templateId
        );


        console.log(
          `Resume template "${templateId}" saved successfully ✅`
        );


        /* ===================================
           GO BACK TO RESUME
        =================================== */

        setTimeout(() => {

          navigate("/resume");

        }, 250);


      } catch (error) {

        console.error(
          "Template Save Error:",
          error
        );


        alert(
          error.message ||
            "Unable to save template. Please try again."
        );

      } finally {

        setSavingTemplate("");

      }

    };


  /* =========================================
     BACK TO RESUME
  ========================================= */

  const handleBackToResume = () => {

    navigate("/resume");

  };


  /* =========================================
     LOADING SCREEN
  ========================================= */

  if (isLoading) {

    return (

      <main className="resume-templates-page">

        <section
          className="resume-templates-header"
        >

          <p className="section-tag">
            CAREERNEST TOOL
          </p>

          <h1>
            Loading{" "}
            <span>Templates...</span>
          </h1>

          <p>
            Loading your saved resume
            template.
          </p>

        </section>

      </main>

    );

  }


  /* =========================================
     RETURN
  ========================================= */

  return (

    <main
      className="resume-templates-page"
    >


      {/* =====================================
          HEADER
      ====================================== */}

      <section
        className="resume-templates-header"
      >

        <button
          type="button"
          className="templates-back-btn"
          onClick={handleBackToResume}
        >
          ← Back to Resume Builder
        </button>


        <p className="section-tag">
          CAREERNEST TOOL
        </p>


        <h1>
          Choose Your{" "}
          <span>
            Resume Template.
          </span>
        </h1>


        <p>
          Select a professional template that
          matches your career goals and create
          a resume that stands out.
        </p>

      </section>


      {/* =====================================
          TEMPLATE INFO
      ====================================== */}

      <section
        className="templates-info-bar"
      >

        <div
          className="templates-info-icon"
        >
          ✦
        </div>


        <div>

          <h3>
            Choose a template to get started
          </h3>

          <p>
            You can change your template
            anytime while building your resume.
          </p>

        </div>

      </section>


      {/* =====================================
          TEMPLATE GRID
      ====================================== */}

      <section
        className="resume-templates-grid"
      >

        {templates.map(
          (template) => {

            const isSelected =
              selectedTemplate ===
              template.id;


            const isSaving =
              savingTemplate ===
              template.id;


            return (

              <article
                className={
                  isSelected
                    ? "resume-template-card selected"
                    : "resume-template-card"
                }
                key={template.id}
              >


                {/* =================================
                    CARD TOP
                ================================== */}

                <div
                  className="template-card-top"
                >

                  <span
                    className="template-number"
                  >
                    {template.number}
                  </span>


                  <span
                    className="template-category"
                  >
                    {template.category}
                  </span>

                </div>


                {/* =================================
                    SELECTED BADGE
                ================================== */}

                {isSelected && (

                  <div
                    className="template-selected-badge"
                  >
                    ✓ Selected
                  </div>

                )}


                {/* =================================
                    RESUME PREVIEW
                ================================== */}

                <div
                  className={
                    `template-preview ${template.style}`
                  }
                >

                  <div
                    className="preview-header"
                  >

                    <div
                      className="template-preview-name"
                    >
                      Your Name
                    </div>


                    <div
                      className="template-preview-title"
                    >
                      Software Developer
                    </div>


                    <div
                      className="template-preview-contact"
                    >
                      email@example.com ·
                      +91 98765 43210
                    </div>

                  </div>


                  <div
                    className="template-preview-line"
                  />


                  <div
                    className="template-preview-section"
                  >
                    PROFILE
                  </div>


                  <div
                    className="template-preview-text"
                  >
                    Professional summary goes
                    here... Your experience and
                    career objective will appear
                    in this section.
                  </div>


                  <div
                    className="template-preview-section"
                  >
                    EXPERIENCE
                  </div>


                  <div
                    className="template-preview-text"
                  >
                    Software Developer Intern
                  </div>


                  <div
                    className="template-preview-small-line"
                  >
                    Company Name · 2025
                  </div>


                  <div
                    className="template-preview-section"
                  >
                    EDUCATION
                  </div>


                  <div
                    className="template-preview-text"
                  >
                    Bachelor of Engineering
                  </div>


                  <div
                    className="template-preview-section"
                  >
                    SKILLS
                  </div>


                  <div
                    className="template-preview-skills"
                  >

                    <span>
                      React
                    </span>

                    <span>
                      JavaScript
                    </span>

                    <span>
                      Node.js
                    </span>

                  </div>

                </div>


                {/* =================================
                    CARD CONTENT
                ================================== */}

                <div
                  className="template-card-content"
                >

                  <div
                    className="template-title-row"
                  >

                    <h2>
                      {template.name}
                    </h2>


                    {isSelected && (

                      <span
                        className="selected-dot"
                      >
                        ●
                      </span>

                    )}

                  </div>


                  <p
                    className="template-description"
                  >
                    {template.description}
                  </p>


                  {/* Best For */}

                  <div
                    className="template-best-for"
                  >

                    <strong>
                      Best for
                    </strong>

                    <span>
                      {template.bestFor}
                    </span>

                  </div>


                  {/* Features */}

                  <div
                    className="template-features"
                  >

                    {template.features.map(
                      (feature) => (

                        <span
                          key={feature}
                        >
                          ✓ {feature}
                        </span>

                      )
                    )}

                  </div>


                  {/* Button */}

                  <button
                    type="button"
                    className={
                      isSelected
                        ? "use-template-btn selected-btn"
                        : "use-template-btn"
                    }
                    onClick={() =>
                      handleTemplateSelect(
                        template.id
                      )
                    }
                    disabled={Boolean(
                      savingTemplate
                    )}
                  >

                    {isSaving
                      ? "⏳ Saving..."
                      : isSelected
                      ? "Use This Template ✓"
                      : "Use This Template →"}

                  </button>

                </div>

              </article>

            );

          }
        )}

      </section>


      {/* =====================================
          BOTTOM NOTE
      ====================================== */}

      <section
        className="templates-bottom-note"
      >

        <span>
          💡
        </span>


        <div>

          <h3>
            Not sure which template to choose?
          </h3>


          <p>
            For most job applications, we
            recommend the Professional ATS
            template. It keeps your information
            clear and easy for recruiters and
            ATS systems to read.
          </p>

        </div>

      </section>

    </main>

  );
}


export default ResumeTemplates;