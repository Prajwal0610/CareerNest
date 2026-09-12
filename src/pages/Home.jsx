import { Link } from "react-router-dom";
import "./Home.css";
import JobCategories from "../components/JobCategories";
import HowItWorks from "../components/HowItWorks";
import WhyChooseUs from "../components/WhyChooseUs";
import CareerCTA from "../components/CareerCTA";

function Home() {
  return (
    <main className="home">

      {/* Hero Section */}
      <section className="hero-section">

        <div className="hero-content">

          <p className="hero-tag">
            YOUR CAREER. YOUR FUTURE.
          </p>

          <h1>
            Build Your Career.
            <br />
            Find Your <span>Future.</span>
          </h1>

          <p className="hero-description">
            CareerNest helps you discover the right jobs, build a professional
            resume, improve your skills, and prepare for your dream career —
            all in one place.
          </p>

          <div className="hero-buttons">

            <Link
              to="/jobs"
              className="primary-btn"
            >
              Find Jobs →
            </Link>

            <Link
              to="/resume"
              className="secondary-btn"
            >
              Build Your Resume
            </Link>

          </div>

          <div className="hero-trust">

            <div>
              <strong>10K+</strong>
              <span>Jobs</span>
            </div>

            <div>
              <strong>5K+</strong>
              <span>Students</span>
            </div>

            <div>
              <strong>1K+</strong>
              <span>Companies</span>
            </div>

          </div>

        </div>

        {/* Hero Visual */}
        <div className="hero-visual">

          <div className="career-card main-card">

            <div className="card-icon">
              💼
            </div>

            <h3>
              Find Your Dream Job
            </h3>

            <p>
              Discover opportunities that match your skills.
            </p>

            <div className="mini-job">

              <div className="job-logo">
                J
              </div>

              <div>
                <strong>
                  Junior Developer
                </strong>

                <span>
                  Remote • Full Time
                </span>
              </div>

            </div>

            <div className="mini-job">

              <div className="job-logo">
                D
              </div>

              <div>
                <strong>
                  Data Analyst
                </strong>

                <span>
                  Pune • Full Time
                </span>
              </div>

            </div>

          </div>

          <div className="floating-card">

            <span>
              Resume Score
            </span>

            <strong>
              92%
            </strong>

            <small>
              Excellent Profile
            </small>

          </div>

          <div className="floating-card second">

            <span>
              Career Progress
            </span>

            <strong>
              78%
            </strong>

            <small>
              Keep going!
            </small>

          </div>

        </div>

      </section>

      {/* Job Categories */}
      <JobCategories />

      {/* How It Works */}
      <HowItWorks />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Career CTA */}
      <CareerCTA />

    </main>
  );
}

export default Home;