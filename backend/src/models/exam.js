const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Tiêu đề bài thi
  description: { type: String, required: true }, // Mô tả bài thi
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true }], // Danh sách câu hỏi
  timeLimit: { type: Number, required: true }, // Thời gian làm bài (phút)
  startTime: { type: Date, required: true }, // Thời gian bắt đầu bài thi
  endTime: { type: Date, required: true }, // Thời gian kết thúc bài thi
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Người tạo bài thi
}, { timestamps: true });

// Đảm bảo `startTime` luôn nhỏ hơn `endTime`
examSchema.pre("save", function (next) {
  if (this.startTime >= this.endTime) {
    return next(new Error("Thời gian bắt đầu phải trước thời gian kết thúc"));
  }
  next();
});

module.exports = mongoose.model("Exam", examSchema);
