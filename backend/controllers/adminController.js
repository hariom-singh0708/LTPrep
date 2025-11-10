import Subject from "../models/Subject.js";
import Chapter from "../models/Chapter.js";
import Question from "../models/Question.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const addSubject = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price == null)
      return res.status(400).json({ message: "Name & price required" });

    const subject = await Subject.create({ name, price });
    res.status(201).json(subject);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: "Subject already exists" });
    console.error("Add subject error:", err);
    res.status(500).json({ message: "Failed to add subject" });
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


export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    const updated = await Subject.findByIdAndUpdate(
      id,
      { name, price },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Subject not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update subject error:", err);
    res.status(500).json({ message: "Failed to update subject" });
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


export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSubjects = await Subject.countDocuments();

    // Sum of all successful transactions
    const transactions = await Transaction.find({});
    const totalRevenue = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);

    // Recent purchases from users
    const users = await User.find({ "purchases.0": { $exists: true } })
      .populate("purchases.subjectId", "name")
      .sort({ "purchases.purchasedAt": -1 })
      .limit(10);

    const recentPurchases = [];
    users.forEach((user) => {
      user.purchases.slice(-3).forEach((p) => {
        recentPurchases.push({
          userName: user.name,
          subjectName: p.subjectId?.name || "Unknown",
          amount: p.amount,
          purchasedAt: p.purchasedAt,
        });
      });
    });

    res.json({
      totalUsers,
      totalSubjects,
      totalRevenue,
      recentPurchases: recentPurchases.slice(-10).reverse(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};