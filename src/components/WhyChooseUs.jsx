import "./WhyChooseUs.css";

function WhyChooseUs() {
  const features = [
    {
      icon: "🎯",
      title: "Personalized Career Guidance",
      description:
        "Get career recommendations based on your skills, interests, and professional goals.",
    },
    {
      icon: "💼",
      title: "Smart Job Discovery",
      description:
        "Find relevant job opportunities using smart search, categories, and personalized recommendations.",
    },
    {
      icon: "📄",
      title: "Professional Resume Builder",
      description:
        "Create a clean, professional resume that highlights your strongest skills and experience.",
    },
    {
      icon: "🧠",
      title: "Skill Gap Analysis",
      description:
        "Understand which skills you need to develop for the career or job you want.",
    },
    {
      icon: "🎤",
      title: "Interview Preparation",
      description:
        "Practice common interview questions and improve your confidence before applying.",
    },
    {
      icon: "📊",
      title: "Career Progress Tracking",
      description:
        "Track your learning, applications, skills, and overall career progress from one dashboard.",
    },
  ];

  return (
    <section className="why-section">
      <div className="why-container">

        <div className="why-content">
          <p className="section-tag">WHY CAREERNEST?</p>

          <h2>
            Everything You Need
            <span> To Grow.</span>
          </h2>

          <p className="why-description">
            From discovering the right opportunity to preparing for your
            interview, CareerNest gives you the tools and guidance you need
            throughout your career journey.
          </p>

          <div className="why-highlight">
            <strong>One Platform.</strong>
            <span>Complete Career Support.</span>
          </div>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>

              <div className="feature-icon">
                {feature.icon}
              </div>

              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default WhyChooseUs;