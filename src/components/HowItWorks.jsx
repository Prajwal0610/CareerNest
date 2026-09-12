import "./HowItWorks.css";

function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: "👤",
      title: "Create Your Profile",
      description:
        "Add your education, skills, interests, and career preferences to create your professional profile.",
    },
    {
      number: "02",
      icon: "🔎",
      title: "Discover Opportunities",
      description:
        "Explore jobs and career opportunities that match your skills, experience, and career goals.",
    },
    {
      number: "03",
      icon: "📄",
      title: "Build Your Resume",
      description:
        "Create a professional, job-ready resume using our simple and powerful resume builder.",
    },
    {
      number: "04",
      icon: "🚀",
      title: "Prepare & Apply",
      description:
        "Practice interviews, improve your skills, and confidently apply for your dream jobs.",
    },
  ];

  return (
    <section className="how-section">
      <div className="how-container">

        <div className="section-heading how-heading">
          <p className="section-tag">HOW IT WORKS</p>

          <h2>
            Your Career Journey,
            <span> Simplified.</span>
          </h2>

          <p>
            CareerNest brings everything you need to build a successful career
            into one simple platform.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step) => (
            <div className="step-card" key={step.number}>

              <div className="step-top">
                <span className="step-number">{step.number}</span>

                <div className="step-icon">
                  {step.icon}
                </div>
              </div>

              <h3>{step.title}</h3>

              <p>{step.description}</p>

              <div className="step-line"></div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;