import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserPlus,
  FaSignInAlt,
  FaGraduationCap,
} from "react-icons/fa";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { ok, message } = await login({ ...form, isRegister });
    if (!ok) return setError(message);
    navigate(from);
  };

  return (
    <div className="container py-5">
      <div className="row align-items-center justify-content-center">
        {/* Illustration Section (Left side) */}
        <div className="col-lg-6 text-center d-none d-lg-block">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2920/2920259.png"
            alt="LTPrep"
            className="img-fluid mb-4"
            style={{ maxWidth: "380px" }}
          />
          <h2 className="fw-bold text-success">LTPrep</h2>
          <p className="text-muted">
            {isRegister
              ? "Join thousands of learners — start your journey now."
              : "Login to continue your learning adventure."}
          </p>
        </div>

        {/* Form Section (Right side) */}
        <div className="col-lg-5 col-md-8">
          <div className="card border-0 shadow-lg rounded-4 p-4">
            <div className="card-body">
              <h3 className="fw-bold text-center mb-3">
                {isRegister ? (
                  <>
                    <FaUserPlus className="me-2 text-success" /> Student Register
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="me-2 text-primary" /> Login
                  </>
                )}
              </h3>

              {error && (
                <div className="alert alert-danger text-center py-2">{error}</div>
              )}

              <form onSubmit={onSubmit}>
                {isRegister && (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Full Name</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaUser />
                        </span>
                        <input
                          className="form-control"
                          name="name"
                          placeholder="Enter your full name"
                          onChange={onChange}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <FaEnvelope />
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="example@email.com"
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <FaLock />
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      placeholder="********"
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>

                <button
                  className={`btn w-100 py-2 ${
                    isRegister ? "btn-success" : "btn-primary"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Please wait...
                    </>
                  ) : isRegister ? (
                    <>
                      <FaUserPlus className="me-2" /> Create Account
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="me-2" /> Login
                    </>
                  )}
                </button>
              </form>

              <hr className="my-4" />

              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-link text-decoration-none"
                  onClick={() => setIsRegister((v) => !v)}
                >
                  {isRegister ? (
                    <>
                      Already have an account?{" "}
                      <span className="fw-bold text-primary">Login</span>
                    </>
                  ) : (
                    <>
                      New here?{" "}
                      <span className="fw-bold text-success">Register</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
