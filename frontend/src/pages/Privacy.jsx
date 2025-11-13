export default function Privacy() {
  return (
    <div className="container my-2">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="fw-bold text-primary">Privacy Policy</h1>
        <p className="text-muted fs-5">
          Your privacy and data protection is our top priority
        </p>
      </div>

      <div className="p-4 shadow-sm bg-white rounded mb-4">
        <h4 className="fw-bold text-primary">1. Data Collection</h4>
        <p className="text-muted">
          We collect minimum necessary information such as your name, email, and
          login details strictly for account creation and platform access.
        </p>

        <h4 className="fw-bold text-primary mt-4">2. How We Use Your Data</h4>
        <ul className="text-muted">
          <li>To verify your identity and provide secure login.</li>
          <li>To offer personalized study content.</li>
          <li>To improve your learning experience.</li>
        </ul>

        <h4 className="fw-bold text-primary mt-4">3. Protection of Data</h4>
        <p className="text-muted">
          LTPrep uses secure encrypted databases and follows modern safety
          standards. Your personal information is **never sold or shared** with
          any third party.
        </p>

        <h4 className="fw-bold text-primary mt-4">4. Payment Safety</h4>
        <p className="text-muted">
          If you purchase any subscription (future), all transactions are handled
          through secure and verified payment gateways.
        </p>

        <h4 className="fw-bold text-primary mt-4">5. Your Rights</h4>
        <ul className="text-muted">
          <li>You can request account deletion anytime.</li>
          <li>You can update or correct your information.</li>
          <li>Your data is fully under your control.</li>
        </ul>

        <h4 className="fw-bold text-primary mt-4">6. Updates</h4>
        <p className="text-muted">
          We may update this policy occasionally. You will be notified in case of
          major changes.
        </p>
      </div>

      <div className="text-center text-muted mt-4">
        Updated: {new Date().getFullYear()}
      </div>
    </div>
  );
}
