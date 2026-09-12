import { Link } from "react-router-dom";
import "./CareerCTA.css";

function CareerCTA() {
  return (
    <section className="career-cta">
      <div className="career-cta-container">

        <div className="career-cta-content">
          <p className="section-tag">
            START YOUR JOURNEY
          </p>

          <h2>
            Ready to Take the
            <span> Next Step?</span>
          </h2>

          <p>
            Create your profile, discover the right opportunities, build your
            resume, and start moving toward the career you want.
          </p>

          <div className="career-cta-actions">

            <Link
              to="/resume"
              className="cta-primary"
            >
              Get Started →
            </Link>

            <Link
              to="/jobs"
              className="cta-secondary"
            >
              Explore Jobs
            </Link>

          </div>
        </div>

        <div className="career-cta-visual">

          <div className="cta-circle circle-one"></div>
          <div className="cta-circle circle-two"></div>

          <div className="cta-center-card">

            <div className="cta-icon">
              🚀
            </div>

            <strong>
              Your Career Starts Here
            </strong>

            <span>
              Take the first step today.
            </span>

          </div>

        </div>

      </div>
    </section>
  );
}

export default CareerCTA;