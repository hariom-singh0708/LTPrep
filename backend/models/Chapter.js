import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    name: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

chapterSchema.index({ subjectId: 1, createdAt: 1 });

export default mongoose.model("Chapter", chapterSchema);
