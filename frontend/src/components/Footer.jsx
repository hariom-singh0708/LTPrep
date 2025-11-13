import { Link } from "react-router-dom";
import { FaBookOpen, FaArrowRight } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white border-top mt-5 pt-5 pb-4">
      <div className="container px-3 px-md-4">

        {/* Top Section */}
        <div className="row gy-4 text-center text-md-start">

          {/* Brand Section */}
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2 mb-3 justify-content-center justify-content-md-start">
              <FaBookOpen className="text-primary fs-3" />
              <h4 className="fw-bold text-primary m-0">LTPrep</h4>
            </div>

            <p className="text-muted small lh-base">
              A modern learning platform designed for students — offering
              structured study materials, mock tests, PYQs, and expected
              questions for smarter exam preparation.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4">
            <h6 className="fw-bold mb-3 text-dark text-center text-md-start">Quick Links</h6>

            <ul className="list-unstyled m-0 text-center text-md-start">
              <li className="mb-2">
                <Link className="text-muted text-decoration-none footer-link" to="/about">
                  <FaArrowRight className="me-1 text-primary small" /> About Us
                </Link>
              </li>

              <li className="mb-2">
                <Link className="text-muted text-decoration-none footer-link" to="/terms">
                  <FaArrowRight className="me-1 text-primary small" /> Terms & Conditions
                </Link>
              </li>

              <li className="mb-2">
                <Link className="text-muted text-decoration-none footer-link" to="/privacy">
                  <FaArrowRight className="me-1 text-primary small" /> Privacy Policy
                </Link>
              </li>

              <li className="mb-2">
                <Link className="text-muted text-decoration-none footer-link" to="/refund">
                  <FaArrowRight className="me-1 text-primary small" /> Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Why LTPrep Section */}
          <div className="col-md-4">
            <h6 className="fw-bold mb-3 text-center text-md-start">Why LTPrep?</h6>

            <p className="text-muted small lh-base">
              • Clean & fast learning experience <br />
              • Verified and high-quality content <br />
              • Organized & structured study flow <br />
              • Secure & private user data <br />
              • Trusted by hundreds of learners
            </p>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-4" />

        {/* Bottom Section */}
        <div className="text-center text-muted small">
          <div>
            © {new Date().getFullYear()} <strong>LTPrep</strong>. Crafted with care for learners.
          </div>

          {/* Gradient Line */}
          <div
            className="mt-3 mx-auto"
            style={{
              width: "160px",
              height: "4px",
              borderRadius: "20px",
              background:
                "linear-gradient(90deg, #0d6efd, #6610f2, #d63384, #20c997)",
            }}
          ></div>
        </div>
      </div>
    </footer>
  );
}
