import dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";
import fetch from "node-fetch";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import Transaction from "../models/Transaction.js";

// =============================
// ⚙️ Environment Config
// =============================
const {
  PHONEPE_MERCHANT_ID,
  PHONEPE_SALT_KEY,
  PHONEPE_SALT_INDEX,
  PHONEPE_BASE_URL,
  PHONEPE_REDIRECT_URL,
  PHONEPE_CALLBACK_URL,
} = process.env;

if (
  !PHONEPE_MERCHANT_ID ||
  !PHONEPE_SALT_KEY ||
  PHONEPE_SALT_INDEX == null ||
  !PHONEPE_BASE_URL ||
  !PHONEPE_REDIRECT_URL ||
  !PHONEPE_CALLBACK_URL
) {
  throw new Error("❌ Missing PhonePe environment configuration variables");
}

// =============================
// 🔧 Utility Helpers
// =============================
const generateTxnId = (prefix = "SUB") =>
  `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 10000)}`
    .slice(0, 38);

const checksumForPay = (payload, endpoint) => {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
  const hash = crypto
    .createHash("sha256")
    .update(base64Payload + endpoint + PHONEPE_SALT_KEY)
    .digest("hex");
  return { base64Payload, checksum: `${hash}###${PHONEPE_SALT_INDEX}` };
};

const checksumForStatus = (endpoint) => {
  const hash = crypto
    .createHash("sha256")
    .update(endpoint + PHONEPE_SALT_KEY)
    .digest("hex");
  return `${hash}###${PHONEPE_SALT_INDEX}`;
};

const verifyCallbackChecksum = (responseBase64, received) => {
  const calc = crypto
    .createHash("sha256")
    .update(responseBase64 + PHONEPE_SALT_KEY)
    .digest("hex");
  return `${calc}###${PHONEPE_SALT_INDEX}` === received;
};

const parsePaymentStatus = (r) => {
  const code = r?.code;
  const state = r?.data?.state;
  const resCode = r?.data?.responseCode;

  const success =
    code === "PAYMENT_SUCCESS" ||
    (state === "COMPLETED" && resCode === "SUCCESS");

  const pending = code === "PAYMENT_PENDING" || state === "PENDING";
  const failed = !success && !pending;

  return { isSuccess: success, isPending: pending, isFailed: failed };
};

const recordPurchaseIfNeeded = async (txn) => {
  try {
    const user = await User.findById(txn.userId).lean();
    if (!user) return;

    const alreadyHas = user.purchases?.some(
      (p) =>
        String(p.subjectId) === String(txn.subjectId) &&
        String(p.transactionId) === String(txn._id)
    );

    if (!alreadyHas) {
      await User.findByIdAndUpdate(txn.userId, {
        $addToSet: { purchasedSubjects: txn.subjectId },
        $push: {
          purchases: {
            subjectId: txn.subjectId,
            transactionId: txn._id,
            amount: txn.amount,
            purchasedAt: new Date(),
          },
        },
      });
    }
  } catch (err) {
    console.error("⚠️ recordPurchaseIfNeeded error:", err.message);
  }
};

const verifyAndFinalize = async (txnId) => {
  const endpoint = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${txnId}`;
  const url = `${PHONEPE_BASE_URL}${endpoint}`;
  const checksum = checksumForStatus(endpoint);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": PHONEPE_MERCHANT_ID,
    },
  });

  const data = await res.json();
  const txn =
    (await Transaction.findOne({ merchantTransactionId: txnId })) ||
    (await Transaction.findById(txnId));

  if (!txn) return { ok: false, status: "NOT_FOUND", response: data };

  const { isSuccess, isPending } = parsePaymentStatus(data);

  // ✅ Keep pending until callback confirms success
  let status = "PENDING";
  if (isSuccess) status = "SUCCESS";
  else if (!isPending) status = "FAILED";

  txn.status = status;
  txn.paymentResponse = data;
  await txn.save();

  if (isSuccess) await recordPurchaseIfNeeded(txn);

  return { ok: true, status, response: data };
};

// =============================
// 💳 Payment Handlers
// =============================
export const initiatePayment = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const userId = req.user?._id;

    if (!userId)
      return res.status(401).json({ message: "Unauthorized: Login required" });

    const subject = await Subject.findById(subjectId).lean();
    if (!subject)
      return res.status(404).json({ message: "Subject not found" });

    const user = await User.findById(userId).lean();
    if (user.purchasedSubjects?.includes(subjectId))
      return res
        .status(400)
        .json({ message: "Subject already purchased previously" });

    const amount = Number(subject.price);
    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid subject price" });

    const merchantTransactionId = generateTxnId("SUB");
    const transaction = await Transaction.create({
      userId,
      subjectId,
      merchantTransactionId,
      amount,
      status: "INITIATED",
    });

    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: String(userId),
      amount: amount * 100, // in paise
      redirectUrl: PHONEPE_REDIRECT_URL, // not used in laptop-only flow
      callbackUrl: PHONEPE_CALLBACK_URL, // server-side callback
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const { base64Payload, checksum } = checksumForPay(payload, "/pg/v1/pay");

    const response = await fetch(`${PHONEPE_BASE_URL}/pg/v1/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": PHONEPE_MERCHANT_ID,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const data = await response.json();

    if (!data?.success) {
      await Transaction.findByIdAndUpdate(transaction._id, {
        status: "FAILED",
        paymentResponse: data,
      });
      return res
        .status(400)
        .json({ message: "Payment initiation failed", data });
    }

    await Transaction.findByIdAndUpdate(transaction._id, {
      paymentResponse: data,
    });

    // ✅ Return redirect URL for QR scan (handled on laptop)
    res.json({
      redirectUrl: data.data.instrumentResponse.redirectInfo.url,
      transactionId: merchantTransactionId,
      subjectId,
      amount,
    });
  } catch (err) {
    console.error("❌ Initiate error:", err);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};

// =============================
// 📡 Callback from PhonePe
// =============================
export const phonePeCallback = async (req, res) => {
  try {
    const { response } = req.body;
    const receivedChecksum = req.headers["x-verify"];

    if (!response)
      return res.status(400).json({ message: "Missing callback response" });

    if (!verifyCallbackChecksum(response, receivedChecksum))
      return res.status(400).json({ message: "Invalid callback signature" });

    const decoded = JSON.parse(Buffer.from(response, "base64").toString("utf8"));
    const txnId = decoded?.data?.merchantTransactionId;
    if (!txnId)
      return res.status(400).json({ message: "Invalid callback data" });

    await Transaction.findOneAndUpdate(
      { merchantTransactionId: txnId },
      { paymentResponse: decoded, status: "SUCCESS" },
      { new: true }
    );

    await verifyAndFinalize(txnId);

    // ✅ Silent acknowledgment (no HTML / redirect)
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Callback error:", err);
    res.status(500).json({ message: "Callback failed" });
  }
};

// =============================
// 🔍 Verify Payment (Polling)
// =============================
export const verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId)
      return res.status(400).json({ message: "Transaction ID required" });

    const result = await verifyAndFinalize(transactionId);
    if (!result.ok)
      return res.status(404).json({ message: "Transaction not found" });

    res.json({
      success: true,
      message: `Payment ${result.status}`,
      data: result.response,
    });
  } catch (err) {
    console.error("❌ Verify error:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};
