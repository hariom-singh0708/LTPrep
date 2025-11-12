import express from "express";
import {
  // SUBJECTS
  addSubject,
  updateSubject,
  deleteSubject,
  addSubjectMockTest,
  deleteSubjectMockTest,
  getSubjectMockTests,

  // CHAPTERS
  addChapter,
  updateChapter,
  deleteChapter,
  getChapterPdfs,
  addStudyMaterialPdf,
  addMockTestPdf,
  deleteChapterPdf,

  // QUESTIONS
  addQuestion,
  updateQuestion,
  deleteQuestion,

  // DASHBOARD / USERS / COURSES
  getAdminDashboard,
  getAllUsers,
  deleteUser,
  assignCourse,
  removeCourse,
} from "../controllers/adminController.js";

import { auth, adminOnly } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/* =========================
   PUBLIC ROUTES
   ========================= */
// Allow fetching PDFs (no login required)
router.get("/chapters/:id/pdfs", getChapterPdfs);
router.get("/subjects/:id/mock-tests", getSubjectMockTests);
/* =========================
   PROTECTED ADMIN ROUTES
   ========================= */
router.use(auth, adminOnly);

// DASHBOARD
router.get("/dashboard", getAdminDashboard);

// USERS
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// COURSES
router.post("/assign-course", assignCourse);
router.post("/remove-course", removeCourse);

// SUBJECTS
router.post("/subjects", addSubject);
router.put("/subjects/:id", updateSubject);
router.delete("/subjects/:id", deleteSubject);
router.post("/subjects/:id/mock-test", addSubjectMockTest);
router.delete("/subjects/:id/mock-test/:mockTestId", deleteSubjectMockTest);

// CHAPTERS
router.post("/chapters", addChapter);
router.put("/chapters/:id", updateChapter);
router.delete("/chapters/:id", deleteChapter);

// ✅ NEW MULTIPLE PDF ROUTES (Chapter-level)
router.post("/chapters/:id/study-material", addStudyMaterialPdf);
router.post("/chapters/:id/mock-test", addMockTestPdf);
router.delete("/chapters/:id/pdf/:type/:pdfId", deleteChapterPdf);

// QUESTIONS (with image upload)
router.post("/questions", upload.single("image"), addQuestion);
router.put("/questions/:id", upload.single("image"), updateQuestion);
router.delete("/questions/:id", deleteQuestion);

export default router;
