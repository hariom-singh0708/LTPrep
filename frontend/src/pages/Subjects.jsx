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
  FaInfoCircle,
  FaDownload,
  FaTimes,
} from "react-icons/fa";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
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
  }, [user]);

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

                  <div className="mt-auto d-flex justify-content-between align-items-center flex-wrap gap-2">
                    {/* Overview Button */}
                    <button
                      className="btn btn-outline-info btn-sm d-flex align-items-center gap-1"
                      onClick={() => setSelected(s)}
                    >
                      <FaInfoCircle /> Overview
                    </button>

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

      {/* Overview Modal */}
      {selected && (
        <OverviewModal subject={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

/* ===========================
   Overview Modal Component
   =========================== */
function OverviewModal({ subject, onClose }) {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content rounded-4 shadow-lg">
          <div className="modal-header bg-success text-white rounded-top-4">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <FaBookOpen /> {subject.name} – Overview
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {subject.overview ? (
              <p style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
                {subject.overview}
              </p>
            ) : (
              <p className="text-muted fst-italic">
                No overview provided for this subject.
              </p>
            )}

            {/* Download Overview as PDF */}
            <div className="text-end mt-4">
              <a
                href={`${apiBase}/subjects/${subject._id}/overview-pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success btn-sm d-inline-flex align-items-center gap-2"
              >
                <FaDownload /> Download Overview as PDF
              </a>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              <FaTimes /> Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
