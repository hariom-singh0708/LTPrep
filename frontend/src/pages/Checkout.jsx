import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  FaBookOpen,
  FaLock,
  FaCheckCircle,
  FaCreditCard,
  FaShieldAlt,
  FaArrowLeft,
} from "react-icons/fa";

export default function Checkout() {
  const { id: subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/subjects");
        const s = data.find((x) => String(x._id) === String(subjectId));
        setSubject(s || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [subjectId]);

  const handlePay = async () => {
  if (!subject) return;
  setPaying(true);
  try {
    const { data } = await api.post("/payment/initiate", { subjectId });
    const { redirectUrl, transactionId } = data;

    // Open QR/PhonePe page in a new tab
    window.open(redirectUrl, "_blank");

    // Start polling payment status
    let attempts = 0;
    const maxAttempts = 10; // poll 10 times
    const poll = setInterval(async () => {
      attempts++;
      try {
        const res = await api.post("/payment/verify", { transactionId });
        const status = res.data?.data?.data?.state || res.data?.data?.code;

        if (status === "COMPLETED" || status === "PAYMENT_SUCCESS") {
          clearInterval(poll);
          alert("✅ Payment Successful! Redirecting...");
          navigate(`/payment-success?transactionId=${transactionId}`);
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
          alert("❌ Payment not confirmed yet. Please refresh or contact support.");
        }
      } catch (err) {
        console.error(err);
        clearInterval(poll);
      }
    }, 3000); // every 3 sec
  } catch (e) {
    alert(e?.response?.data?.message || "Payment failed");
  } finally {
    setPaying(false);
  }
};

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );

  if (!subject)
    return (
      <div className="text-center py-5">
        <h4 className="text-danger">❌ Subject not found</h4>
        <button className="btn btn-outline-primary mt-3" onClick={() => navigate("/subjects")}>
          <FaArrowLeft className="me-2" /> Back to Subjects
        </button>
      </div>
    );

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4">
              {/* Title */}
              <h3 className="fw-bold text-center mb-3 text-success">
                <FaCreditCard className="me-2" />
                Secure Checkout
              </h3>
              <p className="text-muted text-center mb-4">
                Complete your payment securely using PhonePe.
              </p>

              {/* Subject Details */}
              <div className="bg-light rounded-3 p-3 mb-4">
                <h5 className="fw-bold mb-2">
                  <FaBookOpen className="text-success me-2" />
                  {subject.name}
                </h5>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Price</span>
                  <span className="fw-bold fs-5 text-success">
                    ₹{subject.price}
                  </span>
                </div>
              </div>

              {/* User Info */}
              {user && (
                <div className="mb-4">
                  <p className="text-muted mb-1">
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p className="text-muted mb-0">
                    <strong>Email:</strong> {user.email}
                  </p>
                </div>
              )}

              {/* Payment Button */}
              <button
                className="btn btn-success w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                onClick={handlePay}
                disabled={paying}
              >
                {paying ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    ></span>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <FaLock />
                    Pay ₹{subject.price} with PhonePe
                  </>
                )}
              </button>

              {/* Back button */}
              <button
                className="btn btn-link text-decoration-none mt-3"
                onClick={() => navigate("/subjects")}
              >
                <FaArrowLeft className="me-2" /> Back to Subjects
              </button>

              {/* Security Section */}
              <div className="text-center mt-4">
                <div className="text-muted small">
                  <FaShieldAlt className="text-success me-1" />
                  100% Secure & Encrypted Payment
                </div>
                <div className="mt-2 text-muted small">
                  <FaCheckCircle className="text-success me-1" />
                  Trusted by thousands of learners
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
