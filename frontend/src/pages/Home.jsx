import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaBookOpen,
  FaCheckCircle,
  FaChalkboardTeacher,
  FaLaptopCode,
  FaUserGraduate,
  FaArrowRight,
} from "react-icons/fa";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container">
      {/* 🌟 Hero Section */}
      <section className="text-center py-5 mb-5">
        <div className="mb-4">
          <FaBookOpen className="text-success display-3 mb-3" />
        </div>
        <h1 className="fw-bold mb-3">Welcome to <span className="text-success">LTPrep</span></h1>
        <p className="text-muted fs-5 mb-4">
          Your one-stop destination for <strong>MCQs</strong>, <strong>PYQs</strong>, and <strong>detailed explanations</strong> —
          learn smarter, not harder.
        </p>

        {!user ? (
          <div>
            <Link to="/login" className="btn btn-success btn-lg px-4 me-2">
              <FaUserGraduate className="me-2" /> Create Account
            </Link>
            <Link to="/login" className="btn btn-outline-success btn-lg px-4">
              <FaArrowRight className="me-2" /> Login
            </Link>
          </div>
        ) : (
          <div>
            <h5 className="text-success mb-4">
              Welcome back, {user.name}! Ready to continue your learning?
            </h5>
            <Link to="/subjects" className="btn btn-success btn-lg px-5">
              <FaBookOpen className="me-2" /> Continue Learning
            </Link>
          </div>
        )}
      </section>

      {/* 📘 Features Section */}
      <section className="row text-center gy-4 mb-5">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100 p-3">
            <div className="card-body">
              <FaLaptopCode className="text-primary display-5 mb-3" />
              <h5 className="fw-bold mb-2">Interactive Learning</h5>
              <p className="text-muted small">
                Learn chapter-wise through curated questions with instant feedback and detailed explanations.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100 p-3">
            <div className="card-body">
              <FaChalkboardTeacher className="text-success display-5 mb-3" />
              <h5 className="fw-bold mb-2">Admin Panel</h5>
              <p className="text-muted small">
                Manage subjects, chapters, and questions with an intuitive interface (for admin users only).
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100 p-3">
            <div className="card-body">
              <FaCheckCircle className="text-warning display-5 mb-3" />
              <h5 className="fw-bold mb-2">Track Your Progress</h5>
              <p className="text-muted small">
                See what you’ve completed, which subjects you own, and review your past questions anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🧠 Stats Section */}
      <section className="bg-light rounded-3 py-5 px-4 mb-5 text-center shadow-sm">
        <h3 className="fw-bold mb-4">Why Choose <span className="text-success">LTPrep</span>?</h3>
        <div className="row">
          <div className="col-md-3 col-6 mb-3">
            <h2 className="text-success fw-bold">50+</h2>
            <p className="text-muted small">Subjects Covered</p>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <h2 className="text-success fw-bold">5000+</h2>
            <p className="text-muted small">MCQs & PYQs</p>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <h2 className="text-success fw-bold">100%</h2>
            <p className="text-muted small">Detailed Explanations</p>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <h2 className="text-success fw-bold">24/7</h2>
            <p className="text-muted small">Learning Access</p>
          </div>
        </div>
      </section>

      {/* 🚀 Call-to-Action Section */}
      <section className="text-center py-5">
        {!user ? (
          <>
            <h3 className="fw-bold mb-3">Start Your Learning Journey Today</h3>
            <p className="text-muted mb-4">Sign up to access all subjects, chapters, and premium practice sets.</p>
            <Link to="/register" className="btn btn-success btn-lg px-5">
              Join Now <FaArrowRight className="ms-2" />
            </Link>
          </>
        ) : (
          <>
            <h3 className="fw-bold mb-3 text-success">Welcome back, {user.name}!</h3>
            <p className="text-muted mb-4">Pick up right where you left off — your progress is saved automatically.</p>
            <Link to="/subjects" className="btn btn-outline-success btn-lg px-5">
              Continue Learning <FaArrowRight className="ms-2" />
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
