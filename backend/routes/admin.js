import express from "express";
import {
  addSubject,
  addChapter,
  addQuestion,
  updateSubject,
  updateChapter,
  updateQuestion,
  deleteSubject,
  deleteChapter,
  deleteQuestion,
  getAdminDashboard,
  getAllUsers,
  deleteUser,
  assignCourse,
  removeCourse,
} from "../controllers/adminController.js";
import { auth, adminOnly } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ✅ Secure all routes
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

// CHAPTERS
router.post("/chapters", addChapter);
router.put("/chapters/:id", updateChapter);
router.delete("/chapters/:id", deleteChapter);

// QUESTIONS (with image upload)
router.post("/questions", upload.single("image"), addQuestion);
router.put("/questions/:id", upload.single("image"), updateQuestion);
router.delete("/questions/:id", deleteQuestion);

export default router;
