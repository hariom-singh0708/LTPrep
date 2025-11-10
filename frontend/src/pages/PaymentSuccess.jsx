import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaSpinner,
} from "react-icons/fa";

export default function PaymentSuccess() {
  const [status, setStatus] = useState("LOADING");
  const [message, setMessage] = useState("Verifying your payment...");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const transactionId = searchParams.get("transactionId");

  useEffect(() => {
    if (!transactionId) {
      setStatus("FAILED");
      setMessage("Invalid payment link or missing transaction ID.");
      return;
    }

    (async () => {
      try {
        const { data } = await api.post("/payment/verify", { transactionId });
        console.log("Verification Result:", data);

        if (data?.success && data?.data?.code === "PAYMENT_SUCCESS") {
          setStatus("SUCCESS");
          setMessage("Payment successful! 🎉 Your purchase has been activated.");

          // ✅ refresh user before redirect
          await refreshUser();

          console.log("✅ User refreshed, navigating...");
        } else {
          setStatus("FAILED");
          setMessage("Payment failed or still pending. Please try again.");
        }
      } catch (err) {
        console.error(err);
        setStatus("FAILED");
        setMessage("Verification failed. Please contact support.");
      }
    })();
  }, [transactionId, refreshUser, navigate]);

  return (
    <div className="container py-5 text-center">
      <div
        className="card shadow-lg border-0 mx-auto"
        style={{ maxWidth: "480px" }}
      >
        <div className="card-body p-4">
          {status === "LOADING" && (
            <>
              <FaSpinner className="fa-spin text-primary mb-3 fs-2" />
              <h4 className="text-muted">{message}</h4>
            </>
          )}

          {status === "SUCCESS" && (
            <>
              <FaCheckCircle className="text-success mb-3 fs-1" />
              <h3 className="fw-bold text-success mb-2">Payment Successful</h3>
              <p className="text-muted">{message}</p>
              <button
                className="btn btn-outline-success mt-3"
                onClick={() => navigate("/subjects")}
              >
                <FaArrowLeft className="me-2" />
                Back to Subjects
              </button>
            </>
          )}

          {status === "FAILED" && (
            <>
              <FaTimesCircle className="text-danger mb-3 fs-1" />
              <h3 className="fw-bold text-danger mb-2">Payment Failed</h3>
              <p className="text-muted">{message}</p>
              <button
                className="btn btn-outline-primary mt-3"
                onClick={() => navigate("/subjects")}
              >
                <FaArrowLeft className="me-2" />
                Back to Subjects
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
