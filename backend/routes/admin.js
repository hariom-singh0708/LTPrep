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

router.use(auth, adminOnly);

router.get("/dashboard", getAdminDashboard);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.post("/assign-course", assignCourse);
router.post("/remove-course", removeCourse);

router.post("/subjects", addSubject);
router.post("/chapters", addChapter);
router.post("/questions", addQuestion);

router.put("/subjects/:id", updateSubject);
router.put("/chapters/:id", updateChapter);
router.put("/questions/:id", updateQuestion);

router.delete("/subjects/:id", deleteSubject);
router.delete("/chapters/:id", deleteChapter);
router.delete("/questions/:id", deleteQuestion);

export default router;
