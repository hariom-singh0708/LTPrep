// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Purchase subdocument (embedded)
const purchaseSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
    amount: { type: Number, required: true },
    purchasedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    purchasedSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    purchases: [purchaseSchema],
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("User", userSchema);
