import { useMemo, useRef, useState } from "react";
import "./SkillAnalyzer.css";

/* =========================================
   SKILL DATABASE
========================================= */

const skillDatabase = {
  HTML: {
    category: "Web Development",
    aliases: ["html"],
  },

  CSS: {
    category: "Web Development",
    aliases: ["css"],
  },

  JavaScript: {
    category: "Programming",
    aliases: ["javascript", "js"],
  },

  React: {
    category: "Frontend Development",
    aliases: ["react", "react.js", "reactjs"],
  },

  "Node.js": {
    category: "Backend Development",
    aliases: ["node", "node.js", "nodejs"],
  },

  "Express.js": {
    category: "Backend Development",
    aliases: ["express", "express.js", "expressjs"],
  },

  MongoDB: {
    category: "Database",
    aliases: ["mongodb", "mongo"],
  },

  SQL: {
    category: "Database",
    aliases: ["sql"],
  },

  MySQL: {
    category: "Database",
    aliases: ["mysql"],
  },

  Python: {
    category: "Programming",
    aliases: ["python"],
  },

  Java: {
    category: "Programming",
    aliases: ["java"],
  },

  "C++": {
    category: "Programming",
    aliases: ["c++", "cpp"],
  },

  Git: {
    category: "Tools",
    aliases: ["git"],
  },

  GitHub: {
    category: "Tools",
    aliases: ["github", "git hub"],
  },

  Bootstrap: {
    category: "Frontend Development",
    aliases: ["bootstrap"],
  },

  TypeScript: {
    category: "Programming",
    aliases: ["typescript", "ts"],
  },

  AWS: {
    category: "Cloud",
    aliases: ["aws", "amazon web services"],
  },

  Docker: {
    category: "DevOps",
    aliases: ["docker"],
  },

  Linux: {
    category: "DevOps",
    aliases: ["linux"],
  },

  "Spring Boot": {
    category: "Backend Development",
    aliases: ["spring boot", "springboot"],
  },

  Figma: {
    category: "Design",
    aliases: ["figma"],
  },

  Excel: {
    category: "Productivity",
    aliases: [
      "excel",
      "microsoft excel",
      "ms excel",
    ],
  },

  "VS Code": {
    category: "Tools",
    aliases: [
      "vs code",
      "visual studio code",
      "vscode",
    ],
  },

  "Android Studio": {
    category: "Tools",
    aliases: ["android studio"],
  },

  Postman: {
    category: "Tools",
    aliases: ["postman"],
  },

  Firebase: {
    category: "Cloud",
    aliases: [
      "firebase",
      "firebase realtime database",
    ],
  },

  PHP: {
    category: "Programming",
    aliases: ["php"],
  },

  "Tailwind CSS": {
    category: "Frontend Development",
    aliases: ["tailwind", "tailwind css"],
  },

  Redux: {
    category: "Frontend Development",
    aliases: ["redux"],
  },

  "Next.js": {
    category: "Frontend Development",
    aliases: [
      "next.js",
      "nextjs",
      "next",
    ],
  },

  "REST API": {
    category: "Backend Development",
    aliases: [
      "rest api",
      "rest apis",
      "rest",
    ],
  },

  "Machine Learning": {
    category: "Artificial Intelligence",
    aliases: [
      "machine learning",
      "ml",
    ],
  },

  TensorFlow: {
    category: "Artificial Intelligence",
    aliases: ["tensorflow"],
  },

  "Data Analysis": {
    category: "Data",
    aliases: [
      "data analysis",
      "data analytics",
    ],
  },

  PowerBI: {
    category: "Data",
    aliases: [
      "powerbi",
      "power bi",
    ],
  },
};


/* =========================================
   GENERAL RECOMMENDED SKILLS
========================================= */

const recommendedSkills = [
  "JavaScript",
  "React",
  "Git",
  "SQL",
  "Node.js",
  "Python",
  "TypeScript",
  "AWS",
];


/* =========================================
   CAREER ROLE DATABASE
========================================= */

const careerRoles = {
  "Frontend Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Git",
    "TypeScript",
  ],

  "Backend Developer": [
    "Java",
    "Python",
    "Node.js",
    "Express.js",
    "SQL",
    "MongoDB",
    "Git",
  ],

  "Full Stack Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
    "Express.js",
    "MongoDB",
    "SQL",
    "Git",
  ],

  "Java Developer": [
    "Java",
    "SQL",
    "Spring Boot",
    "Git",
    "MySQL",
  ],

  "Data Analyst": [
    "Excel",
    "SQL",
    "Python",
    "MySQL",
    "PowerBI",
  ],

  "DevOps Engineer": [
    "Linux",
    "Git",
    "Docker",
    "AWS",
    "Python",
  ],

  "Android Developer": [
    "Java",
    "Android Studio",
    "Firebase",
    "Git",
  ],

  "React Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Git",
    "Redux",
  ],

  "Web Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "Bootstrap",
    "Git",
    "PHP",
  ],

  "AI / ML Engineer": [
    "Python",
    "Machine Learning",
    "TensorFlow",
    "SQL",
    "Git",
  ],
};


/* =========================================
   COMPONENT
========================================= */

function SkillAnalyzer() {

  const [skillInput, setSkillInput] = useState("");

  const [analyzedSkills, setAnalyzedSkills] =
    useState([]);

  const [selectedRole, setSelectedRole] =
    useState("Frontend Developer");

  const [analysisMessage, setAnalysisMessage] =
    useState("");

  const careerMatchRef = useRef(null);

  const resultsRef = useRef(null);


  /* =========================================
     NORMALIZE SKILL
  ========================================= */

  const normalizeSkill = (skill) => {
    return skill
      .trim()
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .replace(/\s+/g, " ");
  };


  /* =========================================
     FIND SKILL
  ========================================= */

  const findSkill = (skill) => {

    const normalizedSkill =
      normalizeSkill(skill);

    return Object.entries(skillDatabase).find(
      ([skillName, data]) => {

        const normalizedSkillName =
          normalizeSkill(skillName);

        return (
          normalizedSkillName === normalizedSkill ||
          data.aliases.some(
            (alias) =>
              normalizeSkill(alias) ===
              normalizedSkill
          )
        );
      }
    );
  };


  /* =========================================
     HANDLE ANALYZE
  ========================================= */

  const handleAnalyze = () => {

    const input = skillInput.trim();

    if (!input) {

      setAnalyzedSkills([]);

      setAnalysisMessage(
        "Please enter at least one skill."
      );

      return;
    }


    const skills = input
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);


    const uniqueSkills = [
      ...new Map(
        skills.map((skill) => [
          normalizeSkill(skill),
          skill,
        ])
      ).values(),
    ];


    setAnalyzedSkills(uniqueSkills);

    setAnalysisMessage(
      `${uniqueSkills.length} skills analyzed successfully.`
    );


    /* Scroll to results */

    setTimeout(() => {

      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    }, 100);

  };


  /* =========================================
     HANDLE CLEAR
  ========================================= */

  const handleClear = () => {

    setSkillInput("");

    setAnalyzedSkills([]);

    setSelectedRole(
      "Frontend Developer"
    );

    setAnalysisMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  /* =========================================
     SKILL RESULTS
  ========================================= */

  const skillResults = useMemo(() => {

    return analyzedSkills.map((skill) => {

      const matchedEntry =
        findSkill(skill);

      return {

        name: matchedEntry
          ? matchedEntry[0]
          : skill,

        category: matchedEntry
          ? matchedEntry[1].category
          : "Other",

        recognized:
          Boolean(matchedEntry),

      };

    });

  }, [analyzedSkills]);


  /* =========================================
     RECOGNIZED SKILLS
  ========================================= */

  const recognizedSkills =
    skillResults.filter(
      (skill) => skill.recognized
    );


  /* =========================================
     GENERAL SCORE
  ========================================= */

  const score =
    analyzedSkills.length === 0
      ? 0
      : Math.round(
          (recognizedSkills.length /
            analyzedSkills.length) *
            100
        );


  /* =========================================
     CHECK USER SKILL
  ========================================= */

  const hasSkill = (skillName) => {

    const normalizedTarget =
      normalizeSkill(skillName);

    return analyzedSkills.some(
      (userSkill) => {

        const matchedEntry =
          findSkill(userSkill);

        if (!matchedEntry) {

          return (
            normalizeSkill(userSkill) ===
            normalizedTarget
          );

        }

        return (

          normalizeSkill(
            matchedEntry[0]
          ) === normalizedTarget ||

          matchedEntry[1].aliases.some(
            (alias) =>
              normalizeSkill(alias) ===
              normalizedTarget
          )

        );

      }
    );

  };


  /* =========================================
     SELECTED ROLE
  ========================================= */

  const roleSkills =
    careerRoles[selectedRole] || [];


  const matchedRoleSkills =
    roleSkills.filter(
      (roleSkill) =>
        hasSkill(roleSkill)
    );


  const roleMissingSkills =
    roleSkills.filter(
      (roleSkill) =>
        !hasSkill(roleSkill)
    );


  const roleMatchScore =
    roleSkills.length === 0
      ? 0
      : Math.round(
          (matchedRoleSkills.length /
            roleSkills.length) *
            100
        );


  /* =========================================
     CAREER PATH RESULTS
  ========================================= */

  const careerPathResults = useMemo(() => {

    return Object.entries(careerRoles)

      .map(([role, skills]) => {

        const matchedSkills =
          skills.filter(
            (skill) =>
              hasSkill(skill)
          );


        const missingSkills =
          skills.filter(
            (skill) =>
              !hasSkill(skill)
          );


        const match =
          skills.length === 0
            ? 0
            : Math.round(
                (matchedSkills.length /
                  skills.length) *
                  100
              );


        return {

          role,

          match,

          matchedSkills,

          missingSkills,

        };

      })

      .sort(
        (a, b) =>
          b.match - a.match
      );

  }, [analyzedSkills]);


  /* =========================================
     TOP CAREER PATHS
  ========================================= */

  const topCareerPaths =
    careerPathResults.slice(0, 5);


  /* =========================================
     GENERAL MISSING SKILLS
  ========================================= */

  const missingSkills =
    recommendedSkills.filter(
      (skill) =>
        !hasSkill(skill)
    );


  /* =========================================
     SCORE MESSAGE
  ========================================= */

  const getScoreMessage = () => {

    if (score >= 80) {

      return "Excellent! Your skill profile is strong.";

    }

    if (score >= 60) {

      return "Good progress! Add a few more relevant skills.";

    }

    if (score >= 40) {

      return "You're on the right track. Keep building your skills.";

    }

    return "Add more recognized skills to improve your profile.";

  };


  /* =========================================
     CAREER MESSAGE
  ========================================= */

  const getRoleMatchMessage = () => {

    if (roleMatchScore >= 80) {

      return "Excellent match for this career role.";

    }

    if (roleMatchScore >= 60) {

      return "Good match. A few more skills can strengthen your profile.";

    }

    if (roleMatchScore >= 40) {

      return "You're on the right track. Keep developing role-specific skills.";

    }

    return "Build more role-specific skills to improve your career match.";

  };


  /* =========================================
     SELECT CAREER PATH
  ========================================= */

  const handleCareerAnalyze = (role) => {

    setSelectedRole(role);

    setAnalysisMessage(
      `Career analysis updated for ${role}.`
    );


    setTimeout(() => {

      careerMatchRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    }, 100);

  };


  /* =========================================
     ADD RECOMMENDED SKILL
  ========================================= */

  const addSkill = (skill) => {

    const currentSkills = skillInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);


    const alreadyExists =
      currentSkills.some(
        (item) =>
          normalizeSkill(item) ===
          normalizeSkill(skill)
      );


    if (alreadyExists) {

      setAnalysisMessage(
        `${skill} is already added.`
      );

      return;

    }


    const updatedSkills = [
      ...currentSkills,
      skill,
    ];


    setSkillInput(
      updatedSkills.join(", ")
    );


    setAnalysisMessage(
      `${skill} added to your skills.`
    );

  };


  /* =========================================
     RETURN
  ========================================= */

  return (

    <main className="skill-analyzer-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <section className="skill-analyzer-header">

        <p className="section-tag">
          CAREERNEST TOOL
        </p>


        <h1>
          Analyze Your <span>Skills.</span>
        </h1>


        <p>
          Discover your skill strength and identify
          skills that can improve your career opportunities.
        </p>

      </section>



      {/* =====================================
          INPUT CARD
      ===================================== */}

      <section className="skill-input-card">

        <div className="skill-input-heading">

          <div>

            <h2>
              Enter Your Skills
            </h2>

            <p>
              Add your technical skills separated by commas.
            </p>

          </div>

        </div>


        {/* CAREER SELECTOR */}

        <div className="career-role-selector">

          <label htmlFor="careerRole">
            Select Your Career Goal
          </label>


          <select
            id="careerRole"
            value={selectedRole}
            onChange={(e) => {

              setSelectedRole(
                e.target.value
              );

              if (analyzedSkills.length > 0) {

                setAnalysisMessage(
                  `Career goal changed to ${e.target.value}.`
                );

              }

            }}
          >

            {Object.keys(careerRoles).map(
              (role) => (

                <option
                  key={role}
                  value={role}
                >
                  {role}
                </option>

              )
            )}

          </select>


          <p>
            Choose the job role you want to target.
          </p>

        </div>


        {/* TEXTAREA */}

        <textarea
          value={skillInput}

          onChange={(e) =>
            setSkillInput(
              e.target.value
            )
          }

          onKeyDown={(e) => {

            if (
              (e.ctrlKey || e.metaKey) &&
              e.key === "Enter"
            ) {

              handleAnalyze();

            }

          }}

          placeholder="Example: JavaScript, React, HTML, CSS, Git, SQL..."

          rows="5"
        />


        {/* BUTTONS */}

        <div className="skill-input-actions">

          <button
            type="button"
            className="analyze-skills-btn"
            onClick={handleAnalyze}
            disabled={!skillInput.trim()}
          >
            Analyze My Skills →
          </button>


          {analyzedSkills.length > 0 && (

            <button
              type="button"
              className="clear-skills-btn"
              onClick={handleClear}
            >
              Clear
            </button>

          )}

        </div>


        {analysisMessage && (

          <p
            style={{
              marginTop: "12px",
              color: "#2563eb",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            {analysisMessage}
          </p>

        )}

      </section>



      {/* =====================================
          RESULTS
      ===================================== */}

      {analyzedSkills.length > 0 && (

        <section
          className="skill-results"
          ref={resultsRef}
        >


          {/* =================================
              CAREER MATCH
          ================================= */}

          <div
            className="career-role-card"
            ref={careerMatchRef}
          >

            <div className="career-role-header">

              <div>

                <p className="career-role-label">
                  CAREER MATCH
                </p>


                <h2>
                  {selectedRole}
                </h2>


                <p>
                  {getRoleMatchMessage()}
                </p>

              </div>


              <div className="career-match-score">

                <span>
                  {roleMatchScore}%
                </span>

                <small>
                  Match
                </small>

              </div>

            </div>


            {/* PROGRESS */}

            <div className="career-match-progress">

              <div
                className="career-match-progress-bar"
                style={{
                  width: `${roleMatchScore}%`,
                }}
              />

            </div>


            {/* SKILL COLUMNS */}

            <div className="career-skill-columns">


              {/* STRONG SKILLS */}

              <div className="career-skill-box">

                <h3>
                  ✓ Strong Skills
                </h3>


                {matchedRoleSkills.length > 0 ? (

                  <div className="strong-skills">

                    {matchedRoleSkills.map(
                      (skill) => (

                        <span key={skill}>
                          {skill}
                        </span>

                      )
                    )}

                  </div>

                ) : (

                  <p>
                    Add skills related to this role.
                  </p>

                )}

              </div>



              {/* SKILLS TO LEARN */}

              <div className="career-skill-box">

                <h3>
                  + Skills to Learn
                </h3>


                {roleMissingSkills.length > 0 ? (

                  <div className="skills-to-learn">

                    {roleMissingSkills.map(
                      (skill) => (

                        <span
                          key={skill}
                          onClick={() =>
                            addSkill(skill)
                          }
                          style={{
                            cursor: "pointer",
                          }}
                          title="Click to add this skill"
                        >
                          + {skill}
                        </span>

                      )
                    )}

                  </div>

                ) : (

                  <p>
                    🎉 You have all the core skills
                    for this role.
                  </p>

                )}

              </div>

            </div>

          </div>



          {/* =================================
              CAREER PATHS
          ================================= */}

          <div className="career-paths-card">

            <div className="career-paths-header">

              <div>

                <h2>
                  Recommended Career Paths
                </h2>

                <p>
                  Career roles that match your current skills.
                </p>

              </div>

            </div>


            <div className="career-path-list">

              {topCareerPaths.map(
                (career, index) => (

                  <div
                    className="career-path-item"
                    key={career.role}
                  >


                    <div className="career-path-rank">
                      {index + 1}
                    </div>


                    <div className="career-path-info">

                      <div className="career-path-title">

                        <strong>
                          {career.role}
                        </strong>

                        <span>
                          {career.match}%
                        </span>

                      </div>


                      <div className="career-path-progress">

                        <div
                          className="career-path-progress-fill"
                          style={{
                            width: `${career.match}%`,
                          }}
                        />

                      </div>


                      <small>

                        {career.matchedSkills.length}
                        {" "}
                        of
                        {" "}
                        {careerSkillsCount(
                          career.role
                        )}
                        {" "}
                        core skills matched

                      </small>

                    </div>


                    <button
                      type="button"
                      className="career-path-btn"
                      onClick={() =>
                        handleCareerAnalyze(
                          career.role
                        )
                      }
                    >
                      Analyze
                    </button>

                  </div>

                )
              )}

            </div>

          </div>



          {/* =================================
              SKILL STRENGTH
          ================================= */}

          <div className="skill-score-card">

            <div
              className="skill-score-circle"
              style={{
                "--score": score,
              }}
            >

              <span>
                {score}%
              </span>

            </div>


            <div>

              <h2>
                Skill Strength
              </h2>


              <p>
                {getScoreMessage()}
              </p>


              <small>
                {recognizedSkills.length}
                {" "}
                recognized skills out of
                {" "}
                {analyzedSkills.length}
              </small>

            </div>

          </div>



          {/* =================================
              YOUR SKILLS
          ================================= */}

          <div className="skill-result-card">

            <div className="skill-result-header">

              <div>

                <h2>
                  Your Skills
                </h2>

                <p>
                  {analyzedSkills.length} skills analyzed
                </p>

              </div>

            </div>


            <div className="analyzed-skills">

              {skillResults.map(
                (skill) => (

                  <div
                    className="analyzed-skill"
                    key={`${skill.name}-${skill.category}`}
                  >

                    <div className="skill-name">
                      {skill.name}
                    </div>


                    <span>
                      {skill.category}
                    </span>

                  </div>

                )
              )}

            </div>

          </div>



          {/* =================================
              RECOMMENDED SKILLS
          ================================= */}

          <div className="skill-result-card">

            <div className="skill-result-header">

              <div>

                <h2>
                  Recommended Skills
                </h2>

                <p>
                  Skills that can strengthen your profile.
                </p>

              </div>

            </div>


            {missingSkills.length > 0 ? (

              <div className="recommended-skills">

                {missingSkills.map(
                  (skill) => (

                    <span
                      key={skill}
                      onClick={() =>
                        addSkill(skill)
                      }
                      style={{
                        cursor: "pointer",
                      }}
                      title="Click to add this skill"
                    >
                      + {skill}
                    </span>

                  )
                )}

              </div>

            ) : (

              <div className="all-skills-message">

                🎉 Great job! You already have
                all recommended skills.

              </div>

            )}

          </div>



          {/* =================================
              CAREER TIP
          ================================= */}

          <div className="career-tip">

            <div className="career-tip-icon">
              💡
            </div>


            <div>

              <h3>
                Career Tip
              </h3>


              <p>
                Keep your skills updated and focus
                on technologies that are relevant
                to the job roles you want to target.
              </p>

            </div>

          </div>


        </section>

      )}



      {/* =====================================
          EMPTY STATE
      ===================================== */}

      {analyzedSkills.length === 0 && (

        <section className="skill-empty-state">

          <div className="skill-empty-icon">
            🎯
          </div>


          <h2>
            Start Your Skill Analysis
          </h2>


          <p>
            Enter your technical and professional
            skills above to see your skill strength,
            career match and recommendations.
          </p>

        </section>

      )}

    </main>

  );
}


/* =========================================
   HELPER
========================================= */

function careerSkillsCount(role) {
  return careerRoles[role]?.length || 0;
}


export default SkillAnalyzer;