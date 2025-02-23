const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  language: { type: String, required: true },
  type: { type: String, required: true, enum: ["multiple-choice", "coding", "debugging"] },
  difficulty: { type: Number, required: true, min: 1, max: 5 },
  testCases: [{ input: String, expectedOutput: String }], // ✅ Fix lỗi lưu expectedOutput
  buggyCode: { type: String, trim: true }, // ✅ Thêm trim để loại bỏ khoảng trắng thừa
  expectedOutput: [{ type: String, trim: true }], // ✅ Thêm trim và lưu đúng kiểu mảng
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);