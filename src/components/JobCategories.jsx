import "./JobCategories.css";
function JobCategories() {
  const categories = [
    {
      icon: "💻",
      title: "Software Development",
      jobs: "2,450+ Jobs",
    },
    {
      icon: "📊",
      title: "Data Science & Analytics",
      jobs: "1,280+ Jobs",
    },
    {
      icon: "🎨",
      title: "UI/UX Design",
      jobs: "860+ Jobs",
    },
    {
      icon: "☁️",
      title: "Cloud & DevOps",
      jobs: "1,120+ Jobs",
    },
    {
      icon: "📱",
      title: "Mobile Development",
      jobs: "740+ Jobs",
    },
    {
      icon: "📈",
      title: "Marketing & Business",
      jobs: "1,560+ Jobs",
    },
  ];

  return (
    <section className="categories-section">
      <div className="categories-container">

        <div className="section-heading">
          <p className="section-tag">EXPLORE OPPORTUNITIES</p>

          <h2>
            Find Jobs That Match
            <span> Your Skills</span>
          </h2>

          <p>
            Explore popular career categories and discover opportunities
            that fit your skills, interests, and career goals.
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <div className="category-card" key={category.title}>
              
              <div className="category-icon">
                {category.icon}
              </div>

              <h3>{category.title}</h3>

              <p>{category.jobs}</p>

              <button className="category-link">
                Explore Jobs →
              </button>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default JobCategories;