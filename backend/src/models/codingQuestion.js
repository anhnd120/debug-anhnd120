const mongoose = require("mongoose");

const codingQuestionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    difficulty: { type: Number, required: true, min: 1, max: 5 },
    buggyCode: { type: String, required: true }, // 📌 Thêm trường buggyCode
    expectedOutput: { type: String }, // 📌 Thêm trường buggyCode
    testCases: [
      {
        input: String,
        expectedOutput: String,
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodingQuestion", codingQuestionSchema);
