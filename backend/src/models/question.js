const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  language: { type: String, required: true, enum: ["html", "css", "javascript", "sql", "php", "c#", "java"] },
  type: { type: String, required: true, enum: ["multiple-choice", "coding", "debugging"] },
  difficulty: { type: Number, required: true, min: 1, max: 5 },
  buggyCode: { type: String }, // 📌 Mã HTML bị lỗi (upload thẳng)
  expectedFixes: [
    {
      error: String, // 📌 Nội dung lỗi
      correct: String, // ✅ Đáp án đúng
      message: String, // 💡 Gợi ý sửa
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
