const mongoose = require("mongoose");

const codingExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "CodingQuestion" }],
  timeLimit: { type: Number, required: true }, // Thời gian làm bài (phút)
  startTime: { type: Date, required: true }, // Thời gian bắt đầu bài thi
  endTime: { type: Date, required: true }, // Thời gian kết thúc bài thi
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("CodingExam", codingExamSchema);
