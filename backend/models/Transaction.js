// models/Transaction.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    merchantTransactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true }, // in INR
    status: {
      type: String,
      enum: ["INITIATED", "SUCCESS", "FAILED", "PENDING"],
      default: "INITIATED",
    },
    paymentResponse: { type: Object },
  },
  { timestamps: true }
);


export default mongoose.model("Transaction", transactionSchema);
