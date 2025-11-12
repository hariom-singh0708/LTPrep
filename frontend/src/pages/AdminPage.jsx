import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  FaBook,
  FaListAlt,
  FaQuestionCircle,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCubes,
  FaFilePdf,
  FaEye,
} from "react-icons/fa";

/* =========================
   ENHANCED ADMIN DASHBOARD
   ========================= */
export default function AdminPage() {
  return (
    <div
      className="container py-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(245,249,255,1) 0%, rgba(230,238,255,1) 100%)",
        borderRadius: "20px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
      }}
    >
      <h2 className="fw-bold mb-5 text-center text-primary">
        <FaCubes className="me-2" />
        Admin Dashboard
      </h2>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <AddSubject />
        </div>
        <div className="col-md-6">
          <AddChapter />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12">
          <AddSubjectMockTest /> {/* ✅ new section for mock tests */}
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12">
          <ChapterPdfsManagerWrapper />
        </div>
      </div>


      <div className="row g-4 mb-4">
        <div className="col-12">
          <AddQuestion />
        </div>
      </div>

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
  const [price, setPrice] = useState("");
  const [overview, setOverview] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const { data } = await api.post("/admin/subjects", {
        name,
        price: Number(price),
        overview,
      });
      setMsg(`✅ Subject "${data.name}" added successfully!`);
      setName("");
      setPrice("");
      setOverview("");
      window.dispatchEvent(new CustomEvent("admin:refreshData"));
    } catch (err) {
      setMsg(`❌ ${err?.response?.data?.message || "Failed to add subject"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-lg h-100 rounded-4">
      <div className="card-body p-4">
        <h5 className="card-title fw-bold text-primary mb-3">
          <FaBook className="me-2" />
          Add Subject
        </h5>
        {msg && (
          <div
            className={`alert ${msg.startsWith("✅") ? "alert-success" : "alert-danger"
              } py-2`}
          >
            {msg}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="subjectName"
              placeholder="Subject Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label htmlFor="subjectName">Subject Name</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="number"
              className="form-control"
              id="subjectPrice"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              required
            />
            <label htmlFor="subjectPrice">Price (₹)</label>
          </div>
          <div className="form-floating mb-3">
            <textarea
              className="form-control"
              id="subjectOverview"
              placeholder="Overview"
              style={{ height: "100px" }}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
            ></textarea>
            <label htmlFor="subjectOverview">Overview / Syllabus</label>
          </div>
          <button
            className="btn btn-primary w-100 fw-semibold py-2"
            disabled={loading}
          >
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
    api.get("/subjects").then(({ data }) => {
      setSubjects(data);
      if (data[0]) setSubjectId(data[0]._id);
    });
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const { data } = await api.post("/admin/chapters", { subjectId, name });
      setMsg(`✅ Chapter "${data.name}" added successfully!`);
      setName("");
      window.dispatchEvent(new CustomEvent("admin:refreshData"));
    } catch (err) {
      setMsg(`❌ ${err?.response?.data?.message || "Failed to add chapter"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-lg h-100 rounded-4">
      <div className="card-body p-4">
        <h5 className="card-title fw-bold text-success mb-3">
          <FaListAlt className="me-2" />
          Add Chapter
        </h5>
        {msg && (
          <div
            className={`alert ${msg.startsWith("✅") ? "alert-success" : "alert-danger"
              } py-2`}
          >
            {msg}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="form-floating mb-3">
            <select
              className="form-select"
              id="subjectSelect"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            <label htmlFor="subjectSelect">Select Subject</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="chapterName"
              placeholder="Chapter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label htmlFor="chapterName">Chapter Name</label>
          </div>
          <button
            className="btn btn-success w-100 fw-semibold py-2"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Chapter"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AddSubjectMockTest() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("pre");
  const [link, setLink] = useState("");
  const [mockTests, setMockTests] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch subjects for dropdown
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/subjects"); // You might need to expose a public route to get all subjects
        setSubjects(data);
      } catch (err) {
        console.error("Error fetching subjects", err);
      }
    })();
  }, []);

  // Fetch mock tests for selected subject
  useEffect(() => {
    if (!selectedSubject) return;
    (async () => {
      try {
        const { data } = await api.get(`/admin/subjects/${selectedSubject}/mock-tests`);
        setMockTests(data.mockTests || []);
      } catch (err) {
        setMockTests([]);
      }
    })();
  }, [selectedSubject]);

  const handleAddMockTest = async (e) => {
    e.preventDefault();
    if (!selectedSubject) return setMsg("⚠️ Please select a subject first.");
    setLoading(true);
    setMsg("");

    try {
      const { data } = await api.post(`/admin/subjects/${selectedSubject}/mock-test`, {
        title,
        type,
        link,
      });
      setMsg("✅ Mock test added successfully!");
      setTitle("");
      setType("pre");
      setLink("");
      setMockTests(data.subject.mockTests);
    } catch (err) {
      setMsg(`❌ ${err?.response?.data?.message || "Failed to add mock test"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMockTest = async (mockTestId) => {
    if (!window.confirm("Delete this mock test?")) return;
    try {
      await api.delete(`/admin/subjects/${selectedSubject}/mock-test/${mockTestId}`);
      setMockTests((prev) => prev.filter((m) => m._id !== mockTestId));
    } catch (err) {
      alert("Failed to delete mock test");
    }
  };

  return (
    <div className="card border-0 shadow-lg h-100 rounded-4">
      <div className="card-body p-4">
        <h5 className="card-title fw-bold text-primary mb-3">
          <FaFilePdf className="me-2" />
          Add Subject Mock Test (Pre / Mains)
        </h5>

        {msg && (
          <div
            className={`alert ${msg.startsWith("✅") ? "alert-success" : "alert-warning"
              } py-2`}
          >
            {msg}
          </div>
        )}

        {/* Select Subject */}
        <div className="form-floating mb-3">
          <select
            className="form-select"
            id="subjectSelect"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <label htmlFor="subjectSelect">Choose Subject</label>
        </div>

        {/* Form for Adding Mock Test */}
        <form onSubmit={handleAddMockTest}>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="mockTitle"
              placeholder="Mock Test Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <label htmlFor="mockTitle">Mock Test Title</label>
          </div>

          <div className="form-floating mb-3">
            <select
              className="form-select"
              id="mockType"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="pre">Pre Mock Test</option>
              <option value="mains">Mains Mock Test</option>
            </select>
            <label htmlFor="mockType">Mock Test Type</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="url"
              className="form-control"
              id="mockLink"
              placeholder="Google Drive Link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
            />
            <label htmlFor="mockLink">Google Drive Link</label>
          </div>

          <button
            className="btn btn-primary w-100 fw-semibold py-2"
            disabled={loading}
          >
            {loading ? "Adding..." : <><FaPlus className="me-2" />Add Mock Test</>}
          </button>
        </form>

        {/* Display Existing Mock Tests */}
        {mockTests.length > 0 && (
          <div className="mt-4">
            <h6 className="fw-bold text-secondary">Existing Mock Tests:</h6>
            <ul className="list-group mt-2">
              {mockTests.map((m) => (
                <li
                  key={m._id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <FaFilePdf className="text-danger me-2" />
                    <strong>{m.title}</strong> <span className="badge bg-info text-dark ms-2">{m.type}</span>
                    <a
                      href={m.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ms-3 text-decoration-none text-primary"
                    >
                      View
                    </a>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteMockTest(m._id)}
                  >
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}



/* =========================
   CHAPTER PDFs WRAPPER
   ========================= */
function ChapterPdfsManagerWrapper() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [chapters, setChapters] = useState([]);
  const [chapterId, setChapterId] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/subjects");
      setSubjects(data);
      if (data[0]) setSubjectId(data[0]._id);
    })();
  }, []);

  useEffect(() => {
    if (!subjectId) return;
    (async () => {
      const { data } = await api.get(`/subjects/${subjectId}/chapters`);
      setChapters(data);
      if (data[0]) setChapterId(data[0]._id);
    })();
  }, [subjectId]);

  return (
    <div className="card border-0 shadow-lg rounded-4">
      <div className="card-body p-4">
        <h5 className="card-title fw-bold text-danger mb-3">
          <FaFilePdf className="me-2" />
          Manage Chapter PDFs
        </h5>

        {/* Select Subject + Chapter */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="form-floating">
              <select
                className="form-select"
                id="pdfSubjectSelect"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <label htmlFor="pdfSubjectSelect">Select Subject</label>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-floating">
              <select
                className="form-select"
                id="pdfChapterSelect"
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
              >
                {chapters.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <label htmlFor="pdfChapterSelect">Select Chapter</label>
            </div>
          </div>
        </div>

        {chapterId && <ChapterPdfsManager chapterId={chapterId} />}
      </div>
    </div>
  );
}

/* =========================
   CHAPTER PDFs MANAGER
   ========================= */
function ChapterPdfsManager({ chapterId }) {
  const [pdfs, setPdfs] = useState({ studyMaterials: [], mockTests: [] });
  const [studyTitle, setStudyTitle] = useState("");
  const [studyUrl, setStudyUrl] = useState("");
  const [msg, setMsg] = useState("");

  async function loadPdfs() {
    try {
      const { data } = await api.get(`/admin/chapters/${chapterId}/pdfs`);
      setPdfs({
        studyMaterials: data.studyMaterials || [],
        mockTests: data.mockTests || [],
      });
    } catch (err) {
      console.error("Failed to load PDFs:", err);
    }
  }

  useEffect(() => {
    if (chapterId) loadPdfs();
  }, [chapterId]);

  // ✅ Add Study Material PDF
  async function addStudyMaterial(e) {
    e.preventDefault();
    try {
      await api.post(`/admin/chapters/${chapterId}/study-material`, {
        title: studyTitle,
        url: studyUrl,
      });
      setMsg("✅ Study Material added successfully!");
      setStudyTitle("");
      setStudyUrl("");
      await loadPdfs();
    } catch {
      setMsg("❌ Failed to add Study Material");
    }
  }

  // ✅ Delete PDF
  async function deletePdf(type, pdfId) {
    if (!confirm("Are you sure you want to delete this PDF?")) return;
    try {
      await api.delete(`/admin/chapters/${chapterId}/pdf/${type}/${pdfId}`);
      setMsg("✅ PDF deleted successfully");
      await loadPdfs();
    } catch {
      setMsg("❌ Failed to delete PDF");
    }
  }

  return (
    <div className="bg-light p-3 rounded-3 shadow-sm">
      {msg && (
        <div
          className={`alert ${msg.startsWith("✅") ? "alert-success" : "alert-danger"
            } py-2`}
        >
          {msg}
        </div>
      )}

      {/* =========================
          📘 Study Materials Section
      ========================= */}
      <h6 className="fw-bold text-success mt-3">Study Materials</h6>
      <form onSubmit={addStudyMaterial} className="row g-3 mb-3">
        <div className="col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="Title"
            value={studyTitle}
            onChange={(e) => setStudyTitle(e.target.value)}
            required
          />
        </div>
        <div className="col-md-5">
          <input
            type="url"
            className="form-control"
            placeholder="Google Drive Link"
            value={studyUrl}
            onChange={(e) => setStudyUrl(e.target.value)}
            required
          />
        </div>
        <div className="col-md-2 d-grid">
          <button className="btn btn-success fw-semibold">
            <FaPlus className="me-1" /> Add
          </button>
        </div>
      </form>

      {pdfs.studyMaterials.length > 0 ? (
        <table className="table table-bordered table-sm align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pdfs.studyMaterials.map((pdf, i) => (
              <tr key={pdf._id}>
                <td>{i + 1}</td>
                <td>{pdf.title}</td>
                <td>
                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-success me-2"
                  >
                    <FaEye /> View
                  </a>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deletePdf("study", pdf._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted small">No Study Materials added yet</p>
      )}
    </div>
  );
}



/* =========================
   ADD QUESTION (Enhanced)
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
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/subjects");
      setSubjects(data);
      if (data[0]) setSubjectId(data[0]._id);
    })();
  }, []);

  useEffect(() => {
    if (!subjectId) return;
    (async () => {
      const { data } = await api.get(`/subjects/${subjectId}/chapters`);
      setChapters(data);
      if (data[0]) setChapterId(data[0]._id);
    })();
  }, [subjectId]);

  const updateOption = (i, val) =>
    setOptions((prev) => prev.map((o, idx) => (idx === i ? val : o)));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const formData = new FormData();
      formData.append("chapterId", chapterId);
      formData.append("type", type);
      formData.append("question", question);
      formData.append("options", JSON.stringify(options));
      formData.append("answer", answer);
      formData.append("explanation", explanation);
      if (image) formData.append("image", image);

      await api.post("/admin/questions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg("✅ Question added successfully!");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setAnswer("");
      setExplanation("");
      setImage(null);
      setPreview(null);
      window.dispatchEvent(new CustomEvent("admin:refreshData"));
    } catch (err) {
      setMsg("❌ Failed to add question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="card border-0 shadow-lg rounded-4"
      style={{
        background:
          "linear-gradient(145deg, #fff8e1 0%, #fff3cd 100%)",
      }}
    >
      <div className="card-body p-4">
        <h5 className="card-title fw-bold text-warning mb-3">
          <FaQuestionCircle className="me-2" />
          Add Question
        </h5>

        {msg && (
          <div
            className={`alert ${msg.startsWith("✅") ? "alert-success" : "alert-danger"
              } py-2`}
          >
            {msg}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="form-floating">
                <select
                  className="form-select"
                  id="subjectSelect"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <label htmlFor="subjectSelect">Select Subject</label>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-floating">
                <select
                  className="form-select"
                  id="chapterSelect"
                  value={chapterId}
                  onChange={(e) => setChapterId(e.target.value)}
                >
                  {chapters.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <label htmlFor="chapterSelect">Select Chapter</label>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-floating">
                <select
                  className="form-select"
                  id="typeSelect"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Expected">Expected</option>
                  <option value="PYQ">PYQ</option>
                </select>
                <label htmlFor="typeSelect">Question Type</label>
              </div>
            </div>

            <div className="col-12">
              <div className="form-floating">
                <textarea
                  className="form-control"
                  id="question"
                  placeholder="Enter Question"
                  style={{ height: "90px" }}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                ></textarea>
                <label htmlFor="question">Question</label>
              </div>
            </div>

            {options.map((opt, i) => (
              <div className="col-md-6" key={i}>
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id={`option${i}`}
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    required
                  />
                  <label htmlFor={`option${i}`}>Option {i + 1}</label>
                </div>
              </div>
            ))}

            <div className="col-md-6">
              <div className="form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="answer"
                  placeholder="Answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                />
                <label htmlFor="answer">Correct Answer</label>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-floating">
                <textarea
                  className="form-control"
                  id="explanation"
                  placeholder="Explanation"
                  style={{ height: "80px" }}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                ></textarea>
                <label htmlFor="explanation">Explanation (optional)</label>
              </div>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold text-secondary">
                Upload Question Image (optional)
              </label>
              {preview && (
                <div className="mb-2 text-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="img-thumbnail shadow-sm"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "150px",
                      borderRadius: "10px",
                    }}
                  />
                </div>
              )}
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            <div className="col-12">
              <button
                className="btn btn-warning text-dark fw-semibold w-100 py-2"
                disabled={loading}
              >
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
   MANAGE DATA (Enhanced)
   ========================= */
function ManageData() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [chapters, setChapters] = useState([]);
  const [chapterId, setChapterId] = useState("");
  const [questions, setQuestions] = useState([]);

  async function loadSubjects() {
    const { data } = await api.get("/subjects");
    setSubjects(data);
    if (data[0]) setSubjectId(data[0]._id);
  }

  async function loadChapters(sid = subjectId) {
    if (!sid) return setChapters([]);
    const { data } = await api.get(`/subjects/${sid}/chapters`);
    setChapters(data);
    if (data[0]) setChapterId(data[0]._id);
  }

  async function loadQuestions(cid = chapterId) {
    if (!cid) return setQuestions([]);
    const { data } = await api.get(`/chapters/${cid}/questions`, {
      params: { type: "Expected" },
    });
    const pyq = await api.get(`/chapters/${cid}/questions`, {
      params: { type: "PYQ" },
    });
    setQuestions([...data.questions, ...pyq.data.questions]);
  }

  useEffect(() => {
    loadSubjects();
    window.addEventListener("admin:refreshData", () => {
      loadSubjects();
      if (subjectId) loadChapters(subjectId);
      if (chapterId) loadQuestions(chapterId);
    });
  }, []);

  useEffect(() => {
    if (subjectId) loadChapters(subjectId);
  }, [subjectId]);

  useEffect(() => {
    if (chapterId) loadQuestions(chapterId);
  }, [chapterId]);

  return (
    <div
      className="card border-0 shadow-lg rounded-4"
      style={{
        background: "linear-gradient(145deg, #f3e8ff 0%, #ede7f6 100%)",
      }}
    >
      <div className="card-body p-4">
        <h5 className="card-title fw-bold text-purple mb-4" style={{ color: "#6f42c1" }}>
          <FaCubes className="me-2" />
          Manage Data
        </h5>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="form-floating">
              <select
                className="form-select"
                id="manageSubject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <label htmlFor="manageSubject">Subject</label>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-floating">
              <select
                className="form-select"
                id="manageChapter"
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
              >
                <option value="">Select Chapter</option>
                {chapters.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <label htmlFor="manageChapter">Chapter</label>
            </div>
          </div>
          <div className="col-md-4 d-grid">
            <button
              className="btn btn-outline-dark fw-semibold"
              onClick={() => {
                if (subjectId) loadChapters(subjectId);
                if (chapterId) loadQuestions(chapterId);
              }}
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Tables Section */}
        <div className="table-responsive rounded-3 shadow-sm bg-white p-3">
          <h6 className="fw-bold text-secondary mb-3">Questions List</h6>
          <table className="table table-hover align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Question</th>
                <th>Answer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, i) => (
                <tr key={q._id}>
                  <td>{i + 1}</td>
                  <td>
                    <span
                      className={`badge ${q.type === "PYQ" ? "text-bg-primary" : "text-bg-warning"
                        }`}
                    >
                      {q.type}
                    </span>
                  </td>
                  <td className="text-truncate" style={{ maxWidth: 300 }}>
                    {q.question}
                  </td>
                  <td>{q.answer}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() =>
                        confirm("Delete this question?") &&
                        api
                          .delete(`/admin/questions/${q._id}`)
                          .then(() => loadQuestions())
                      }
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {!questions.length && (
                <tr>
                  <td colSpan="5" className="text-muted">
                    No questions available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
