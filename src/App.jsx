import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import ApplyJob from "./pages/ApplyJob";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeTemplates from "./pages/ResumeTemplates";

import SkillAnalyzer from "./pages/SkillAnalyzer";
import InterviewPrep from "./pages/InterviewPrep";

import MyApplications from "./pages/MyApplications";

import AdminDashboard from "./pages/AdminDashboard";

import Footer from "./components/Footer";

import ProtectedRoute from "./ProtectedRoute";


function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* PUBLIC ROUTES */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/jobs"
          element={<Jobs />}
        />

        <Route
          path="/jobs/:id"
          element={<JobDetails />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* PROTECTED ROUTES */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/jobs/:id/apply"
            element={<ApplyJob />}
          />

          <Route
            path="/resume"
            element={<ResumeBuilder />}
          />

          <Route
            path="/resume-templates"
            element={<ResumeTemplates />}
          />

          <Route
            path="/skills"
            element={<SkillAnalyzer />}
          />

          <Route
            path="/interview-prep"
            element={<InterviewPrep />}
          />

          <Route
            path="/my-applications"
            element={<MyApplications />}
          />

          {/* ADMIN DASHBOARD */}

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

        </Route>

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}

export default App;