import mongoose from "mongoose";

// ============================
// 📄 PDF Subschema
// ============================
const pdfSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: true } // keep _id for deletion of specific PDFs
);

// ============================
// 📘 CHAPTER SCHEMA
// ============================
const chapterSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },

    // ✅ Multiple PDFs allowed
    studyMaterials: { type: [pdfSchema], default: [] },
    mockTests: { type: [pdfSchema], default: [] },
  },
  { timestamps: true }
);

// Index for performance
chapterSchema.index({ subjectId: 1, createdAt: 1 });

export default mongoose.model("Chapter", chapterSchema);
