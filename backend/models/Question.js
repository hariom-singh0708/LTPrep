import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true, index: true },
    type: { type: String, enum: ["Expected", "PYQ"], required: true },
    question: { type: String, required: true },
    options: {
      type: [String],
      validate: v => Array.isArray(v) && v.length >= 2 && v.length <= 6
    },
    answer: { type: String, required: true },
    explanation: { type: String }, // can hold text/HTML/markdown
    imageUrl: { type: String, default: null }
  },
  { timestamps: true }
);

questionSchema.index({ chapterId: 1, type: 1, createdAt: 1 });

export default mongoose.model("Question", questionSchema);
