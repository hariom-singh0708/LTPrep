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
  getAdminDashboard ,
} from "../controllers/adminController.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", auth, adminOnly, getAdminDashboard);

// Create
router.post("/subjects", addSubject);
router.post("/chapters", addChapter);
router.post("/questions", addQuestion);

// Update
router.put("/subjects/:id", updateSubject);
router.put("/chapters/:id", updateChapter);
router.put("/questions/:id", updateQuestion);

// Delete
router.delete("/subjects/:id", deleteSubject);
router.delete("/chapters/:id", deleteChapter);
router.delete("/questions/:id", deleteQuestion);

export default router;
