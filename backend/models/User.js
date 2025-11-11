import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ==========================
// 🧾 PURCHASE SUBDOCUMENT
// ==========================
const purchaseSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    amount: { type: Number, required: true },
    purchasedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ==========================
// 👤 USER SCHEMA
// ==========================
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },

    // ✅ Prevent duplicate subjects
    purchasedSubjects: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Subject",
      default: [],
    },

    purchases: { type: [purchaseSchema], default: [] },
  },
  { timestamps: true }
);

// ==========================
// 🔒 HASH PASSWORD BEFORE SAVE
// ==========================
userSchema.pre("save", async function (next) {
  // Hash only when changed
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // ✅ Auto-remove duplicate subjectIds
  if (this.purchasedSubjects?.length) {
    this.purchasedSubjects = [...new Set(this.purchasedSubjects.map(String))];
  }

  // ✅ Remove duplicate purchases by subjectId
  if (this.purchases?.length) {
    const seen = new Set();
    this.purchases = this.purchases.filter((p) => {
      const sid = String(p.subjectId);
      if (seen.has(sid)) return false;
      seen.add(sid);
      return true;
    });
  }

  next();
});

// ==========================
// 🔑 PASSWORD COMPARISON
// ==========================
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("User", userSchema);
