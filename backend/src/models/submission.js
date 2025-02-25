// const mongoose = require("mongoose");

// const submissionSchema = new mongoose.Schema({
//   examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   answers: [
//     {
//       questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
//       code: { type: String, default: "" }, // Dành cho bài code
//       submittedErrors: [{ error: String, correct: String }], // Dành cho debugging
//       output: { type: String, default: "" }, // Output khi chạy code
//       status: {
//         type: String,
//         enum: ["correct", "incorrect", "partial"], // ✅ Thêm "partial" vào enum
//         default: "incorrect",
//       },
//       score: { type: Number, default: 0 },
//       feedback: [{ error: String, message: String }], // Gửi phản hồi về lỗi
//     },
//   ],
//   totalScore: { type: Number, default: 0 },
//   submittedAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Submission", submissionSchema);

const mongoose = require("mongoose");
const moment = require("moment-timezone");

const submissionSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
      code: { type: String, default: "" },
      submittedErrors: [{ error: String, correct: String }],
      output: { type: String, default: "" },
      status: { type: String, enum: ["correct", "incorrect", "partial"], default: "incorrect" },
      score: { type: Number, default: 0 },
      feedback: [{ error: String, message: String }],
    },
  ],
  totalScore: { type: Number, default: 0 },

  // ✅ Lưu thời gian theo múi giờ Việt Nam (Asia/Ho_Chi_Minh)
  submittedAt: {
    type: Date,
    default: () => moment().tz("Asia/Ho_Chi_Minh").toDate(), // ✅ Chuyển về Date trước khi lưu
  },
});

module.exports = mongoose.model("Submission", submissionSchema);


