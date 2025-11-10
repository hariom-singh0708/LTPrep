import { Router } from "express";
import { auth } from "../middleware/auth.js";
import PDFDocument from "pdfkit";
import axios from "axios"; // ✅ you forgot to import this earlier
import Question from "../models/Question.js";
import Chapter from "../models/Chapter.js";
import Subject from "../models/Subject.js";

import {
  getSubjects,
  getChaptersBySubject,
  getQuestionsByChapter,
} from "../controllers/contentController.js";

const router = Router();

/* =========================
   📄 Generate Questions PDF
   ========================= */
router.get("/pdf/questions", auth, async (req, res) => {
  try {
    const { chapterId, type } = req.query;

    if (!chapterId || !type) {
      return res.status(400).json({ message: "Missing chapterId or type" });
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter)
      return res.status(404).json({ message: "Chapter not found" });

    const subject = await Subject.findById(chapter.subjectId);
    const questions = await Question.find({ chapterId, type }).sort({
      createdAt: 1,
    });

    if (!questions.length) {
      return res.status(404).json({ message: "No questions found" });
    }

    // ✅ Set headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${subject?.name || "Subject"}_${
        chapter.name
      }_${type}.pdf"`
    );

    // ✅ Create PDF
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.pipe(res);

    // ✅ Title
    doc
      .fontSize(18)
      .fillColor("#0d6efd")
      .text(
        `${subject?.name || ""} - ${chapter.name} (${type} Questions)`,
        { align: "center" }
      )
      .moveDown(1.5);

    // ✅ Loop through questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      doc
        .fontSize(12)
        .fillColor("#000")
        .text(`${i + 1}. ${q.question}`, { align: "left" })
        .moveDown(0.3);

      // ✅ If image exists
      if (q.imageUrl) {
        try {
          // fetch Cloudinary image as buffer
          const imgResponse = await axios.get(q.imageUrl, {
            responseType: "arraybuffer",
          });
          const imgBuffer = Buffer.from(imgResponse.data, "binary");
          doc.image(imgBuffer, {
            fit: [400, 250],
            align: "center",
          });
          doc.moveDown(0.5);
        } catch (err) {
          console.warn("⚠️ Failed to load image:", q.imageUrl);
        }
      }

      // ✅ Options
      if (q.options?.length) {
        const letters = ["A", "B", "C", "D", "E", "F"];
        q.options.forEach((opt, idx) => {
          doc.text(`${letters[idx]}. ${opt}`, { indent: 20 });
        });
        doc.moveDown(0.3);
      }

      // ✅ Answer
      doc.fillColor("#198754").text(`Answer: ${q.answer}`, { indent: 20 });

      // ✅ Explanation (if exists)
      if (q.explanation) {
        doc
          .fillColor("#0d6efd")
          .text("Explanation:", { indent: 20 })
          .fillColor("#000")
          .text(q.explanation, { indent: 30 })
          .moveDown(1);
      } else {
        doc.moveDown(0.5);
      }

      // ✅ Divider
      doc
        .moveTo(40, doc.y)
        .lineTo(550, doc.y)
        .strokeColor("#ccc")
        .stroke()
        .moveDown(1);
    }

    doc.end();
  } catch (err) {
    console.error("❌ PDF generation error:", err);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});

/* =========================
   📄 Generate Subject Overview PDF
   ========================= */
router.get("/subjects/:id/overview-pdf", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${subject.name}_overview.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.font("Helvetica");

    const cleanText = (subject.overview || "")
      .replace(/\r\n/g, "\n")
      .replace(/–/g, "-")
      .replace(/•/g, "-")
      .replace(/[^\x00-\x7F]/g, "");

    doc.fontSize(18).text(subject.name, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(cleanText, { align: "left", lineGap: 5 });
    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});

/* =========================
   ✅ Regular Content Routes
   ========================= */
router.get("/subjects", auth, getSubjects);
router.get("/subjects/:id/chapters", auth, getChaptersBySubject);
router.get("/chapters/:id/questions", auth, getQuestionsByChapter);

export default router;
