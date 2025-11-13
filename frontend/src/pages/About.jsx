export default function About() {
  return (
    <div className="container my-2">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="fw-bold text-primary">About LTPrep</h1>
        <p className="text-muted fs-5">
          Your Smart Learning Companion for Exams & Skill Growth
        </p>
      </div>

      {/* Mission Section */}
      <div className="p-4 rounded shadow-sm bg-white mb-4">
        <h3 className="fw-bold text-primary">Our Mission</h3>
        <p className="text-muted">
          LTPrep was created with one mission — to provide every student a
          structured, organized, and effective platform to prepare for exams.
          We simplify learning through mock tests, PYQs, expected questions,
          study PDFs, and interactive tools.
        </p>
      </div>

      {/* What We Offer */}
      <div className="p-4 rounded shadow-sm bg-light mb-4">
        <h3 className="fw-bold text-primary">What We Offer</h3>
        <ul className="text-muted fs-6">
          <li>High-quality Study Materials (PDFs, Notes)</li>
          <li>Subject-wise Mock Tests professionally designed</li>
          <li>Past Year Questions with explanations</li>
          <li>Expected Questions created using smart analysis</li>
          <li>Clean & distraction-free learning interface</li>
          <li>Secure access for every enrolled student</li>
        </ul>
      </div>

      {/* Tech */}
      <div className="p-4 rounded shadow-sm bg-white mb-4">
        <h3 className="fw-bold text-primary">Technology Behind LTPrep</h3>
        <p className="text-muted">
          LTPrep is powered by the MERN Stack (MongoDB, Express, React, Node)
          that ensures high speed, real-time updates, and a seamless experience.
          Cloud storage, secure APIs, and optimized UI make it user-friendly and fast.
        </p>
      </div>

      {/* Footer */}
      <div className="text-center mt-4">
        <p className="text-muted">
          We believe in making education accessible and efficient.  
          <strong>Together, let's simplify exam preparation!</strong>
        </p>
      </div>
    </div>
  );
}
