import { Router } from "express";
import { auth } from "../middleware/auth.js";
import PDFDocument from "pdfkit";
import Subject from "../models/Subject.js";
import {
  getSubjects,
  getChaptersBySubject,
  getQuestionsByChapter
} from "../controllers/contentController.js";

const router = Router();



// Generate overview PDF
router.get("/subjects/:id/overview-pdf", async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${subject.name}.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // 🧩 Use a font that supports Unicode (system or bundled)
    doc.font("Helvetica"); // You can also use a TTF font if you want, see below

    // 🧹 Clean up any weird line endings
    const cleanText = (subject.overview || "")
      .replace(/\r\n/g, "\n") // normalize line breaks
      .replace(/–/g, "-") // normalize dashes
      .replace(/•/g, "-") // normalize bullets
      .replace(/[^\x00-\x7F]/g, ""); // remove unsupported unicode chars

    // 🧾 Write content
    doc.fontSize(18).text(subject.name, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(cleanText, { align: "left", lineGap: 5 });
    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});


router.get("/subjects", auth, getSubjects);
router.get("/subjects/:id/chapters", auth, getChaptersBySubject);
router.get("/chapters/:id/questions", auth, getQuestionsByChapter);

export default router;
