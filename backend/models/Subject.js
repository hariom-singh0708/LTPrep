import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    overview: { type: String, trim: true },

    // 🆕 PDFs array (for Drive or Cloudinary links)
    pdfs: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true }, // Drive or Cloudinary link
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);
