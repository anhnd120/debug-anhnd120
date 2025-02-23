const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      code: { type: String, required: true }, // Code sinh viên nhập vào
      status: { type: String, enum: ["correct", "incorrect", "error"], default: "incorrect" },
      score: { type: Number, default: 0 },
    },
  ],
  totalScore: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
});

const Submission = mongoose.model("Submission", submissionSchema);
module.exports = Submission;
