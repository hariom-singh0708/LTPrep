export default function Refund() {
  return (
    <div className="container my-2">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="fw-bold text-primary">Refund Policy</h1>
        <p className="text-muted fs-5">
          Clear, simple and transparent refund guidelines for LTPrep users
        </p>
      </div>

      <div className="p-4 shadow-sm bg-white rounded mb-4">

        {/* Section 1 */}
        <h4 className="fw-bold text-primary">1. Refund Eligibility</h4>
        <p className="text-muted">
          LTPrep provides digital products such as study materials, mock tests,
          PDFs, PYQs, and online content. Because this content is delivered
          instantly upon purchase, refunds are generally not granted unless:
        </p>
        <ul className="text-muted">
          <li>You were charged twice for the same purchase.</li>
          <li>You experienced a major technical issue that prevented access.</li>
          <li>The purchased content was not delivered due to a system error.</li>
        </ul>

        {/* Section 2 */}
        <h4 className="fw-bold text-primary mt-4">2. Non-Refundable Items</h4>
        <ul className="text-muted">
          <li>Study PDFs once downloaded.</li>
          <li>Mock tests that have already been accessed/attempted.</li>
          <li>Completed subscriptions or expired access.</li>
          <li>Accidental purchases after content has been accessed.</li>
        </ul>

        {/* Section 3 */}
        <h4 className="fw-bold text-primary mt-4">3. Refund Request Window</h4>
        <p className="text-muted">
          Refund requests must be sent within <strong>24 hours</strong> of purchase.
          Requests beyond this timeframe will not be eligible unless approved under
          special conditions.
        </p>

        {/* Section 4 */}
        <h4 className="fw-bold text-primary mt-4">4. How to Request a Refund</h4>
        <p className="text-muted">
          To request a refund, please contact our support team with the following:
        </p>
        <ul className="text-muted">
          <li>Registered email ID</li>
          <li>Order/transaction ID</li>
          <li>Reason for refund request</li>
          <li>Screenshots (if any technical issue occurred)</li>
        </ul>

        {/* Section 5 */}
        <h4 className="fw-bold text-primary mt-4">5. Refund Processing Time</h4>
        <p className="text-muted">
          Approved refunds will be processed within <strong>3–7 business days</strong>,
          depending on your bank or payment provider.
        </p>

        {/* Section 6 */}
        <h4 className="fw-bold text-primary mt-4">6. Important Notes</h4>
        <ul className="text-muted">
          <li>Refund approval is solely based on LTPrep’s verification process.</li>
          <li>We reserve the right to refuse refunds in case of misuse or policy violation.</li>
          <li>Repeated refund requests may lead to account review or restriction.</li>
        </ul>

      </div>

      <div className="text-center text-muted mt-4">
        Updated: {new Date().getFullYear()}
      </div>
    </div>
  );
}
