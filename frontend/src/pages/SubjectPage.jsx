import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  FaLock,
  FaBookOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaLightbulb,
  FaArrowRight,
  FaBars,
  FaDownload,
  FaFilePdf,
} from "react-icons/fa";

/* =========================
   📘 Subject Page (Fully Enhanced)
   ========================= */
export default function SubjectPage() {
  const { id: subjectId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [type, setType] = useState("Expected");
  const [questions, setQuestions] = useState([]);
  const [lockedInfo, setLockedInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chapterPdfs, setChapterPdfs] = useState({});
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfType, setPdfType] = useState(null);
  const [mockView, setMockView] = useState(null); // "pre" | "mains" | null
  const [mockTests, setMockTests] = useState([]);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  /* ✅ Check if user has access to this subject */
  const hasAccess = useMemo(() => {
    if (!user) return false;
    if (user.role === "admin") return true;
    const purchased = (user.purchasedSubjects || []).map(String);
    return purchased.includes(String(subjectId));
  }, [user, subjectId]);

  /* =========================
     📚 Load Chapters
     ========================= */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/subjects/${subjectId}/chapters`);
        setChapters(data);
        if (data.length) setSelectedChapter(data[0]._id);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [subjectId]);

  /* =========================
     📄 Load Chapter PDFs
     ========================= */
  async function loadChapterPdfs(chapterId) {
    try {
      const { data } = await api.get(`/admin/chapters/${chapterId}/pdfs`);
      setChapterPdfs(data);
    } catch (err) {
      console.error("Failed to load chapter PDFs:", err);
      setChapterPdfs({});
    }
  }

  /* =========================
     ❓ Load Questions + PDFs
     ========================= */
  useEffect(() => {
    if (!selectedChapter || mockView) return; // Skip if in mock test view

    (async () => {
      setLoading(true);
      setLockedInfo(null);
      try {
        const { data } = await api.get(`/chapters/${selectedChapter}/questions`, {
          params: { type },
        });
        setQuestions(data.questions || []);
        if (data.locked) setLockedInfo(data);
        await loadChapterPdfs(selectedChapter);
      } catch (e) {
        const msg = e?.response?.data?.message;
        setQuestions([]);
        if (msg) setLockedInfo({ locked: true, message: msg });
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedChapter, type, mockView]);

  /* =========================
     📘 Load Subject Mock Tests
     ========================= */
  useEffect(() => {
    if (!mockView) return;
    (async () => {
      try {
        const { data } = await api.get(`/admin/subjects/${subjectId}/mock-tests`);
        const filtered = (data.mockTests || []).filter((m) => m.type === mockView);
        setMockTests(filtered);
      } catch (err) {
        console.error("Error fetching mock tests", err);
        setMockTests([]);
      }
    })();
  }, [mockView, subjectId]);

  /* =========================
     🔁 Refresh user after purchase (optional)
     ========================= */
  useEffect(() => {
    const refreshUserAfterPurchase = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch (e) {
        console.error("Failed to refresh user data:", e);
      }
    };
    // Optional: uncomment if you reload after checkout
    // refreshUserAfterPurchase();
  }, [setUser]);

  /* =========================
     🧱 Render
     ========================= */
  return (
    <div className="container-fluid py-4">
      {/* ====== Mobile Header ====== */}
      <div className="d-flex justify-content-between align-items-center mb-3 d-md-none">
        <h5 className="fw-bold mb-0 text-success">
          <FaBookOpen className="me-2 text-success" />
          Chapters
        </h5>
        <button
          className="btn btn-outline-success btn-sm"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#chaptersMenu"
        >
          <FaBars /> All Chapters
        </button>
      </div>

      <div className="row g-4">
        {/* ====== Sidebar (Desktop) ====== */}
        <div className="col-md-3 d-none d-md-block">
          <Sidebar
            chapters={chapters}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
            hasAccess={hasAccess}
            navigate={navigate}
            subjectId={subjectId}
            setMockView={setMockView}
          />
        </div>

        {/* ====== Sidebar (Mobile - Offcanvas) ====== */}
        <div className="offcanvas offcanvas-start" tabIndex="-1" id="chaptersMenu">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title fw-bold">
              <FaBookOpen className="me-2 text-success" /> Chapters
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
          </div>
          <div className="offcanvas-body p-0">
            <Sidebar
              chapters={chapters}
              selectedChapter={selectedChapter}
              setSelectedChapter={(id) => {
                setSelectedChapter(id);
                setMockView(null);
                const offcanvas = document.querySelector("#chaptersMenu");
                const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
                bsOffcanvas?.hide();
              }}
              hasAccess={hasAccess}
              navigate={navigate}
              subjectId={subjectId}
              setMockView={setMockView}
            />
          </div>
        </div>

        {/* ====== Main Content ====== */}
        <div className="col-md-9">
          {mockView ? (
            <MockTestViewer
              mockView={mockView}
              mockTests={mockTests}
              setMockView={setMockView}
              hasAccess={hasAccess}
              subjectId={subjectId}
              navigate={navigate}
            />
          ) : (
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="fw-bold mb-0 text-success">
                    <FaLightbulb className="me-2" />
                    {type} Questions
                  </h5>
                  <div className="btn-group">
                    <button
                      className={`btn btn-sm ${
                        type === "Expected" ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => setType("Expected")}
                    >
                      Expected
                    </button>
                    <button
                      className={`btn btn-sm ${
                        type === "PYQ" ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => setType("PYQ")}
                    >
                      PYQ
                    </button>
                  </div>
                </div>

                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success"></div>
                    <p className="text-muted mt-2">Loading questions...</p>
                  </div>
                )}

                {!loading && lockedInfo?.message && (
                  <div className="alert alert-info text-center py-4">
                    <FaLock className="me-2" />
                    {lockedInfo.message}
                  </div>
                )}

                {!loading && !questions.length && !lockedInfo?.locked && (
                  <div className="text-center py-5">
                    <p className="text-muted mb-1">No questions found for this chapter.</p>
                  </div>
                )}

                <div className="vstack gap-3">
                  {questions.map((q, idx) => (
                    <QuestionCard key={q._id} q={q} sno={idx} />
                  ))}
                </div>

                {!loading && !lockedInfo?.locked && (
                  <div className="d-flex justify-content-center gap-3 mt-4">
                    <button
                      className="btn btn-outline-success fw-semibold"
                      onClick={() => {
                        setPdfType("study");
                        setShowPdfModal(true);
                      }}
                    >
                      <FaFilePdf className="me-2" />
                      Study Material
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====== Chapter PDFs Modal ====== */}
      {showPdfModal && (
        <ChapterPdfsModal
          show={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          pdfs={chapterPdfs}
          type={pdfType}
        />
      )}
    </div>
  );
}

/* =========================
   📚 Sidebar Component
   ========================= */
function Sidebar({ chapters, selectedChapter, setSelectedChapter, hasAccess, navigate, subjectId, setMockView }) {
  return (
    <div className="card shadow-sm border-0 h-100 bg-light">
      <div className="card-body d-flex flex-column">
        <h5 className="fw-bold mb-3 text-dark">
          <FaBookOpen className="me-2 text-success" />
          Chapters
        </h5>

        <div className="list-group small">
          {chapters.map((c) => (
            <button
              key={c._id}
              className={`list-group-item list-group-item-action ${
                c._id === selectedChapter ? "active" : ""
              }`}
              style={{
                backgroundColor: c._id === selectedChapter ? "#0d6efd" : "#f8f9fa",
                color: c._id === selectedChapter ? "#fff" : "#000",
              }}
              onClick={() => {
                setSelectedChapter(c._id);
                setMockView(null);
              }}
            >
              {c.name}
            </button>
          ))}

          {/* ====== Mock Tests ====== */}
          <div className="mt-3 px-2">
            <h6 className="fw-bold text-dark">Mock Tests</h6>
            <div className="d-flex flex-column gap-2 mt-2">
              <button
                className="btn btn-outline-primary btn-sm fw-semibold"
                onClick={() => setMockView("pre")}
              >
                Pre Mock Tests
              </button>
              <button
                className="btn btn-outline-success btn-sm fw-semibold"
                onClick={() => setMockView("mains")}
              >
                Mains Mock Tests
              </button>
            </div>
          </div>
        </div>

        {!hasAccess && (
          <div className="alert alert-warning mt-4 text-center">
            <FaLock className="me-1" />
            Course Locked
            <div className="mt-2">
              <button
                className="btn btn-sm btn-warning w-100 fw-semibold"
                onClick={() => navigate(`/checkout/${subjectId}`)}
              >
                <FaArrowRight className="me-1" />
                Unlock Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   📄 Mock Test Viewer (Locked if not purchased)
   ========================= */
function MockTestViewer({ mockView, mockTests, setMockView, hasAccess, subjectId, navigate }) {
  return (
    <div className="card border-0 shadow-lg rounded-4">
      {/* ===== Header ===== */}
      <div
        className={`card-header text-white fw-bold ${
          mockView === "pre" ? "bg-primary" : "bg-success"
        }`}
      >
        <FaFilePdf className="me-2" />
        {mockView === "pre" ? "Pre Mock Tests" : "Mains Mock Tests"}
      </div>

      <div className="card-body">
        {/* ===== If locked ===== */}
        {!hasAccess ? (
          <div className="alert alert-warning text-center py-5 rounded-3">
            <FaLock className="me-2" size={20} />
            These mock tests are locked.
            <div className="mt-3">
              <button
                className="btn btn-warning fw-semibold"
                onClick={() => navigate(`/checkout/${subjectId}`)}
              >
                <FaArrowRight className="me-2" />
                Unlock Now
              </button>
            </div>
          </div>
        ) : mockTests.length === 0 ? (
          /* ===== No mock tests ===== */
          <div className="text-center text-muted py-4">
            No {mockView} mock tests available.
          </div>
        ) : (
          /* ===== Grid Card Layout ===== */
          <div className="row g-4">
            {mockTests.map((m, idx) => (
              <div key={m._id} className="col-md-4 col-sm-6">
                <div className="card h-100 border-0 shadow-sm rounded-4">
                  <div className="card-body text-center d-flex flex-column justify-content-between">
                    <div>
                      <FaFilePdf
                        size={40}
                        className={`mb-3 ${mockView === "pre" ? "text-primary" : "text-success"}`}
                      />
                      <h6 className="fw-bold text-dark">{m.title}</h6>
                      <p className="text-muted small mb-0">
                        {mockView === "pre" ? "Pre Test" : "Mains Test"} #{idx + 1}
                      </p>
                    </div>

                    <div className="mt-3">
                      <a
                        href={m.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn btn-sm fw-semibold w-100 ${
                          mockView === "pre" ? "btn-outline-primary" : "btn-outline-success"
                        }`}
                      >
                        <FaDownload className="me-2" />
                        View / Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== Back Button ===== */}
        <button
          className="btn btn-secondary w-100 fw-semibold mt-4"
          onClick={() => setMockView(null)}
        >
          Back to Chapters
        </button>
      </div>
    </div>
  );
}


/* =========================
   ❓ Question Card Component
   ========================= */
function QuestionCard({ q, sno }) {
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const isCorrect = selected != null && q.options[selected] === q.answer;
  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <p className="fw-semibold mb-3">
          <span className="badge bg-success me-2">{sno + 1}</span>
          {q.question}
        </p>
        <ul className="list-group">
          {q.options.map((opt, idx) => {
            const isSelected = selected === idx;
            const isAnswer = opt === q.answer;
            const optionClass = isSelected
              ? isCorrect
                ? "list-group-item-success"
                : "list-group-item-danger"
              : "";
            return (
              <li
                key={idx}
                className={`list-group-item d-flex justify-content-between align-items-center ${optionClass}`}
                style={{ cursor: "pointer" }}
                onClick={() => setSelected(idx)}
              >
                <span>
                  <strong>{optionLetters[idx]}.</strong> {opt}
                </span>
                {isSelected &&
                  (isCorrect ? (
                    <FaCheckCircle className="text-success" />
                  ) : (
                    <FaTimesCircle className="text-danger" />
                  ))}
                {!isSelected && isAnswer && showAnswer && <FaCheckCircle className="text-success" />}
              </li>
            );
          })}
        </ul>

        <div className="d-flex gap-3 mt-3 flex-wrap">
          <button className="btn btn-sm btn-outline-success" onClick={() => setShowAnswer((p) => !p)}>
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </button>
          <button className="btn btn-sm btn-outline-primary" onClick={() => setShowExplain((p) => !p)}>
            {showExplain ? "Hide Explanation" : "Show Explanation"}
          </button>
        </div>

        {showAnswer && (
          <div className="alert alert-success mt-3">
            <strong>Answer:</strong> {q.answer}
          </div>
        )}

        {showExplain && (
          <div className="alert alert-info mt-3 text-center">
            <strong>Explanation:</strong>
            <div className="mt-2">{q.explanation || "No explanation available"}</div>
            {q.imageUrl && (
              <div className="mt-3">
                <img src={q.imageUrl} alt="Question Illustration" className="img-fluid rounded-3" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   📄 Chapter PDFs Modal
   ========================= */
function ChapterPdfsModal({ show, onClose, pdfs }) {
  if (!show) return null;

  const list = pdfs.studyMaterials || [];

  return (
    <div
      className="modal fade show"
      style={{ display: "block", background: "rgba(0,0,0,0.6)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-4 border-0 shadow-lg">
          {/* ===== Header ===== */}
          <div className="modal-header bg-success text-white rounded-top-4">
            <h5 className="modal-title">
              <FaFilePdf className="me-2" />
              Study Material PDFs
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          {/* ===== Body ===== */}
          <div className="modal-body">
            {list.length === 0 ? (
              <div className="text-center text-muted py-3">
                No Study Materials available.
              </div>
            ) : (
              <table className="table table-bordered align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>View / Download</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((pdf, idx) => (
                    <tr key={pdf._id || idx}>
                      <td>{idx + 1}</td>
                      <td>{pdf.title}</td>
                      <td>
                        <a
                          href={pdf.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-success"
                        >
                          <FaDownload className="me-1" /> View / Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ===== Footer ===== */}
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-secondary w-100 fw-semibold"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

