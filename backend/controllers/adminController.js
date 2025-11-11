import Subject from "../models/Subject.js";
import Chapter from "../models/Chapter.js";
import Question from "../models/Question.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

/* =========================
   SUBJECT MANAGEMENT
   ========================= */
export const addSubject = async (req, res) => {
  try {
    const { name, price, overview } = req.body;
    if (!name || price == null)
      return res.status(400).json({ message: "Name & price required" });

    const subject = await Subject.create({ name, price, overview });
    res.status(201).json(subject);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: "Subject already exists" });
    console.error("Add subject error:", err);
    res.status(500).json({ message: "Failed to add subject" });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, overview } = req.body;

    const updated = await Subject.findByIdAndUpdate(
      id,
      { name, price, overview },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Subject not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update subject error:", err);
    res.status(500).json({ message: "Failed to update subject" });
  }
};

/* =========================
   CHAPTER MANAGEMENT
   ========================= */

// ✅ Add new chapter (no PDF initially)
export const addChapter = async (req, res) => {
  try {
    const { subjectId, name } = req.body;

    if (!subjectId || !name)
      return res.status(400).json({ message: "subjectId & name required" });

    const chapter = await Chapter.create({
      subjectId,
      name,
      studyMaterials: [],
      mockTests: [],
    });

    res.status(201).json(chapter);
  } catch (err) {
    console.error("Add chapter error:", err);
    res.status(500).json({ message: "Failed to add chapter" });
  }
};

// ✅ Update chapter name only
export const updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updated = await Chapter.findByIdAndUpdate(id, { name }, { new: true });
    if (!updated)
      return res.status(404).json({ message: "Chapter not found" });

    res.json(updated);
  } catch (err) {
    console.error("Update chapter error:", err);
    res.status(500).json({ message: "Failed to update chapter" });
  }
};

/* =========================
   MULTIPLE PDF HANDLING
   ========================= */

// ➕ Add a Study Material PDF (append)
export const addStudyMaterialPdf = async (req, res) => {
  try {
    const { id } = req.params; // chapterId
    const { title, url } = req.body;
    if (!title || !url)
      return res.status(400).json({ message: "Title and URL required" });

    const chapter = await Chapter.findById(id);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    chapter.studyMaterials.push({ title, url });
    await chapter.save();

    res.status(201).json({
      success: true,
      message: "Study material added successfully",
      studyMaterials: chapter.studyMaterials,
    });
  } catch (err) {
    console.error("Add Study Material error:", err);
    res.status(500).json({ message: "Failed to add Study Material PDF" });
  }
};

// ➕ Add a Mock Test PDF (append)
export const addMockTestPdf = async (req, res) => {
  try {
    const { id } = req.params; // chapterId
    const { title, url } = req.body;
    if (!title || !url)
      return res.status(400).json({ message: "Title and URL required" });

    const chapter = await Chapter.findById(id);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    chapter.mockTests.push({ title, url });
    await chapter.save();

    res.status(201).json({
      success: true,
      message: "Mock test added successfully",
      mockTests: chapter.mockTests,
    });
  } catch (err) {
    console.error("Add Mock Test error:", err);
    res.status(500).json({ message: "Failed to add Mock Test PDF" });
  }
};

// 🗑️ Delete a specific PDF by its ID
export const deleteChapterPdf = async (req, res) => {
  try {
    const { id, type, pdfId } = req.params; // /chapters/:id/pdf/:type/:pdfId
    const chapter = await Chapter.findById(id);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    if (type === "study") {
      chapter.studyMaterials = chapter.studyMaterials.filter(
        (pdf) => pdf._id.toString() !== pdfId
      );
    } else if (type === "mock") {
      chapter.mockTests = chapter.mockTests.filter(
        (pdf) => pdf._id.toString() !== pdfId
      );
    } else {
      return res.status(400).json({ message: "Invalid PDF type" });
    }

    await chapter.save();
    res.json({ success: true, message: "PDF deleted successfully", chapter });
  } catch (err) {
    console.error("Delete Chapter PDF error:", err);
    res.status(500).json({ message: "Failed to delete PDF" });
  }
};

// 📜 Get all PDFs for a chapter
export const getChapterPdfs = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findById(id).select("name studyMaterials mockTests");

    if (!chapter)
      return res.status(404).json({ message: "Chapter not found" });

    res.json({
      success: true,
      chapterName: chapter.name,
      studyMaterials: chapter.studyMaterials || [],
      mockTests: chapter.mockTests || [],
    });
  } catch (err) {
    console.error("Get Chapter PDFs error:", err);
    res.status(500).json({ message: "Failed to fetch Chapter PDFs" });
  }
};


// ✅ ADD QUESTION
export const addQuestion = async (req, res) => {
  try {
    const { chapterId, type, question, options, answer, explanation } = req.body;
    let imageUrl = null;

    if (req.file && req.file.path) imageUrl = req.file.path;

    if (!chapterId || !type || !question || !options || !answer)
      return res.status(400).json({ message: "Missing required fields" });

    const parsedOptions =
      typeof options === "string" ? JSON.parse(options) : options;

    const q = await Question.create({
      chapterId,
      type,
      question,
      options: parsedOptions,
      answer,
      explanation: explanation || "",
      imageUrl,
    });

    res.status(201).json({ success: true, data: q });
  } catch (err) {
    console.error("❌ Add question error:", err);
    res.status(500).json({ success: false, message: "Failed to add question" });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for existing question
    const questionDoc = await Question.findById(id);
    if (!questionDoc) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    // Extract fields from body
    const { type, question, options, answer, explanation } = req.body;
    const updateData = {};

    if (type) updateData.type = type;
    if (question) updateData.question = question;
    if (answer) updateData.answer = answer;
    if (explanation !== undefined) updateData.explanation = explanation;

    // ✅ Handle options safely
    if (options) {
      updateData.options =
        typeof options === "string" ? JSON.parse(options) : options;
    }

    // ✅ If new image uploaded
    if (req.file && req.file.path) {
      // Delete old image (if exists)
      if (questionDoc.imageUrl) {
        try {
          const publicId = questionDoc.imageUrl
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0]; // LTprep/questions/xyz
          await cloudinary.uploader.destroy(publicId);
          console.log("🗑️ Deleted old image:", publicId);
        } catch (err) {
          console.warn("⚠️ Cloudinary delete failed:", err.message);
        }
      }
      // Add new Cloudinary URL
      updateData.imageUrl = req.file.path;
    } else {
      // ✅ Keep old image if no new one uploaded
      updateData.imageUrl = questionDoc.imageUrl;
    }

    // ✅ Perform update
    const updated = await Question.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ Update question error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update question",
      error: err.message,
    });
  }
};


export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const cascade = req.query.cascade;

    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    if (cascade) {
      const chapters = await Chapter.find({ subjectId: id });
      const chapterIds = chapters.map((c) => c._id);
      await Question.deleteMany({ chapterId: { $in: chapterIds } });
      await Chapter.deleteMany({ subjectId: id });
    }

    await subject.deleteOne();
    res.json({ message: "Subject deleted successfully" });
  } catch (err) {
    console.error("Delete subject error:", err);
    res.status(500).json({ message: "Failed to delete subject" });
  }
};

export const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const cascade = req.query.cascade;

    const chapter = await Chapter.findById(id);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    if (cascade) {
      await Question.deleteMany({ chapterId: id });
    }

    await chapter.deleteOne();
    res.json({ message: "Chapter deleted successfully" });
  } catch (err) {
    console.error("Delete chapter error:", err);
    res.status(500).json({ message: "Failed to delete chapter" });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    await question.deleteOne();
    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error("Delete question error:", err);
    res.status(500).json({ message: "Failed to delete question" });
  }
};



// ================== ADMIN DASHBOARD ENHANCED ==================

export const getAdminDashboard = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select("-password");

    const totalUsers = await User.countDocuments({ role: "student" });
    const totalSubjects = await Subject.countDocuments();
    const totalTransactions = await Transaction.countDocuments({ status: "SUCCESS" });

    const revenueAgg = await Transaction.aggregate([
      { $match: { status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const recentTransactions = await Transaction.find()
      .populate("userId", "name email")
      .populate("subjectId", "name price")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      admin,
      stats: {
        totalUsers,
        totalSubjects,
        totalTransactions,
        totalRevenue,
      },
      recentTransactions,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

// ================== USER MANAGEMENT ==================

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "student" })
      .select("-password")
      .populate("purchasedSubjects", "name price");
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Failed to get users" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// ================== COURSE ASSIGNMENT ==================

export const assignCourse = async (req, res) => {
  try {
    const { userId, subjectId } = req.body;

    if (!userId || !subjectId) {
      return res.status(400).json({ message: "User ID & Subject ID required" });
    }

    const user = await User.findById(userId);
    const subject = await Subject.findById(subjectId);

    if (!user || !subject) {
      return res.status(404).json({ message: "User or Subject not found" });
    }

    // Check if user already has this course
    const alreadyAssigned = user.purchasedSubjects.some(
      (id) => String(id) === String(subjectId)
    );
    if (alreadyAssigned) {
      return res.status(400).json({ message: "Course already assigned" });
    }

    // ✅ Create an admin-granted transaction with amount = 0
    const adminTransaction = await Transaction.create({
      userId,
      subjectId,
      merchantTransactionId: `ADMIN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      amount: 0,
      status: "SUCCESS",
      paymentResponse: {
        mode: "ADMIN_ASSIGN",
        approvedBy: req.user?.name || "Admin",
        note: "Course access granted manually by admin",
      },
    });

    // ✅ Update user record with new course + transaction
    user.purchasedSubjects.push(subjectId);
    user.purchases.push({
      subjectId,
      transactionId: adminTransaction._id,
      amount: 0,
      purchasedAt: new Date(),
    });

    await user.save();

    res.json({
      success: true,
      message: "Course assigned successfully by admin",
      transactionId: adminTransaction._id,
    });
  } catch (err) {
    console.error("Assign course error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to assign course",
      error: err.message,
    });
  }
};

export const removeCourse = async (req, res) => {
  try {
    const { userId, subjectId } = req.body;
    if (!userId || !subjectId)
      return res.status(400).json({ message: "User ID & Subject ID required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.purchasedSubjects = user.purchasedSubjects.filter(
      (id) => String(id) !== String(subjectId)
    );
    user.purchases = user.purchases.filter(
      (p) => String(p.subjectId) !== String(subjectId)
    );
    await user.save();

    res.json({ message: "Course removed successfully" });
  } catch (err) {
    console.error("Remove course error:", err);
    res.status(500).json({ message: "Failed to remove course" });
  }
};