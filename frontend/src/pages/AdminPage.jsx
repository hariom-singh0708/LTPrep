import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import {
  FaBook,
  FaListAlt,
  FaQuestionCircle,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCubes,
} from "react-icons/fa";

/* =========================
   TOP-LEVEL ADMIN PAGE
   ========================= */
export default function AdminPage() {
  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4 text-center text-primary">
        <FaCubes className="me-2" />
        Admin Dashboard
      </h2>

      {/* Row 1: Add Subject + Add Chapter */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <AddSubject />
        </div>
        <div className="col-md-6">
          <AddChapter />
        </div>
      </div>

      {/* Row 2: Add Question */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <AddQuestion />
        </div>
      </div>

      {/* Row 3: Manage Tables */}
      <div className="row g-4">
        <div className="col-12">
          <ManageData />
        </div>
      </div>
    </div>
  );
}

/* =========================
   ADD SUBJECT
   ========================= */
function AddSubject() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [overview, setOverview] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const { data } = await api.post("/admin/subjects", {
        name,
        price: Number(price),
        overview, // ✅ send overview
      });
      setMsg(`✅ Subject "${data.name}" added`);
      setName("");
      setPrice(0);
      setOverview("");
      window.dispatchEvent(new CustomEvent("admin:refreshData"));
    } catch (e) {
      setMsg(`❌ ${e?.response?.data?.message || "Failed to add subject"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <h5 className="card-title text-primary d-flex align-items-center gap-2">
          <FaBook /> Add Subject
        </h5>
        {msg && (
          <div
            className={`alert ${
              msg.startsWith("✅") ? "alert-success" : "alert-danger"
            } py-2`}
          >
            {msg}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="mb-2">
            <label className="form-label">Subject Name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Price (₹)</label>
            <input
              type="number"
              className="form-control"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              required
            />
          </div>

          {/* ✅ New Overview Field */}
          <div className="mb-3">
            <label className="form-label">Overview / Syllabus</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Write a short description or syllabus for this subject"
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
            />
          </div>

          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Adding..." : "Add Subject"}
          </button>
        </form>
      </div>
    </div>
  );
}


/* =========================
   ADD CHAPTER
   ========================= */
function AddChapter() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/subjects");
        setSubjects(data);
        if (data[0]) setSubjectId(data[0]._id);
      } catch {}
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const { data } = await api.post("/admin/chapters", { subjectId, name });
      setMsg(`✅ Chapter "${data.name}" added`);
      setName("");
      window.dispatchEvent(new CustomEvent("admin:refreshData"));
    } catch (e) {
      setMsg(`❌ ${e?.response?.data?.message || "Failed to add chapter"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <h5 className="card-title text-success d-flex align-items-center gap-2">
          <FaListAlt /> Add Chapter
        </h5>
        {msg && (
          <div className={`alert ${msg.startsWith("✅") ? "alert-success" : "alert-danger"} py-2`}>
            {msg}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="mb-2">
            <label className="form-label">Select Subject</label>
            <select
              className="form-select"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Chapter Name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-success w-100" disabled={loading}>
            {loading ? "Adding..." : "Add Chapter"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================
   ADD QUESTION
   ========================= */
function AddQuestion() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [type, setType] = useState("Expected");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/subjects");
        setSubjects(data);
        if (data[0]) setSubjectId(data[0]._id);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!subjectId) return;
    (async () => {
      try {
        const { data } = await api.get(`/subjects/${subjectId}/chapters`);
        setChapters(data);
        if (data[0]) setChapterId(data[0]._id);
      } catch {}
    })();
  }, [subjectId]);

  const updateOption = (i, val) => {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? val : o)));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const payload = { chapterId, type, question, options, answer, explanation };
      await api.post("/admin/questions", payload);
      setMsg("✅ Question added");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setAnswer("");
      setExplanation("");
      window.dispatchEvent(new CustomEvent("admin:refreshData"));
    } catch (e) {
      setMsg(`❌ ${e?.response?.data?.message || "Failed to add question"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h5 className="card-title text-warning d-flex align-items-center gap-2">
          <FaQuestionCircle /> Add Question
        </h5>
        {msg && (
          <div className={`alert ${msg.startsWith("✅") ? "alert-success" : "alert-danger"} py-2`}>
            {msg}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Chapter</label>
              <select
                className="form-select"
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
              >
                {chapters.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Expected">Expected</option>
                <option value="PYQ">PYQ</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Question</label>
              <textarea
                className="form-control"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Options</label>
              {options.map((opt, i) => (
                <input
                  key={i}
                  className="form-control mb-2"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  required
                />
              ))}
            </div>

            <div className="col-md-6">
              <label className="form-label">Correct Answer</label>
              <input
                className="form-control"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Explanation (optional)</label>
              <textarea
                className="form-control"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
              />
            </div>

            <div className="col-12">
              <button className="btn btn-warning w-100" disabled={loading}>
                {loading ? "Adding..." : "Add Question"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================
   MANAGE TABLES (CRUD + CASCADE)
   ========================= */
function ManageData() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [chapters, setChapters] = useState([]);
  const [chapterId, setChapterId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // simple edit modal state
  const [editModal, setEditModal] = useState({ open: false, entity: null, type: "" });

  async function loadSubjects() {
    const { data } = await api.get("/subjects");
    setSubjects(data);
    if (!subjectId && data[0]) setSubjectId(data[0]._id);
  }

  async function loadChapters(sid = subjectId) {
    if (!sid) return setChapters([]);
    const { data } = await api.get(`/subjects/${sid}/chapters`);
    setChapters(data);
    if (!chapterId && data[0]) setChapterId(data[0]._id);
  }

  async function loadQuestions(cid = chapterId) {
    if (!cid) return setQuestions([]);
    const { data } = await api.get(`/chapters/${cid}/questions`, { params: { type: "Expected" } });
    // merge both types for admin list:
    let list = data?.questions || [];
    try {
      const pyq = await api.get(`/chapters/${cid}/questions`, { params: { type: "PYQ" } });
      list = [...list, ...(pyq.data?.questions || [])];
    } catch {}
    setQuestions(list);
  }

  useEffect(() => {
    loadSubjects();
    const refresh = () => {
      loadSubjects();
      loadChapters();
      loadQuestions();
    };
    window.addEventListener("admin:refreshData", refresh);
    return () => window.removeEventListener("admin:refreshData", refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (subjectId) loadChapters(subjectId);
    else setChapters([]);
    setChapterId("");
    setQuestions([]);
  }, [subjectId]);

  useEffect(() => {
    if (chapterId) loadQuestions(chapterId);
    else setQuestions([]);
  }, [chapterId]);

  /* ---------- UPDATE ---------- */
  async function handleUpdate(type, entity) {
    try {
      if (type === "subject") {
        await api.put(`/admin/subjects/${entity._id}`, { name: entity.name, price: entity.price });
        await loadSubjects();
      } else if (type === "chapter") {
        await api.put(`/admin/chapters/${entity._id}`, { name: entity.name });
        await loadChapters();
      } else if (type === "question") {
        await api.put(`/admin/questions/${entity._id}`, entity);
        await loadQuestions();
      }
    } finally {
      setEditModal({ open: false, entity: null, type: "" });
    }
  }

  /* ---------- DELETE (CASCADE) ---------- */
  async function deleteQuestion(qid) {
    await api.delete(`/admin/questions/${qid}`);
  }

  async function deleteChapterCascade(cid) {
    setLoading(true);
    try {
      // try cascade endpoint first
      try {
        await api.delete(`/admin/chapters/${cid}`, { params: { cascade: 1 } });
      } catch {
        // manual cascade
        const qResExp = await api.get(`/chapters/${cid}/questions`, { params: { type: "Expected" } });
        const qResPyq = await api.get(`/chapters/${cid}/questions`, { params: { type: "PYQ" } });
        const allQs = [...(qResExp.data?.questions || []), ...(qResPyq.data?.questions || [])];
        for (const q of allQs) {
          await deleteQuestion(q._id);
        }
        await api.delete(`/admin/chapters/${cid}`);
      }
      await loadChapters();
      await loadQuestions();
    } finally {
      setLoading(false);
    }
  }

  async function deleteSubjectCascade(sid) {
    setLoading(true);
    try {
      // try cascade endpoint first
      try {
        await api.delete(`/admin/subjects/${sid}`, { params: { cascade: 1 } });
      } catch {
        // manual cascade: chapters -> questions -> subject
        const chapRes = await api.get(`/subjects/${sid}/chapters`);
        const chaps = chapRes.data || [];
        for (const ch of chaps) {
          await deleteChapterCascade(ch._id);
        }
        await api.delete(`/admin/subjects/${sid}`);
      }
      await loadSubjects();
      // reset filters if deleted selected subject
      if (sid === subjectId) {
        setSubjectId("");
        setChapters([]);
        setChapterId("");
        setQuestions([]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h5 className="card-title d-flex align-items-center gap-2">
          <FaCubes /> Manage Data
        </h5>

        {/* Filters */}
        <div className="row g-3 align-items-end mb-3">
          <div className="col-md-4">
            <label className="form-label">Subject</label>
            <select
              className="form-select"
              value={subjectId || ""}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">-- Select Subject --</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Chapter</label>
            <select
              className="form-select"
              value={chapterId || ""}
              onChange={(e) => setChapterId(e.target.value)}
              disabled={!chapters.length}
            >
              <option value="">-- Select Chapter --</option>
              {chapters.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4 d-flex gap-2">
            <button className="btn btn-outline-secondary w-100" onClick={() => {
              loadSubjects(); if (subjectId) loadChapters(subjectId); if (chapterId) loadQuestions(chapterId);
            }}>
              Refresh
            </button>
          </div>
        </div>

        {/* Subjects Table */}
        <h6 className="mt-3">Subjects</h6>
        <div className="table-responsive mb-4">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Price (₹)</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s, i) => (
                <tr key={s._id}>
                  <td>{i + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.price}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary"
                        onClick={() => setEditModal({ open: true, type: "subject", entity: { ...s } })}>
                        <FaEdit /> Edit
                      </button>
                      <button className="btn btn-outline-danger"
                        onClick={() => confirmAction(`Delete subject "${s.name}" and all its chapters & questions?`,
                          () => deleteSubjectCascade(s._id))}>
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!subjects.length && (
                <tr><td colSpan="4" className="text-center text-muted">No subjects</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Chapters Table */}
        <h6>Chapters {subjectId ? <small className="text-muted">(in selected subject)</small> : null}</h6>
        <div className="table-responsive mb-4">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Chapter Name</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((c, i) => (
                <tr key={c._id}>
                  <td>{i + 1}</td>
                  <td>{c.name}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary"
                        onClick={() => setEditModal({ open: true, type: "chapter", entity: { ...c } })}>
                        <FaEdit /> Edit
                      </button>
                      <button className="btn btn-outline-danger"
                        onClick={() => confirmAction(`Delete chapter "${c.name}" and all its questions?`,
                          () => deleteChapterCascade(c._id))}>
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!chapters.length && (
                <tr><td colSpan="3" className="text-center text-muted">No chapters</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Questions Table */}
        <h6>Questions {chapterId ? <small className="text-muted">(in selected chapter)</small> : null}</h6>
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Question</th>
                <th>Answer</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, i) => (
                <tr key={q._id}>
                  <td>{i + 1}</td>
                  <td><span className={`badge ${q.type === "PYQ" ? "text-bg-primary" : "text-bg-secondary"}`}>{q.type}</span></td>
                  <td className="text-truncate" style={{ maxWidth: 420 }}>{q.question}</td>
                  <td className="text-truncate" style={{ maxWidth: 200 }}>{q.answer}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary"
                        onClick={() => setEditModal({ open: true, type: "question", entity: { ...q } })}>
                        <FaEdit /> Edit
                      </button>
                      <button className="btn btn-outline-danger"
                        onClick={() => confirmAction("Delete this question?", async () => {
                          await api.delete(`/admin/questions/${q._id}`);
                          await loadQuestions();
                        })}>
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!questions.length && (
                <tr><td colSpan="5" className="text-center text-muted">No questions</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && <p className="text-muted mt-3">Processing...</p>}

        {/* Edit Modal */}
        {editModal.open && (
          <EditModal
            type={editModal.type}
            entity={editModal.entity}
            onClose={() => setEditModal({ open: false, entity: null, type: "" })}
            onSave={(ent) => handleUpdate(editModal.type, ent)}
          />
        )}
      </div>
    </div>
  );
}

/* ============ helpers ============ */
function confirmAction(msg, fn) {
  if (window.confirm(msg)) fn();
}

/* =========================
   EDIT MODAL (SUBJECT/CHAPTER/QUESTION)
   ========================= */
function EditModal({ type, entity, onClose, onSave }) {
  const [form, setForm] = useState({ ...entity });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const title =
    type === "subject"
      ? "Edit Subject"
      : type === "chapter"
      ? "Edit Chapter"
      : "Edit Question";

  const onSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,.35)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={onSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              {type === "subject" && (
                <>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label">Name</label>
                      <input
                        className="form-control"
                        value={form.name || ""}
                        onChange={(e) => set("name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Price (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.price ?? 0}
                        onChange={(e) => set("price", Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  {/* ✅ Overview Textarea */}
                  <div className="mt-3">
                    <label className="form-label">Overview / Syllabus</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Enter or edit overview for this subject"
                      value={form.overview || ""}
                      onChange={(e) => set("overview", e.target.value)}
                    />
                  </div>
                </>
              )}

              {type === "chapter" && (
                <div className="mb-3">
                  <label className="form-label">Chapter Name</label>
                  <input
                    className="form-control"
                    value={form.name || ""}
                    onChange={(e) => set("name", e.target.value)}
                    required
                  />
                </div>
              )}

              {type === "question" && (
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={form.type || "Expected"}
                      onChange={(e) => set("type", e.target.value)}
                    >
                      <option value="Expected">Expected</option>
                      <option value="PYQ">PYQ</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Question</label>
                    <textarea
                      className="form-control"
                      value={form.question || ""}
                      onChange={(e) => set("question", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Options</label>
                    {(form.options || ["", "", "", ""]).map((opt, i) => (
                      <input
                        key={i}
                        className="form-control mb-2"
                        value={opt}
                        onChange={(e) => {
                          const copy = [...(form.options || ["", "", "", ""])];
                          copy[i] = e.target.value;
                          set("options", copy);
                        }}
                      />
                    ))}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Answer</label>
                    <input
                      className="form-control"
                      value={form.answer || ""}
                      onChange={(e) => set("answer", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Explanation</label>
                    <textarea
                      className="form-control"
                      value={form.explanation || ""}
                      onChange={(e) => set("explanation", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <FaPlus className="me-2" /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
