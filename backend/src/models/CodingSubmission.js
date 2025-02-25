const mongoose = require("mongoose");

const codingSubmissionSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "CodingExam" },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  results: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "CodingQuestion" },
    score: { type: Number, required: true },
    feedback: [{
      input: String,
      expected: String,
      actual: String,
      status: String
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model("CodingSubmission", codingSubmissionSchema);
