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
   📘 Subject Page
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
  const { user } = useAuth();
  const navigate = useNavigate();

  const hasAccess = useMemo(
    () =>
      user?.role === "admin" ||
      user?.purchasedSubjects?.map(String).includes(String(subjectId)),
    [user, subjectId]
  );

  // ✅ Load chapters
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

  // ✅ Load chapter PDFs
  async function loadChapterPdfs(chapterId) {
    try {
      const { data } = await api.get(`/admin/chapters/${chapterId}/pdfs`);
      setChapterPdfs(data);
    } catch (err) {
      console.error("Failed to load chapter PDFs:", err);
      setChapterPdfs({});
    }
  }

  // ✅ Load questions + PDFs
  useEffect(() => {
    if (!selectedChapter) return;
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
  }, [selectedChapter, type]);

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
                const offcanvas = document.querySelector("#chaptersMenu");
                const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
                bsOffcanvas?.hide();
              }}
              hasAccess={hasAccess}
              navigate={navigate}
              subjectId={subjectId}
            />
          </div>
        </div>

        {/* ====== Main Content ====== */}
        <div className="col-md-9">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0 text-success">
                  <FaLightbulb className="me-2" />
                  {type} Questions
                </h5>
                <div className="btn-group">
                  <button
                    className={`btn btn-sm ${type === "Expected" ? "btn-primary" : "btn-outline-primary"
                      }`}
                    onClick={() => setType("Expected")}
                  >
                    Expected
                  </button>
                  <button
                    className={`btn btn-sm ${type === "PYQ" ? "btn-primary" : "btn-outline-primary"
                      }`}
                    onClick={() => setType("PYQ")}
                  >
                    PYQ
                  </button>
                </div>
              </div>

              {/* ====== Loading / Locked / Empty ====== */}
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

              {/* ====== Question List ====== */}
              <div className="vstack gap-3">
                {questions.map((q, idx) => (
                  <QuestionCard key={q._id} q={q} sno={idx} />
                ))}
              </div>

              {/* ====== Chapter PDF Buttons ====== */}
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
                  <button
                    className="btn btn-outline-primary fw-semibold"
                    onClick={() => {
                      setPdfType("mock");
                      setShowPdfModal(true);
                    }}
                  >
                    <FaFilePdf className="me-2" />
                    Mock Test
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====== Modal for PDFs ====== */}
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
function Sidebar({ chapters, selectedChapter, setSelectedChapter, hasAccess, navigate, subjectId }) {
  return (
    <div className="card shadow-sm border-0 h-100 bg-light">
      <div className="card-body">
        <h5 className="fw-bold mb-3 text-dark">
          <FaBookOpen className="me-2 text-success" />
          Chapters
        </h5>
        <div className="list-group small">
          {chapters.map((c) => (
            <button
              key={c._id}
              className={`list-group-item list-group-item-action ${c._id === selectedChapter ? "active" : ""
                }`}
              style={{
                backgroundColor: c._id === selectedChapter ? "#0d6efd" : "#f8f9fa",
                color: c._id === selectedChapter ? "#fff" : "#000",
              }}
              onClick={() => setSelectedChapter(c._id)}
            >
              {c.name}
            </button>
          ))}
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
                {!isSelected && isAnswer && showAnswer && (
                  <FaCheckCircle className="text-success" />
                )}
              </li>
            );
          })}
        </ul>

        <div className="d-flex gap-3 mt-3 flex-wrap">
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => setShowAnswer((prev) => !prev)}
          >
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setShowExplain((prev) => !prev)}
          >
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
            <div className="mt-2">{q.explanation || "No explanation"}</div>
            {q.imageUrl && (
              <div className="mt-3">
                <img
                  src={q.imageUrl}
                  alt="Question illustration"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    borderRadius: "8px",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


function ChapterPdfsModal({ show, onClose, pdfs, type }) {
  if (!show) return null;

  // ✅ Correct handling for new backend response
  const list =
    type === "study"
      ? pdfs.studyMaterials || []
      : pdfs.mockTests || [];

  return (
    <div
      className="modal fade show"
      style={{ display: "block", background: "rgba(0,0,0,0.6)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-4 border-0 shadow-lg">
          <div
            className={`modal-header ${type === "study" ? "bg-success" : "bg-primary"
              } text-white rounded-top-4`}
          >
            <h5 className="modal-title">
              <FaFilePdf className="me-2" />
              {type === "study" ? "Study Material" : "Mock Test"} PDFs
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            {list.length === 0 ? (
              <div className="text-center text-muted py-3">
                No {type === "study" ? "Study Materials" : "Mock Tests"} available.
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
                          className={`btn btn-sm ${type === "study"
                            ? "btn-outline-success"
                            : "btn-outline-primary"
                            }`}
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

