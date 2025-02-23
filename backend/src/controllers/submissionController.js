const axios = require("axios");
const Submission = require("../models/submission");
const Exam = require("../models/exam");
const Question = require("../models/question");
require("dotenv").config();

// ✅ Mapping ngôn ngữ sang Judge0 ID
const languageMap = {
  javascript: 63,
  python: 71,
  java: 62,
  csharp: 51,
  php: 68,
  typescript: 74,
  sql: 82,
};

const runCodeOnJudge0 = async (code, languageId, input) => {
  try {
    const response = await axios.post(
      `${process.env.JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: code,
        language_id: languageId,
        stdin: input, // Gửi test case nếu cần
      },
      {
        headers: {
          "X-RapidAPI-Host": process.env.JUDGE0_API_HOST,
          "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi chạy code trên Judge0:", error);
    return null;
  }
};

// 📌 Hàm chấm điểm
const gradeSubmission = async (answers) => {
  let totalScore = 0;
  const gradedAnswers = [];

  for (const answer of answers) {
    const question = await Question.findById(answer.questionId);
    if (!question) continue;

    let isCorrect = false;
    let status = "incorrect";
    let score = 0;
    let output = "";
    let errorMessage = null;

    console.log("🛠️ Kiểm tra code của thí sinh:", answer.code);
    console.log("✅ Test cases:", question.testCases);

    if (!answer.code || answer.code.trim() === "") {
      status = "not_attempted";
      errorMessage = "Chưa nhập code";
    } else {
      try {
        const languageId = languageMap[question.language];
        if (!languageId) throw new Error(`Ngôn ngữ không hỗ trợ: ${question.language}`);

        if (question.type === "coding") {
          console.log("🔹 Chấm điểm Coding...");
          let passedAll = true;

          for (const testCase of question.testCases) {
            // ✅ Nếu code của sinh viên có `console.log(sum(a, b))` => Không cần truyền input
            let shouldUseTestCaseInput = !answer.code.includes("console.log(sum(");

            // ✅ Gửi lên Judge0
            const result = await runCodeOnJudge0(answer.code, languageId, shouldUseTestCaseInput ? testCase.input : "");

            if (result && result.status.id === 3) {
              const actualOutput = result.stdout ? result.stdout.trim() : "";
              const expectedOutput = testCase.expectedOutput.trim();

              console.log(`📌 So sánh output: Expected: '${expectedOutput}', Got: '${actualOutput}'`);

              if (actualOutput !== expectedOutput) {
                passedAll = false;
                errorMessage = `Sai test case: input '${testCase.input}', Expected '${expectedOutput}', Got '${actualOutput}'`;
                break;
              }
            } else {
              passedAll = false;
              errorMessage = result?.stderr || result?.message || "Lỗi runtime";
              break;
            }
          }

          if (passedAll) {
            isCorrect = true;
            score = 10;
          }
        }
      } catch (error) {
        console.error("❌ Lỗi khi chạy code:", error);
        errorMessage = "Lỗi runtime hoặc lỗi gửi lên Judge0";
      }
    }

    if (isCorrect) {
      status = "correct";
    }

    totalScore += score;
    gradedAnswers.push({ ...answer, status, score, output, errorMessage });
  }

  return { totalScore, gradedAnswers };
};


// 📌 Nộp bài thi
exports.submitExam = async (req, res) => {
  try {
    console.log("🛠️ Dữ liệu nhận từ frontend:", req.body);

    const { examId, answers } = req.body;
    const userId = req.user?.id;

    if (!examId || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid submission data" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized, token missing or invalid" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    console.log("🛠️ Chấm bài thi...");
    const { totalScore, gradedAnswers } = await gradeSubmission(answers);

    console.log("📌 Debug kết quả chấm bài:", gradedAnswers);

    console.log("✅ Lưu kết quả vào database...");
    const submission = new Submission({
      examId,
      userId,
      answers: gradedAnswers,
      totalScore,
    });

    await submission.save();
    res.status(201).json({ message: "Exam submitted successfully", submission });
  } catch (error) {
    console.error("❌ Lỗi Backend:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};




// 📌 Lấy danh sách bài thi đã làm của sinh viên
exports.getStudentSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const submissions = await Submission.find({ userId }).populate("examId", "title description");

    res.json(submissions);
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
