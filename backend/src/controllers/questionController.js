const Question = require("../models/question");

// 📌 Tạo câu hỏi mới
// exports.createQuestion = async (req, res) => {
//   try {
//     const { title, description, language, type, difficulty, testCases, buggyCode, expectedOutput } = req.body;

//     if (!["javascript", "python", "java", "c++", "c#"].includes(language)) {
//       return res.status(400).json({ message: "Invalid programming language" });
//     }

//     if (!["multiple-choice", "coding", "debugging"].includes(type)) {
//       return res.status(400).json({ message: "Invalid question type" });
//     }

//     if (difficulty < 1 || difficulty > 5) {
//       return res.status(400).json({ message: "Difficulty must be between 1 and 5" });
//     }

//     let formattedTestCases = [];
//     let formattedExpectedOutput = [];

//     if (type === "coding") {
//       if (!Array.isArray(testCases) || testCases.length === 0) {
//         return res.status(400).json({ message: "Test cases cannot be empty for coding questions" });
//       }
//       formattedTestCases = testCases.map(tc => ({
//         input: String(tc.input || "").trim(),
//         expectedOutput: String(tc.expectedOutput || "").trim(),
//       }));
//     }

//     if (type === "debugging") {
//       if (!Array.isArray(expectedOutput) || expectedOutput.length === 0) {
//         return res.status(400).json({ message: "Expected output cannot be empty for debugging questions" });
//       }
//       formattedExpectedOutput = expectedOutput.map(out => String(out).trim());
//     }

//     const newQuestion = new Question({
//       title,
//       description,
//       language,
//       type,
//       difficulty,
//       testCases: formattedTestCases,
//       buggyCode: type === "debugging" ? String(buggyCode || "").trim() : "",
//       expectedOutput: formattedExpectedOutput,
//       createdBy: req.user.id,
//     });

//     await newQuestion.save();
//     res.status(201).json({ message: "Câu hỏi đã được tạo thành công", question: newQuestion });

//   } catch (error) {
//     res.status(500).json({ message: "Lỗi server", error: error.message });
//   }
// };

exports.createQuestion = async (req, res) => {
  try {
    const { title, description, language, type, difficulty, testCases, buggyCode, expectedOutput } = req.body;

    if (!["javascript", "python", "java", "c++", "c#"].includes(language)) {
      return res.status(400).json({ message: "Invalid programming language" });
    }

    if (!["multiple-choice", "coding", "debugging"].includes(type)) {
      return res.status(400).json({ message: "Invalid question type" });
    }

    if (difficulty < 1 || difficulty > 5) {
      return res.status(400).json({ message: "Difficulty must be between 1 and 5" });
    }

    let formattedTestCases = [];
    if (type === "coding") {
      if (!Array.isArray(testCases) || testCases.length === 0) {
        return res.status(400).json({ message: "Test cases cannot be empty for coding questions" });
      }
      formattedTestCases = testCases.map(tc => ({
        input: String(tc.input || "").trim(),
        expectedOutput: String(tc.expectedOutput || "").trim(),
      }));

      // ✅ Kiểm tra nếu test case nào đó không có expectedOutput
      if (formattedTestCases.some(tc => !tc.expectedOutput)) {
        return res.status(400).json({ message: "Each test case must have an expectedOutput" });
      }
    }

    const newQuestion = new Question({
      title,
      description,
      language,
      type,
      difficulty,
      testCases: formattedTestCases,
      buggyCode: type === "debugging" ? String(buggyCode || "").trim() : "",
      expectedOutput: type === "debugging" ? expectedOutput.map(out => String(out).trim()) : [],
      createdBy: req.user.id,
    });

    await newQuestion.save();
    res.status(201).json({ message: "Câu hỏi đã được tạo thành công", question: newQuestion });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};



// 📌 Lấy danh sách câu hỏi
exports.getAllQuestions = async (req, res) => {
  try {
    const { language, type, difficulty } = req.query;
    let query = {};

    if (language) query.language = language;
    if (type) query.type = type;
    if (difficulty) query.difficulty = Number(difficulty);

    const questions = await Question.find(query).populate("createdBy", "username");
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// 📌 Lấy chi tiết câu hỏi theo ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate("createdBy", "username");
    if (!question) {
      return res.status(404).json({ message: "Không tìm thấy câu hỏi" });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// 📌 Cập nhật câu hỏi
exports.updateQuestion = async (req, res) => {
  try {
    const { title, description, language, type, difficulty, testCases, buggyCode, expectedOutput } = req.body;

    // ✅ Giữ nguyên testCases nếu không phải coding
    let updatedTestCases = [];
    if (type === "coding") {
      updatedTestCases = testCases.map(tc => ({
        input: String(tc.input || "").trim(),
        expectedOutput: String(tc.expectedOutput || "").trim(),
      }));
    } else {
      updatedTestCases = testCases || [];
    }

    // ✅ Nếu là debugging, kiểm tra buggyCode
    const updatedBuggyCode = type === "debugging" ? String(buggyCode || "") : "";

    // ✅ Nếu là debugging, kiểm tra expectedOutput
    const updatedExpectedOutput = type === "debugging" ? (Array.isArray(expectedOutput) ? expectedOutput : []) : [];

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        language,
        type,
        difficulty,
        testCases: updatedTestCases,
        buggyCode: updatedBuggyCode,
        expectedOutput: updatedExpectedOutput,
      },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Không tìm thấy câu hỏi" });
    }

    res.json({ message: "Câu hỏi đã được cập nhật", question: updatedQuestion });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// 📌 Xóa câu hỏi
exports.deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) {
      return res.status(404).json({ message: "Không tìm thấy câu hỏi" });
    }

    res.json({ message: "Câu hỏi đã được xóa" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};
