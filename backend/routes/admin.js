// routes/adminRoutes.js
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

const router = express.Router();

// ✅ Protect all admin routes
router.use(auth, adminOnly);

// ================== ADMIN DASHBOARD ==================
router.get("/dashboard", getAdminDashboard);

// ================== USER MANAGEMENT ==================
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// ================== COURSE MANAGEMENT ==================
router.post("/assign-course", assignCourse);
router.post("/remove-course", removeCourse);

// ================== SUBJECT CRUD ==================
router.post("/subjects", addSubject);
router.put("/subjects/:id", updateSubject);
router.delete("/subjects/:id", deleteSubject);

// ================== CHAPTER CRUD ==================
router.post("/chapters", addChapter);
router.put("/chapters/:id", updateChapter);
router.delete("/chapters/:id", deleteChapter);

// ================== QUESTION CRUD ==================
router.post("/questions", addQuestion);
router.put("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

export default router;
