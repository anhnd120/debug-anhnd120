const axios = require("axios");
const CodingExam = require("../models/CodingExam");
const Submission = require("../models/submission"); // Sử dụng model Submission
const CodingQuestion = require("../models/codingQuestion"); // ✅ Đã import
require("dotenv").config();

const languageMap = {
  php: 68,
  javascript: 63,
  python: 71,
  java: 62,
  csharp: 51,
  typescript: 74,
};

// Hàm delay để tránh lỗi 429 (Too Many Requests)
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 📌 **API kiểm tra kết quả từng câu hỏi**
exports.checkAnswer = async (req, res) => {
  try {
    const { questionId, code } = req.body;

    console.log("📩 Nhận request kiểm tra bài:", req.body);

    // 📌 Kiểm tra questionId có tồn tại không?
    if (!questionId || !code) {
      return res.status(400).json({ message: "Thiếu questionId hoặc code" });
    }

    const question = await CodingQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Không tìm thấy câu hỏi" });
    }

    console.log("✅ Câu hỏi tìm thấy:", question);

    // 📌 Kiểm tra nếu không có expectedOutput
    if (!question.expectedOutput) {
      return res.status(400).json({ message: "Câu hỏi không có expectedOutput" });
    }

    console.log("🚀 Gửi code lên Judge0...");

    const judgeResponse = await axios.post(
      `${process.env.JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: code,
        language_id: languageMap[question.language],
      },
      {
        headers: {
          "X-RapidAPI-Host": process.env.JUDGE0_API_HOST,
          "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Response từ Judge0:", judgeResponse.data);

    const output = judgeResponse.data.stdout?.trim() || "";
    const expectedOutput = question.expectedOutput.trim();
    const isCorrect = output === expectedOutput;

    return res.status(200).json({
      message: "Kiểm tra kết quả thành công",
      questionId,
      expectedOutput,
      actualOutput: output,
      correct: isCorrect,
    });

  } catch (error) {
    console.error("❌ Lỗi khi kiểm tra kết quả:", error);
    return res.status(500).json({ message: "Lỗi khi kiểm tra kết quả", error: error.message });
  }
};


// 📌 **Xử lý Submit Bài Thi**
// exports.submitCodingExam = async (req, res) => {
//   try {
//     const { examId, answers } = req.body;
//     const exam = await CodingExam.findById(examId).populate("questions");

//     if (!exam) return res.status(404).json({ message: "Không tìm thấy bài thi" });

//     let totalScore = 0;
//     let submissionAnswers = [];

//     for (const answer of answers) {
//       const question = exam.questions.find(q => q._id.toString() === answer.questionId);
//       if (!question) continue;

//       await delay(1000); // Thêm delay để tránh lỗi 429

//       // 📌 **Gửi code lên Judge0 để biên dịch**
//       const judgeResponse = await axios.post(
//         `${process.env.JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`,
//         {
//           source_code: answer.code,
//           language_id: languageMap[question.language],
//           stdin: "",
//         },
//         {
//           headers: {
//             "X-RapidAPI-Host": process.env.JUDGE0_API_HOST,
//             "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const output = judgeResponse.data.stdout?.trim() || "";
//       const expectedOutput = question.expectedOutput.trim();

//       // 📌 **So sánh kết quả với `expectedOutput`**
//       let status = "incorrect";
//       let score = 0;
//       let feedback = [];

//       if (output === expectedOutput) {
//         status = "correct";
//         score = 10;
//       } else {
//         feedback.push({ error: output, message: "Output không khớp với đáp án mong muốn" });
//       }

//       totalScore += score;

//       // 📌 **Lưu kết quả của từng câu hỏi**
//       submissionAnswers.push({
//         questionId: answer.questionId,
//         code: answer.code,
//         submittedErrors: [], // Không cần cho bài code
//         output,
//         status,
//         score,
//         feedback,
//       });
//     }

//     // 📌 **Lưu vào MongoDB với Model Submission**
//     const submission = new Submission({
//       examId,
//       userId: req.user.id, // Lấy user từ token
//       answers: submissionAnswers,
//       totalScore,
//     });

//     await submission.save();

//     // 📌 **Trả kết quả về client**
//     res.status(200).json({
//       message: "Bài thi đã nộp thành công",
//       totalScore,
//       answers: submissionAnswers,
//     });

//   } catch (error) {
//     console.error("❌ Lỗi khi nộp bài:", error);
//     res.status(500).json({ message: "Lỗi khi nộp bài", error: error.message });
//   }
// };

exports.submitCodingExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;
    const exam = await CodingExam.findById(examId).populate("questions");

    if (!exam) return res.status(404).json({ message: "Không tìm thấy bài thi" });

    // 📌 Kiểm tra nếu người dùng đã nộp bài trước đó
    const previousSubmission = await Submission.findOne({ userId: req.user.id, examId });
    if (previousSubmission) {
      return res.status(403).json({ message: "Bạn đã nộp bài thi này rồi, không thể nộp lại!" });
    }

    let totalScore = 0;
    let submissionAnswers = [];

    for (const answer of answers) {
      const question = exam.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) continue;

      await delay(1000); // Thêm delay để tránh lỗi 429

      // 📌 **Gửi code lên Judge0 để biên dịch**
      const judgeResponse = await axios.post(
        `${process.env.JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: answer.code,
          language_id: languageMap[question.language],
          stdin: "",
        },
        {
          headers: {
            "X-RapidAPI-Host": process.env.JUDGE0_API_HOST,
            "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const output = judgeResponse.data.stdout?.trim() || "";
      const expectedOutput = question.expectedOutput.trim();

      // 📌 **So sánh kết quả với `expectedOutput`**
      let status = "incorrect";
      let score = 0;
      let feedback = [];

      if (output === expectedOutput) {
        status = "correct";
        score = 10;
      } else {
        feedback.push({ expected: expectedOutput, actual: output, message: "Output không khớp với đáp án mong muốn" });
      }

      totalScore += score;

      // 📌 **Lưu kết quả của từng câu hỏi**
      submissionAnswers.push({
        questionId: answer.questionId,
        code: answer.code,
        output,
        status,
        score,
        feedback,
      });
    }

    // 📌 **Lưu vào MongoDB với Model Submission**
    const submission = new Submission({
      examId,
      userId: req.user.id,
      answers: submissionAnswers,
      totalScore,
    });

    await submission.save();

    // 📌 **Trả kết quả về client**
    res.status(200).json({
      message: "Bài thi đã nộp thành công",
      totalScore,
      answers: submissionAnswers,
    });

  } catch (error) {
    console.error("❌ Lỗi khi nộp bài:", error);
    res.status(500).json({ message: "Lỗi khi nộp bài", error: error.message });
  }
};


