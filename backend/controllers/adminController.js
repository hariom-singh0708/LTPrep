import Subject from "../models/Subject.js";
import Chapter from "../models/Chapter.js";
import Question from "../models/Question.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

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


export const addChapter = async (req, res) => {
  try {
    const { subjectId, name } = req.body;
    if (!subjectId || !name)
      return res.status(400).json({ message: "subjectId & name required" });

    const chapter = await Chapter.create({ subjectId, name });
    res.status(201).json(chapter);
  } catch (err) {
    console.error("Add chapter error:", err);
    res.status(500).json({ message: "Failed to add chapter" });
  }
};

export const addQuestion = async (req, res) => {
  try {
    const { chapterId, type, question, options, answer, explanation, imageUrl } =
      req.body;
    if (!chapterId || !type || !question || !options || !answer)
      return res.status(400).json({ message: "Missing required fields" });

    const q = await Question.create({
      chapterId,
      type,
      question,
      options,
      answer,
      explanation: explanation || "",
      imageUrl: imageUrl || null,
    });
    res.status(201).json(q);
  } catch (err) {
    console.error("Add question error:", err);
    res.status(500).json({ message: "Failed to add question" });
  }
};


export const updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updated = await Chapter.findByIdAndUpdate(id, { name }, { new: true });
    if (!updated) return res.status(404).json({ message: "Chapter not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update chapter error:", err);
    res.status(500).json({ message: "Failed to update chapter" });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, question, options, answer, explanation } = req.body;
    const updated = await Question.findByIdAndUpdate(
      id,
      { type, question, options, answer, explanation },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Question not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update question error:", err);
    res.status(500).json({ message: "Failed to update question" });
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
