import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  getSubjects,
  getChaptersBySubject,
  getQuestionsByChapter
} from "../controllers/contentController.js";

const router = Router();

router.get("/subjects", auth, getSubjects);
router.get("/subjects/:id/chapters", auth, getChaptersBySubject);
router.get("/chapters/:id/questions", auth, getQuestionsByChapter);

export default router;
