import mongoose from "mongoose";

const mockTestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, // e.g., "Pre Mock Test 1"
  type: { type: String, enum: ["pre", "mains"], required: true },
  link: { type: String, required: true, trim: true }, // Google Drive link
});

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    overview: { type: String, trim: true },
    mockTests: [mockTestSchema], // ✅ multiple Pre/Mains mock tests
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);
