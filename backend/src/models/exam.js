const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }], // Liên kết với câu hỏi
  timeLimit: { type: Number, required: true }, // Thời gian làm bài (phút)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Giáo viên tạo bài thi
  createdAt: { type: Date, default: Date.now },
});

const Exam = mongoose.model("Exam", examSchema);
module.exports = Exam;
