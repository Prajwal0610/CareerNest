import { useMemo, useState } from "react";
import "./InterviewPrep.css";

function InterviewPrep() {
  const [category, setCategory] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Beginner");

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);

  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  /* =========================================
     CATEGORIES
  ========================================= */

  const categories = [
    "Technical",
    "HR",
    "Java",
    "Python",
    "Web Development",
    "Database",
  ];

  const difficulties = [
    "Beginner",
    "Intermediate",
    "Advanced",
  ];

  /* =========================================
     CATEGORY INFORMATION
  ========================================= */

  const categoryInfo = {
    Technical: {
      icon: "💻",
      description:
        "Practice common technical interview questions and improve your problem-solving skills.",
    },

    HR: {
      icon: "👤",
      description:
        "Prepare for common HR and behavioral interview questions.",
    },

    Java: {
      icon: "☕",
      description:
        "Prepare for Java programming, OOP, collections, exceptions and core concepts.",
    },

    Python: {
      icon: "🐍",
      description:
        "Practice Python programming, data structures and important interview concepts.",
    },

    "Web Development": {
      icon: "🌐",
      description:
        "Prepare for HTML, CSS, JavaScript, React and web development interviews.",
    },

    Database: {
      icon: "🗄️",
      description:
        "Practice SQL, database concepts, queries and DBMS interview questions.",
    },
  };

  /* =========================================
     QUESTION DATABASE
  ========================================= */

  const questionDatabase = {
    Technical: {
      Beginner: [
        {
          question:
            "What is the difference between a compiler and an interpreter?",
          keywords: ["compiler", "interpreter"],
        },
        {
          question: "What is an algorithm?",
          keywords: ["steps", "problem", "solution"],
        },
        {
          question: "What is debugging?",
          keywords: ["error", "bug", "fix"],
        },
        {
          question:
            "What is the difference between frontend and backend development?",
          keywords: ["frontend", "backend", "server"],
        },
        {
          question: "What is an API?",
          keywords: ["api", "application", "interface"],
        },
      ],

      Intermediate: [
        {
          question:
            "Explain object-oriented programming and its main principles.",
          keywords: [
            "class",
            "object",
            "inheritance",
            "polymorphism",
          ],
        },
        {
          question: "What is the difference between stack and queue?",
          keywords: ["stack", "queue", "lifo", "fifo"],
        },
        {
          question: "What is an API?",
          keywords: ["api", "application", "interface", "request"],
        },
        {
          question: "What is time complexity?",
          keywords: ["time", "input", "complexity", "algorithm"],
        },
        {
          question:
            "What is the difference between authentication and authorization?",
          keywords: [
            "authentication",
            "authorization",
            "identity",
            "permission",
          ],
        },
      ],

      Advanced: [
        {
          question:
            "Explain how a web application request travels from browser to server.",
          keywords: [
            "browser",
            "request",
            "server",
            "response",
            "http",
          ],
        },
        {
          question: "What is caching and why is it useful?",
          keywords: ["cache", "speed", "data", "performance"],
        },
        {
          question: "Explain horizontal and vertical scaling.",
          keywords: ["horizontal", "vertical", "server", "scale"],
        },
        {
          question: "What is system design?",
          keywords: ["architecture", "scalability", "system", "design"],
        },
        {
          question:
            "What are the main considerations when designing a scalable application?",
          keywords: [
            "database",
            "scalability",
            "load",
            "cache",
          ],
        },
      ],
    },

    HR: {
      Beginner: [
        {
          question: "Tell me about yourself.",
          keywords: [
            "education",
            "skills",
            "experience",
            "goal",
          ],
        },
        {
          question: "What are your strengths?",
          keywords: [
            "strength",
            "communication",
            "teamwork",
            "learning",
          ],
        },
        {
          question: "What are your weaknesses?",
          keywords: [
            "weakness",
            "improve",
            "learning",
          ],
        },
        {
          question: "Why should we hire you?",
          keywords: [
            "skills",
            "company",
            "learn",
            "contribute",
          ],
        },
        {
          question: "Where do you see yourself in five years?",
          keywords: [
            "career",
            "growth",
            "skills",
            "experience",
          ],
        },
      ],

      Intermediate: [
        {
          question:
            "Tell me about a difficult problem you solved.",
          keywords: [
            "problem",
            "solution",
            "result",
            "experience",
          ],
        },
        {
          question:
            "How do you handle pressure and deadlines?",
          keywords: [
            "pressure",
            "deadline",
            "priority",
            "planning",
          ],
        },
        {
          question:
            "Describe a situation where you worked in a team.",
          keywords: [
            "team",
            "communication",
            "responsibility",
            "result",
          ],
        },
        {
          question: "How do you handle criticism?",
          keywords: [
            "feedback",
            "improve",
            "learn",
          ],
        },
        {
          question:
            "Why do you want to work for our company?",
          keywords: [
            "company",
            "career",
            "growth",
            "skills",
          ],
        },
      ],

      Advanced: [
        {
          question:
            "Describe a professional failure and what you learned from it.",
          keywords: [
            "failure",
            "lesson",
            "improve",
            "experience",
          ],
        },
        {
          question:
            "How would you handle conflict with a team member?",
          keywords: [
            "communication",
            "conflict",
            "solution",
            "team",
          ],
        },
        {
          question:
            "Tell me about a time you showed leadership.",
          keywords: [
            "leadership",
            "team",
            "responsibility",
            "result",
          ],
        },
        {
          question:
            "How do you prioritize multiple important tasks?",
          keywords: [
            "priority",
            "deadline",
            "planning",
            "important",
          ],
        },
        {
          question:
            "What motivates you professionally?",
          keywords: [
            "motivation",
            "growth",
            "learning",
            "career",
          ],
        },
      ],
    },

    Java: {
      Beginner: [
        {
          question: "What is Java?",
          keywords: [
            "java",
            "programming",
            "object",
          ],
        },
        {
          question: "What is a class in Java?",
          keywords: [
            "class",
            "object",
            "blueprint",
          ],
        },
        {
          question: "What is an object?",
          keywords: [
            "object",
            "instance",
            "class",
          ],
        },
        {
          question: "What is inheritance?",
          keywords: [
            "inheritance",
            "parent",
            "child",
          ],
        },
        {
          question: "What is a constructor?",
          keywords: [
            "constructor",
            "object",
            "initialize",
          ],
        },
      ],

      Intermediate: [
        {
          question:
            "Explain method overloading and method overriding.",
          keywords: [
            "overloading",
            "overriding",
            "method",
          ],
        },
        {
          question: "What is an interface in Java?",
          keywords: [
            "interface",
            "abstract",
            "method",
          ],
        },
        {
          question: "What is exception handling?",
          keywords: [
            "exception",
            "try",
            "catch",
            "finally",
          ],
        },
        {
          question:
            "What is the difference between ArrayList and LinkedList?",
          keywords: [
            "arraylist",
            "linkedlist",
            "list",
          ],
        },
        {
          question:
            "What is the Java Collections Framework?",
          keywords: [
            "collection",
            "list",
            "set",
            "map",
          ],
        },
      ],

      Advanced: [
        {
          question: "Explain JVM, JRE and JDK.",
          keywords: [
            "jvm",
            "jre",
            "jdk",
            "java",
          ],
        },
        {
          question: "What is multithreading in Java?",
          keywords: [
            "thread",
            "multithreading",
            "concurrent",
          ],
        },
        {
          question:
            "Explain garbage collection in Java.",
          keywords: [
            "garbage",
            "memory",
            "object",
            "heap",
          ],
        },
        {
          question: "What is synchronization in Java?",
          keywords: [
            "synchronization",
            "thread",
            "lock",
          ],
        },
        {
          question:
            "What is the difference between HashMap and Hashtable?",
          keywords: [
            "hashmap",
            "hashtable",
            "thread",
            "null",
          ],
        },
      ],
    },

    Python: {
      Beginner: [
        {
          question: "What is Python?",
          keywords: [
            "python",
            "programming",
            "language",
          ],
        },
        {
          question: "What are Python lists?",
          keywords: [
            "list",
            "collection",
            "mutable",
          ],
        },
        {
          question: "What is a tuple?",
          keywords: [
            "tuple",
            "immutable",
            "collection",
          ],
        },
        {
          question:
            "What is a dictionary in Python?",
          keywords: [
            "dictionary",
            "key",
            "value",
          ],
        },
        {
          question:
            "What is indentation in Python?",
          keywords: [
            "indentation",
            "block",
            "code",
          ],
        },
      ],

      Intermediate: [
        {
          question:
            "What is the difference between list and tuple?",
          keywords: [
            "list",
            "tuple",
            "mutable",
            "immutable",
          ],
        },
        {
          question: "What are Python functions?",
          keywords: [
            "function",
            "def",
            "parameter",
            "return",
          ],
        },
        {
          question:
            "What is exception handling in Python?",
          keywords: [
            "try",
            "except",
            "exception",
          ],
        },
        {
          question:
            "What are list comprehensions?",
          keywords: [
            "list",
            "comprehension",
            "loop",
          ],
        },
        {
          question:
            "What is object-oriented programming in Python?",
          keywords: [
            "class",
            "object",
            "inheritance",
          ],
        },
      ],

      Advanced: [
        {
          question: "Explain decorators in Python.",
          keywords: [
            "decorator",
            "function",
            "wrapper",
          ],
        },
        {
          question:
            "What are generators in Python?",
          keywords: [
            "generator",
            "yield",
            "iterator",
          ],
        },
        {
          question:
            "What is the Global Interpreter Lock?",
          keywords: [
            "gil",
            "thread",
            "python",
          ],
        },
        {
          question:
            "Explain Python memory management.",
          keywords: [
            "memory",
            "object",
            "garbage",
            "reference",
          ],
        },
        {
          question:
            "What is the difference between shallow copy and deep copy?",
          keywords: [
            "shallow",
            "deep",
            "copy",
            "object",
          ],
        },
      ],
    },

    "Web Development": {
      Beginner: [
        {
          question: "What is HTML?",
          keywords: [
            "html",
            "structure",
            "web",
          ],
        },
        {
          question: "What is CSS?",
          keywords: [
            "css",
            "style",
            "design",
          ],
        },
        {
          question: "What is JavaScript?",
          keywords: [
            "javascript",
            "programming",
            "web",
          ],
        },
        {
          question:
            "What is responsive web design?",
          keywords: [
            "responsive",
            "mobile",
            "screen",
          ],
        },
        {
          question:
            "What is a website frontend?",
          keywords: [
            "frontend",
            "user",
            "interface",
          ],
        },
      ],

      Intermediate: [
        {
          question: "What is the DOM?",
          keywords: [
            "dom",
            "document",
            "object",
            "html",
          ],
        },
        {
          question:
            "What is the difference between let, const and var?",
          keywords: [
            "let",
            "const",
            "var",
            "javascript",
          ],
        },
        {
          question: "What is React?",
          keywords: [
            "react",
            "library",
            "component",
            "javascript",
          ],
        },
        {
          question:
            "What are React props and state?",
          keywords: [
            "props",
            "state",
            "component",
            "react",
          ],
        },
        {
          question:
            "What is an HTTP request?",
          keywords: [
            "http",
            "request",
            "server",
            "response",
          ],
        },
      ],

      Advanced: [
        {
          question:
            "Explain React component lifecycle concepts.",
          keywords: [
            "component",
            "lifecycle",
            "react",
            "effect",
          ],
        },
        {
          question:
            "What is state management in React?",
          keywords: [
            "state",
            "react",
            "management",
          ],
        },
        {
          question:
            "Explain REST API architecture.",
          keywords: [
            "rest",
            "api",
            "http",
            "request",
            "response",
          ],
        },
        {
          question:
            "What is web performance optimization?",
          keywords: [
            "performance",
            "cache",
            "image",
            "javascript",
          ],
        },
        {
          question:
            "What are common web security vulnerabilities?",
          keywords: [
            "security",
            "xss",
            "csrf",
            "injection",
          ],
        },
      ],
    },

    Database: {
      Beginner: [
        {
          question: "What is a database?",
          keywords: [
            "database",
            "data",
            "store",
          ],
        },
        {
          question: "What is SQL?",
          keywords: [
            "sql",
            "query",
            "database",
          ],
        },
        {
          question: "What is a table?",
          keywords: [
            "table",
            "row",
            "column",
          ],
        },
        {
          question:
            "What is a primary key?",
          keywords: [
            "primary",
            "key",
            "unique",
          ],
        },
        {
          question:
            "What is a foreign key?",
          keywords: [
            "foreign",
            "key",
            "relationship",
          ],
        },
      ],

      Intermediate: [
        {
          question:
            "What is database normalization?",
          keywords: [
            "normalization",
            "redundancy",
            "data",
          ],
        },
        {
          question: "What is an SQL JOIN?",
          keywords: [
            "join",
            "table",
            "relationship",
          ],
        },
        {
          question: "What is an index?",
          keywords: [
            "index",
            "query",
            "performance",
          ],
        },
        {
          question:
            "What is the difference between DELETE, DROP and TRUNCATE?",
          keywords: [
            "delete",
            "drop",
            "truncate",
          ],
        },
        {
          question:
            "What are SQL aggregate functions?",
          keywords: [
            "count",
            "sum",
            "avg",
            "max",
            "min",
          ],
        },
      ],

      Advanced: [
        {
          question:
            "Explain ACID properties in databases.",
          keywords: [
            "acid",
            "atomicity",
            "consistency",
            "isolation",
            "durability",
          ],
        },
        {
          question:
            "What is database indexing and how does it affect performance?",
          keywords: [
            "index",
            "performance",
            "query",
          ],
        },
        {
          question:
            "What is a transaction?",
          keywords: [
            "transaction",
            "commit",
            "rollback",
          ],
        },
        {
          question:
            "Explain database replication.",
          keywords: [
            "replication",
            "database",
            "server",
            "copy",
          ],
        },
        {
          question:
            "What is database sharding?",
          keywords: [
            "sharding",
            "database",
            "partition",
            "scale",
          ],
        },
      ],
    },
  };

  /* =========================================
     CURRENT QUESTIONS
  ========================================= */

  const questions = useMemo(() => {
    return questionDatabase[category][difficulty];
  }, [category, difficulty]);

  const question = questions[currentQuestion];

  /* =========================================
     START
  ========================================= */

  const handleStart = () => {
    setStarted(true);
    setFinished(false);
    setCurrentQuestion(0);
    setAnswers({});
    setSubmittedAnswers({});
    setShowFeedback(false);
    setScore(0);
  };

  /* =========================================
     CHANGE SETUP
  ========================================= */

  const handleBack = () => {
    setStarted(false);
    setFinished(false);
    setCurrentQuestion(0);
    setAnswers({});
    setSubmittedAnswers({});
    setShowFeedback(false);
    setScore(0);
  };

  /* =========================================
     ANSWER CHANGE
  ========================================= */

  const handleAnswerChange = (event) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]: event.target.value,
    }));

    setShowFeedback(false);
  };

  /* =========================================
     EVALUATE ANSWER
  ========================================= */

  const evaluateAnswer = () => {
    const rawAnswer = answers[currentQuestion] || "";
    const answer = rawAnswer.trim().toLowerCase();
    const keywords = question?.keywords || [];

    if (!answer) {
      return {
        percentage: 0,
        matchedKeywords: [],
        missingKeywords: keywords,
        answered: false,
        skipped: false,
        wordCount: 0,
        level: "Needs Improvement",
        feedback:
          "Please write an answer before submitting. Try to explain the main concept in your own words.",
      };
    }

    const normalizedAnswer = answer
      .replace(/[.,!?;:()[\]{}"'`]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const matchedKeywords = keywords.filter((keyword) => {
      const normalizedKeyword = keyword.toLowerCase().trim();

      if (normalizedKeyword.includes(" ")) {
        return normalizedAnswer.includes(normalizedKeyword);
      }

      const escapedKeyword = normalizedKeyword.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      return new RegExp(`\\b${escapedKeyword}\\b`, "i").test(
        normalizedAnswer
      );
    });

    const missingKeywords = keywords.filter(
      (keyword) => !matchedKeywords.includes(keyword)
    );

    const wordCount = normalizedAnswer
      .split(" ")
      .filter(Boolean).length;

    const conceptScore =
      keywords.length > 0
        ? (matchedKeywords.length / keywords.length) * 75
        : 0;

    const lengthScore =
      wordCount >= 35
        ? 15
        : wordCount >= 20
        ? 10
        : wordCount >= 10
        ? 5
        : 0;

    const structureIndicators = [
      "because",
      "for example",
      "however",
      "therefore",
      "first",
      "second",
      "also",
      "while",
      "whereas",
      "such as",
    ];

    const structureScore = structureIndicators.some((word) =>
      normalizedAnswer.includes(word)
    )
      ? 10
      : 0;

    const percentage = Math.min(
      100,
      Math.round(
        conceptScore + lengthScore + structureScore
      )
    );

    let level = "Needs Improvement";
    let feedback =
      "Review the topic and include more important concepts in your answer.";

    if (percentage >= 80) {
      level = "Excellent Answer";
      feedback =
        "Excellent! Your answer covers the important concepts and gives a clear explanation.";
    } else if (percentage >= 60) {
      level = "Good Answer";
      feedback =
        "Good answer! You covered several important points. Add the missing concepts and a small example to make it stronger.";
    } else if (percentage >= 40) {
      level = "Average Answer";
      feedback =
        "You have started in the right direction, but your answer needs more relevant technical points and explanation.";
    }

    return {
      percentage,
      matchedKeywords,
      missingKeywords,
      answered: true,
      skipped: false,
      wordCount,
      level,
      feedback,
    };
  };

  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = () => {
    const answer = (answers[currentQuestion] || "").trim();

    if (!answer) {
      const emptyResult = {
        percentage: 0,
        matchedKeywords: [],
        missingKeywords: question?.keywords || [],
        answered: false,
        skipped: false,
        wordCount: 0,
        level: "Needs Improvement",
        feedback:
          "Please write an answer before submitting. You can explain the concept in simple words.",
      };

      setSubmittedAnswers((previous) => ({
        ...previous,
        [currentQuestion]: emptyResult,
      }));

      setShowFeedback(true);
      return;
    }

    const result = evaluateAnswer();

    setSubmittedAnswers((previous) => ({
      ...previous,
      [currentQuestion]: result,
    }));

    setShowFeedback(true);
  };

  /* =========================================
     NEXT
  ========================================= */

  const handleNext = () => {
    const result =
      submittedAnswers[currentQuestion] ||
      evaluateAnswer();

    const updatedResults = {
      ...submittedAnswers,
      [currentQuestion]: result,
    };

    setSubmittedAnswers(updatedResults);

    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) => previous + 1
      );

      setShowFeedback(false);
      return;
    }

    calculateFinalScore(updatedResults);
  };

  /* =========================================
     PREVIOUS
  ========================================= */

  const handlePrevious = () => {
    if (currentQuestion === 0) {
      return;
    }

    setCurrentQuestion(
      (previous) => previous - 1
    );

    setShowFeedback(
      Boolean(
        submittedAnswers[currentQuestion - 1]
      )
    );
  };

  /* =========================================
     SKIP
  ========================================= */

  const handleSkip = () => {
    const skippedResult = {
      percentage: 0,
      matchedKeywords: [],
      missingKeywords: question?.keywords || [],
      skipped: true,
      answered: false,
      wordCount: 0,
      level: "Question Skipped",
      feedback:
        "You skipped this question. Review the topic and try it again later.",
    };

    const updatedResults = {
      ...submittedAnswers,
      [currentQuestion]: skippedResult,
    };

    setSubmittedAnswers(updatedResults);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
      setShowFeedback(false);
      return;
    }

    calculateFinalScore(updatedResults);
  };

  /* =========================================
     FINAL SCORE
  ========================================= */

  const calculateFinalScore = (results) => {
    const resultValues =
      Object.values(results);

    const totalScore =
      resultValues.reduce(
        (total, item) =>
          total +
          (item?.percentage || 0),
        0
      );

    const finalScore =
      questions.length > 0
        ? Math.round(
            totalScore /
              questions.length
          )
        : 0;

    setScore(finalScore);
    setFinished(true);
  };

  /* =========================================
     RESTART
  ========================================= */

  const handleRestart = () => {
    setStarted(true);
    setFinished(false);
    setCurrentQuestion(0);
    setAnswers({});
    setSubmittedAnswers({});
    setShowFeedback(false);
    setScore(0);
  };

  /* =========================================
     SCORE MESSAGE
  ========================================= */

  const getScoreMessage = () => {
    if (score >= 90) {
      return "Outstanding! Your interview preparation is excellent.";
    }

    if (score >= 80) {
      return "Excellent! You are well prepared for this interview.";
    }

    if (score >= 60) {
      return "Good performance! A little more practice will make you stronger.";
    }

    if (score >= 40) {
      return "You are on the right track. Focus on the missing concepts and keep practicing.";
    }

    return "Keep practicing. Review the concepts and try answering with more detail.";
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <main className="interview-prep-page">

      {/* HEADER */}

      <section className="interview-header">

        <p className="section-tag">
          CAREERNEST TOOL
        </p>

        <h1>
          Prepare For Your{" "}
          <span>Interview.</span>
        </h1>

        <p className="interview-subtitle">
          Practice interview questions, improve
          your confidence, and get ready for your
          next career opportunity.
        </p>

      </section>


      {/* =====================================
          SETUP
      ====================================== */}

      {!started && (

        <section className="interview-setup-card">

          <div className="setup-heading">

            <div>

              <h2>
                Start Interview Preparation
              </h2>

              <p>
                Choose a category and difficulty
                level to begin.
              </p>

            </div>

            <div className="setup-icon">
              🎯
            </div>

          </div>


          {/* CATEGORY */}

          <div className="interview-field">

            <label>
              Select Interview Category
            </label>

            <div className="category-grid">

              {categories.map((item) => (

                <button
                  type="button"
                  key={item}
                  className={
                    category === item
                      ? "category-card active"
                      : "category-card"
                  }
                  onClick={() =>
                    setCategory(item)
                  }
                >

                  <span className="category-icon">
                    {categoryInfo[item].icon}
                  </span>

                  <span className="category-name">
                    {item}
                  </span>

                </button>

              ))}

            </div>

          </div>


          {/* DIFFICULTY */}

          <div className="interview-field">

            <label>
              Select Difficulty
            </label>

            <div className="difficulty-options">

              {difficulties.map((item) => (

                <button
                  type="button"
                  key={item}
                  className={
                    difficulty === item
                      ? "difficulty-btn active"
                      : "difficulty-btn"
                  }
                  onClick={() =>
                    setDifficulty(item)
                  }
                >
                  {item}
                </button>

              ))}

            </div>

          </div>


          {/* CATEGORY INFO */}

          <div className="selected-category">

            <div className="selected-category-icon">
              {categoryInfo[category].icon}
            </div>

            <div>

              <h3>
                {category}
              </h3>

              <p>
                {categoryInfo[category].description}
              </p>

            </div>

          </div>


          <button
            type="button"
            className="start-interview-btn"
            onClick={handleStart}
          >
            Start Interview →
          </button>

        </section>

      )}


      {/* =====================================
          INTERVIEW
      ====================================== */}

      {started && !finished && (

        <section className="interview-session">

          {/* SESSION HEADER */}

          <div className="session-header">

            <div>

              <p className="session-label">
                {category} Interview
              </p>

              <h2>
                {difficulty} Level
              </h2>

            </div>

            <button
              type="button"
              className="back-btn"
              onClick={handleBack}
            >
              ← Change Setup
            </button>

          </div>


          {/* PROGRESS */}

          <div className="interview-progress">

            <div className="progress-info">

              <span>
                Question{" "}
                {currentQuestion + 1} of{" "}
                {questions.length}
              </span>

              <span>
                {Math.round(
                  ((currentQuestion + 1) /
                    questions.length) *
                    100
                )}
                %
              </span>

            </div>

            <div className="progress-bar">

              <div
                className="progress-fill"
                style={{
                  width: `${
                    ((currentQuestion + 1) /
                      questions.length) *
                    100
                  }%`,
                }}
              />

            </div>

          </div>


          {/* QUESTION CARD */}

          <div className="question-card">

            <div className="question-number">
              QUESTION{" "}
              {String(
                currentQuestion + 1
              ).padStart(2, "0")}
            </div>

            <h2>
              {question.question}
            </h2>


            <textarea
              className="answer-input"
              value={
                answers[currentQuestion] || ""
              }
              onChange={handleAnswerChange}
              placeholder="Type your answer here..."
              rows="7"
            />


            {/* FEEDBACK */}

            {showFeedback &&
              submittedAnswers[currentQuestion] && (

                <div
                  className={
                    submittedAnswers[currentQuestion].skipped
                      ? "answer-feedback skipped"
                      : submittedAnswers[currentQuestion].percentage >= 80
                      ? "answer-feedback excellent"
                      : submittedAnswers[currentQuestion].percentage >= 60
                      ? "answer-feedback good"
                      : submittedAnswers[currentQuestion].percentage >= 40
                      ? "answer-feedback average"
                      : "answer-feedback weak"
                  }
                >

                  <div className="feedback-header">

                    <strong>
                      {submittedAnswers[currentQuestion].skipped
                        ? "Question Skipped"
                        : submittedAnswers[currentQuestion].level}
                    </strong>

                    <span>
                      {submittedAnswers[currentQuestion].percentage}%
                    </span>

                  </div>

                  <p>
                    {submittedAnswers[currentQuestion].skipped
                      ? "You skipped this question. Try answering it during your next practice session."
                      : submittedAnswers[currentQuestion].feedback}
                  </p>

                  {!submittedAnswers[currentQuestion].skipped &&
                    submittedAnswers[currentQuestion].answered && (

                      <>
                        {submittedAnswers[currentQuestion].matchedKeywords
                          ?.length > 0 && (

                          <div className="feedback-section">

                            <strong>
                              ✓ Concepts Covered
                            </strong>

                            <div className="feedback-tags">

                              {submittedAnswers[currentQuestion]
                                .matchedKeywords.map((keyword) => (

                                  <span key={keyword}>
                                    {keyword}
                                  </span>

                                ))}

                            </div>

                          </div>

                        )}

                        {submittedAnswers[currentQuestion].missingKeywords
                          ?.length > 0 && (

                          <div className="feedback-section">

                            <strong>
                              + Concepts to Improve
                            </strong>

                            <div className="feedback-tags missing">

                              {submittedAnswers[currentQuestion]
                                .missingKeywords.map((keyword) => (

                                  <span key={keyword}>
                                    {keyword}
                                  </span>

                                ))}

                            </div>

                          </div>

                        )}

                        <div className="answer-stats">

                          <span>
                            📝{" "}
                            {submittedAnswers[currentQuestion].wordCount} words
                          </span>

                          <span>
                            🎯{" "}
                            {
                              submittedAnswers[currentQuestion]
                                .matchedKeywords.length
                            }{" "}
                            concepts matched
                          </span>

                        </div>

                      </>

                    )}

                </div>

              )}

            {/* ACTIONS */}

            <div className="question-actions">

              <button
                type="button"
                className="secondary-action"
                onClick={handlePrevious}
                disabled={
                  currentQuestion === 0
                }
              >
                ← Previous
              </button>


              <button
                type="button"
                className="secondary-action"
                onClick={handleSkip}
              >
                Skip
              </button>


              {!showFeedback ? (

                <button
                  type="button"
                  className="primary-action"
                  onClick={handleSubmit}
                >
                  Submit Answer →
                </button>

              ) : (

                <button
                  type="button"
                  className="primary-action"
                  onClick={handleNext}
                >
                  {currentQuestion ===
                  questions.length - 1
                    ? "Finish Interview →"
                    : "Next Question →"}
                </button>

              )}

            </div>

          </div>


          {/* TIP */}

          <div className="interview-tips">

            <div className="tip-icon">
              💡
            </div>

            <div>

              <h3>
                Interview Tip
              </h3>

              <p>
                Keep your answer clear and
                structured. Explain the concept
                with a simple example whenever
                possible.
              </p>

            </div>

          </div>

        </section>

      )}


      {/* =====================================
          RESULT
      ====================================== */}

      {started && finished && (

        <section className="interview-result">

          <div className="result-icon">
            🎉
          </div>

          <p className="section-tag">
            INTERVIEW COMPLETE
          </p>

          <h2>
            Great Job!
          </h2>

          <p className="result-subtitle">
            You completed the{" "}
            <strong>{category}</strong>{" "}
            interview at{" "}
            <strong>{difficulty}</strong>{" "}
            level.
          </p>


          <div
            className="final-score-circle"
            style={{
              "--result-score": score,
            }}
          >

            <span>
              {score}%
            </span>

          </div>


          <h3>
            {getScoreMessage()}
          </h3>


          {/* SUMMARY */}

          <div className="result-summary">

            <div>

              <strong>
                {questions.length}
              </strong>

              <span>
                Questions
              </span>

            </div>


            <div>

              <strong>
                {
                  Object.keys(
                    submittedAnswers
                  ).length
                }
              </strong>

              <span>
                Attempted
              </span>

            </div>


            <div>

              <strong>
                {score}%
              </strong>

              <span>
                Score
              </span>

            </div>

          </div>


          {/* ACTIONS */}

          <div className="result-actions">

            <button
              type="button"
              className="primary-action"
              onClick={handleRestart}
            >
              Practice Again
            </button>

            <button
              type="button"
              className="secondary-action"
              onClick={handleBack}
            >
              Change Category
            </button>

          </div>

        </section>

      )}

    </main>
  );
}

export default InterviewPrep;