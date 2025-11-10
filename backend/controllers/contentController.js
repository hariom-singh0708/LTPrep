import Subject from "../models/Subject.js";
import Chapter from "../models/Chapter.js";
import Question from "../models/Question.js";
import mongoose from "mongoose";

export const getSubjects = async (req, res) => {
  const subjects = await Subject.find().sort({ createdAt: 1 });
  res.json(subjects);
};

export const getChaptersBySubject = async (req, res) => {
  const { id: subjectId } = req.params;
  if (!mongoose.isValidObjectId(subjectId))
    return res.status(400).json({ message: "Invalid subjectId" });

  const chapters = await Chapter.find({ subjectId }).sort({ createdAt: 1 });
  res.json(chapters);
};

/**
 * Access Rules:
 * - If user has purchased the subject (owner of chapter), return all questions with optional type filter.
 * - If not purchased:
 *    * Only allow questions from the FIRST chapter of that subject.
 *    * Return only first 10 questions (after optional type filter).
 */
export const getQuestionsByChapter = async (req, res) => {
  const { id: chapterId } = req.params;
  const { type } = req.query; // Expected | PYQ (optional)

  if (!mongoose.isValidObjectId(chapterId))
    return res.status(400).json({ message: "Invalid chapterId" });

  const chapter = await Chapter.findById(chapterId);
  if (!chapter) return res.status(404).json({ message: "Chapter not found" });

  const subjectId = chapter.subjectId.toString();
  const hasAccess =
    req.user?.purchasedSubjects?.map(String).includes(subjectId) || req.user?.role === "admin";

  // Find first chapter of this subject
  const firstChapter = await Chapter.findOne({ subjectId }).sort({ createdAt: 1 });

  const filter = { chapterId };
  if (type && (type === "Expected" || type === "PYQ")) filter.type = type;

  if (hasAccess) {
    const questions = await Question.find(filter).sort({ createdAt: 1 });
    return res.json({ locked: false, count: questions.length, questions });
  }

  // Not purchased: restrict
  if (!firstChapter || firstChapter._id.toString() !== chapterId) {
    return res.status(403).json({
      locked: true,
      message:
        "Locked — purchase this subject to access this chapter. You can try 10 questions from Chapter 1."
    });
  }

  const questions = await Question.find(filter).sort({ createdAt: 1 }).limit(10);
  res.json({
    locked: true,
    demo: true,
    count: questions.length,
    questions,
    message: "Showing 10 demo questions from Chapter 1. Buy to unlock all."
  });
};
