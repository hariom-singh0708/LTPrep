import mongoose from "mongoose";
import Subject from "./models/Subject.js";
import Chapter from "./models/Chapter.js";
import Question from "./models/Question.js";

// ==========================
// 🔗 Constants
// ==========================
const PDF_URL = "https://drive.google.com/file/d/1rxtRMx1KNepEtOidc1P5brMF2cqCQ1zF/view";
const QUESTION_IMAGE_URL =
  "https://images.unsplash.com/photo-1608792992053-f397e328a56d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWF0aHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=1000";

const MONGO_URI = "mongodb+srv://hariom-singh0708:eJsxXMpLXQVNoSUf@cluster0.aqetme5.mongodb.net/LTPrep?retryWrites=true&w=majority&appName=Cluster0"; // change if needed

// ==========================
// 🧮 Utility Generators
// ==========================

// Small random helper
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Random topic pool
const topics = [
  "Algebra", "Geometry", "Trigonometry", "Calculus", "Physics", "Chemistry",
  "Biology", "History", "Geography", "Economics"
];

// Random question generator
const randomQuestionText = (type, chapterName) => {
  const topic = randomItem(topics);
  const templates = [
    `In ${topic}, what is the result of solving the following?`,
    `Which of the following statements about ${topic} is correct?`,
    `The concept of ${topic} is primarily used in which field?`,
    `In ${chapterName}, how is ${topic} applied in practical scenarios?`,
    `Which formula best represents ${topic}?`,
    `What is the main principle behind ${topic}?`,
  ];
  return `${type} Q: ${randomItem(templates)}`;
};

// Random options generator
const generateOptions = () => {
  const opts = [
    "Option A", "Option B", "Option C", "Option D", "Option E", "Option F"
  ];
  const count = 4 + Math.floor(Math.random() * 3); // between 4 and 6 options
  return opts.slice(0, count);
};

// Random explanation
const randomExplanation = () =>
  `This question tests conceptual understanding and application of the topic. Carefully analyze the given problem to derive the correct answer.`;

// Generate 15 random questions per type
const generateQuestions = (chapterId, type, chapterName) => {
  return Array.from({ length: 15 }).map(() => {
    const options = generateOptions();
    const answer = randomItem(options);
    return {
      chapterId,
      type,
      question: randomQuestionText(type, chapterName),
      options,
      answer,
      explanation: randomExplanation(),
      imageUrl: QUESTION_IMAGE_URL,
    };
  });
};

// ==========================
// 🌱 Seeder Function
// ==========================
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Cleanup
    await Subject.deleteMany({});
    await Chapter.deleteMany({});
    await Question.deleteMany({});
    console.log("🧹 Cleared old data");

    // Generate 5 subjects
    for (let s = 1; s <= 5; s++) {
      const subject = await Subject.create({
        name: `Subject ${s}`,
        price: 499,
        overview: `Comprehensive study of Subject ${s}, including theoretical and practical aspects.`,
        mockTests: [
          { title: `Pre Mock Test ${s}`, type: "pre", link: PDF_URL },
          { title: `Mains Mock Test ${s}`, type: "mains", link: PDF_URL },
        ],
      });

      console.log(`📘 Subject ${s} added`);

      // Add 3 chapters
      for (let c = 1; c <= 3; c++) {
        const chapterName = `Chapter ${c} - Topic of Subject ${s}`;
        const chapter = await Chapter.create({
          subjectId: subject._id,
          name: chapterName,
          studyMaterials: [
            { title: `Study Material ${c}-A`, url: PDF_URL },
            { title: `Study Material ${c}-B`, url: PDF_URL },
          ],
          mockTests: [
            { title: `Mock PDF ${c}-A`, url: PDF_URL },
            { title: `Mock PDF ${c}-B`, url: PDF_URL },
          ],
        });

        console.log(`📗 ${chapterName} created`);

        // Generate questions
        const pyqs = generateQuestions(chapter._id, "PYQ", chapterName);
        const expected = generateQuestions(chapter._id, "Expected", chapterName);

        await Question.insertMany([...pyqs, ...expected]);
        console.log(`🧩 30 questions added for ${chapterName}`);
      }
    }

    console.log("🎉 Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during seeding:", err);
    process.exit(1);
  }
}

seed();
