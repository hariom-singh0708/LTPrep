// middleware/requirePurchase.js
import Chapter from "../models/Chapter.js";
import User from "../models/User.js";

export async function requirePurchase(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ Allow admins to access everything
    if (user.role === "admin") return next();

    // ✅ Try to extract the subjectId directly from params or query
    let subjectId = req.params.subjectId || req.query.subjectId;

    /**
     * 🧠 Handle different route types:
     *  - /subjects/:id/... → id is subjectId
     *  - /chapters/:id/... → id is chapterId (we must find subjectId from the chapter)
     */
    if (!subjectId) {
      // If route contains :id, determine whether it's a chapter or subject route
      const paramId = req.params.id || req.params.chapterId;

      if (paramId) {
        // Try finding a Chapter with this ID (if it exists)
        const chapter = await Chapter.findById(paramId).select("subjectId").lean();

        if (chapter) {
          subjectId = chapter.subjectId?.toString(); // ✅ chapter route
        } else {
          // Not a chapter → might already be a subject route
          subjectId = paramId;
        }
      }
    }

    // ✅ Validate subjectId
    if (!subjectId)
      return res.status(400).json({ message: "Subject not found in request" });

    // ✅ Fetch latest user data
    const freshUser = await User.findById(user._id)
      .select("purchasedSubjects role")
      .lean();

    const purchased = (freshUser.purchasedSubjects || []).map(String);

    // ✅ Check purchase access
    if (!purchased.includes(String(subjectId))) {
      return res.status(403).json({
        locked: true,
        message: "This content is locked. Please purchase the course to access.",
      });
    }

    // ✅ All good
    next();
  } catch (err) {
    console.error("requirePurchase error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
