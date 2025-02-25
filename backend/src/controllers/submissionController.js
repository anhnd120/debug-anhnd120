const axios = require("axios");
const Submission = require("../models/submission");
const Exam = require("../models/exam");
const Question = require("../models/question");
const moment = require("moment-timezone");

require("dotenv").config();

const gradeDebugging = (submittedErrors, correctErrors) => {
  let score = 0;
  let feedback = [];
  let correctCount = 0;

  const uniqueSubmittedErrors = []; // Lưu lỗi duy nhất
const seenErrors = new Set(); // Dùng để kiểm tra lỗi trùng

// Lọc bỏ lỗi trùng lặp từ submittedErrors
for (const submitted of submittedErrors) {
    const key = `${submitted.error.trim()}|${submitted.correct.trim()}`;
    if (!seenErrors.has(key)) {
        seenErrors.add(key);
        uniqueSubmittedErrors.push(submitted);
    }
}

for (const submitted of uniqueSubmittedErrors) {
    const found = correctErrors.find(err => err.error.trim() === submitted.error.trim());

    if (found) {
        const isCorrect = found.correct.trim() === submitted.correct.trim();

        if (isCorrect) {
            correctCount++; // Đếm số lỗi đúng
            feedback.push({ error: submitted.error, message: "Correct" });
        } else {
            feedback.push({
                error: submitted.error,
                message: `Incorrect. Expected: "${found.correct}", but got: "${submitted.correct}"`
            });
        }
    } else {
        feedback.push({
            error: submitted.error,
            message: "Incorrect. This error is not in the expected fixes list."
        });
    }
}



  // ✅ Cập nhật lại cách tính điểm
  const maxScore = 10; // Điểm tối đa nếu sửa đúng hết lỗi
  const perErrorScore = maxScore / correctErrors.length; // Điểm cho mỗi lỗi đúng

  score = correctCount * perErrorScore;

  // Nếu sinh viên sửa **toàn bộ lỗi đúng**, đánh dấu là `correct`
  let status = "incorrect";
  if (correctCount === correctErrors.length) {
    status = "correct";
  } else if (correctCount > 0) {
    status = "partial"; // Một số lỗi đúng
  }

  return { score, feedback, status };
};

// 📌 Nộp bài thi

exports.submitExam = async (req, res) => {
  try {
    console.log("🛠️ Dữ liệu nhận từ frontend:", req.body);

    const { examId, answers } = req.body;
    const userId = req.user?.id;

    if (!examId || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Dữ liệu nộp bài không hợp lệ" });
    }

    // 📌 Kiểm tra xem bài thi có tồn tại không
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // 📌 Kiểm tra nếu người dùng đã nộp bài
    const previousSubmission = await Submission.findOne({ userId, examId });
    if (previousSubmission) {
      return res.status(403).json({ message: "Bạn đã nộp bài thi này rồi, không thể nộp lại!" });
    }

    let totalScore = 0;
    const gradedAnswers = [];

    for (const answer of answers) {
      const question = await Question.findById(answer.questionId);
      if (!question) {
        console.error("❌ Không tìm thấy câu hỏi:", answer.questionId);
        continue;
      }

      let score = 0;
      let status = "incorrect";
      let feedback = [];

      if (question.type === "coding") {
        // ✅ Chấm bài coding bằng Judge0
        const judge0Result = await runJudge0(answer.code, question.language, question.testCases);
        if (judge0Result.correct) {
          status = "correct";
          score = 10;
        }
        feedback = judge0Result.feedback;
      }

      if (question.type === "debugging") {
        // ✅ Chấm bài debugging (HTML/CSS/SQL)
        const { score: calculatedScore, feedback: fixFeedback } = gradeDebugging(answer.submittedErrors, question.expectedFixes);
        score = calculatedScore;
        feedback = fixFeedback;
      }

      if (score > 0) {
        status = score === 10 ? "correct" : "partial";
      }

      totalScore += score;
      gradedAnswers.push({ ...answer, status, score, feedback });
    }

    console.log("📌 Debug kết quả chấm bài:", gradedAnswers);

    // 📌 **Lưu bài nộp vào MongoDB**
    const submission = new Submission({
      examId,
      userId,
      answers: gradedAnswers,
      totalScore,
    });

    await submission.save();
    console.log("✅ Lưu kết quả vào database thành công.");
    
    // 📌 **Trả kết quả về client**
    res.status(201).json({ message: "Nộp bài thành công", submission });

  } catch (error) {
    console.error("❌ Lỗi Backend:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};



// 📌 Lấy danh sách bài thi đã làm của sinh viên
// exports.getStudentSubmissions = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const submissions = await Submission.find().populate("examId", "title description");

//     res.json(submissions);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };



exports.getStudentSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 📌 Populate để lấy thông tin bài thi và thông tin người dùng (cả username và name)
    const submissions = await Submission.find()
      .populate("examId", "title description")
      .populate("userId", "username name"); // ✅ Lấy cả username và name cùng lúc

    // 📌 Chuyển `submittedAt` sang múi giờ Việt Nam (UTC+7)
    const formattedSubmissions = submissions.map(submission => ({
      ...submission.toObject(),
      username: submission.userId?.username, // ✅ Hiển thị tên đăng nhập
      name: submission.userId?.name, // ✅ Hiển thị tên đầy đủ
      submittedAt: moment(submission.submittedAt).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss"), // ✅ Chuyển sang UTC+7
    }));

    res.json(formattedSubmissions);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// 📌 Lấy chi tiết bài làm của sinh viên
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("examId", "title description")
      .populate("answers.questionId", "title description");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
