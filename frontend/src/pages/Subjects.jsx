import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaBookOpen,
  FaLock,
  FaUnlock,
  FaShoppingCart,
  FaChalkboardTeacher,
  FaSpinner,
} from "react-icons/fa";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/subjects");
        setSubjects(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]); // ✅ will re-render instantly after refreshUser()

  const isUnlocked = (id) =>
    Array.isArray(user?.purchasedSubjects) &&
    user.purchasedSubjects.map(String).includes(String(id));

  if (loading)
    return (
      <div className="text-center py-5">
        <FaSpinner className="fa-spin text-success display-6 mb-3" />
        <p className="text-muted">Loading subjects...</p>
      </div>
    );

  if (!subjects.length)
    return (
      <div className="text-center py-5">
        <FaBookOpen className="text-muted display-6 mb-3" />
        <p className="text-muted">No subjects available yet.</p>
      </div>
    );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-success d-flex align-items-center gap-2">
          <FaBookOpen /> Subjects
        </h3>
        {user?.role === "admin" && (
          <Link to="/admin" className="btn btn-outline-success btn-sm">
            <FaChalkboardTeacher className="me-2" />
            Go to Admin Panel
          </Link>
        )}
      </div>

      <div className="row g-4">
        {subjects.map((s) => {
          const unlocked = isUnlocked(s._id);
          return (
            <div key={s._id} className="col-md-4 col-sm-6">
              <div
                className="card border-0 shadow-sm h-100 rounded-4"
                style={{
                  transition: "all 0.3s ease-in-out",
                  overflow: "hidden",
                }}
              >
                <div
                  className="card-body d-flex flex-column"
                  style={{
                    background: unlocked
                      ? "linear-gradient(135deg, #e8f5e9, #ffffff)"
                      : "linear-gradient(135deg, #fff3e0, #ffffff)",
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="card-title fw-bold mb-0">{s.name}</h5>
                    {unlocked ? (
                      <FaUnlock className="text-success fs-4" />
                    ) : (
                      <FaLock className="text-warning fs-4" />
                    )}
                  </div>

                  <p className="text-muted mb-3">
                    <strong>Price:</strong> ₹{s.price}
                  </p>

                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <Link
                      to={`/subject/${s._id}`}
                      className={`btn ${
                        unlocked
                          ? "btn-outline-success"
                          : "btn-outline-primary"
                      } btn-sm`}
                    >
                      <FaBookOpen className="me-2" />
                      {unlocked ? "Open Course" : "Preview"}
                    </Link>

                    {unlocked ? (
                      <span className="badge bg-success-subtle text-success fw-semibold px-3 py-2 rounded-pill">
                        Unlocked
                      </span>
                    ) : (
                      <Link
                        to={`/checkout/${s._id}`}
                        className="btn btn-warning btn-sm fw-semibold d-flex align-items-center gap-2"
                      >
                        <FaShoppingCart /> Buy Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
