export default function Terms() {
  return (
    <div className="container my-2">
      <div className="text-center mb-5">
        <h1 className="fw-bold text-primary">Terms & Conditions</h1>
        <p className="text-muted fs-5">
          Please read the terms carefully before using LTPrep
        </p>
      </div>

      <div className="p-4 shadow-sm bg-white rounded mb-4">
        <h4 className="fw-bold text-primary">1. Acceptance of Terms</h4>
        <p className="text-muted">
          By accessing LTPrep, you agree to follow all rules, policies, and
          terms defined by us. If you disagree with any part of the terms, you
          may discontinue using the platform.
        </p>

        <h4 className="fw-bold text-primary mt-4">2. User Responsibilities</h4>
        <ul className="text-muted">
          <li>You must provide accurate registration information.</li>
          <li>
            Study material, mocks & PDFs are for personal use only — sharing is
            strictly prohibited.
          </li>
          <li>
            Your login credentials must remain confidential and not shared with others.
          </li>
          <li>
            Any misuse or attempt to hack / bypass access will result in account ban.
          </li>
        </ul>

        <h4 className="fw-bold text-primary mt-4">3. Content Usage</h4>
        <p className="text-muted">
          All PDFs, test papers, and study content are copyrighted. Re-uploading,
          selling, or distributing LTPrep material is not allowed.
        </p>

        <h4 className="fw-bold text-primary mt-4">4. Modifications</h4>
        <p className="text-muted">
          LTPrep reserves the right to update or modify terms anytime. Continued
          usage means you accept the updated terms.
        </p>

        <h4 className="fw-bold text-primary mt-4">5. Limitation of Liability</h4>
        <p className="text-muted">
          LTPrep is not responsible for any issue arising from misuse, data
          sharing, or unauthorized activity done by users.
        </p>
      </div>

      <div className="text-center text-muted mt-4">
        Updated: {new Date().getFullYear()}
      </div>
    </div>
  );
}
