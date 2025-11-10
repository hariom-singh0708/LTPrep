import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  initiatePayment,
  phonePeCallback,
  verifyPayment,
} from "../controllers/paymentController.js";

const router = Router();

router.post("/initiate", auth, initiatePayment);
router.post("/callback", phonePeCallback); // called by PhonePe
router.post("/verify", auth, verifyPayment);

export default router;
