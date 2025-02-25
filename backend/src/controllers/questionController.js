const Question = require("../models/question");
const prettier = require("prettier");
const parserHtml = require("prettier/parser-html");

exports.createDebugQuestion = async (req, res) => {
  try {
    const { title, description, language, difficulty, buggyCode, expectedFixes } = req.body;

    // Kiểm tra ngôn ngữ hợp lệ
    if (!["html", "css", "sql", "php"].includes(language)) {
      return res.status(400).json({ message: "Ngôn ngữ không hợp lệ, chỉ hỗ trợ HTML, CSS, SQL, PHP" });
    }

    // Kiểm tra danh sách lỗi hợp lệ
    if (!Array.isArray(expectedFixes) || expectedFixes.length === 0) {
      return res.status(400).json({ message: "Câu hỏi debug phải có danh sách lỗi" });
    }

    // ✅ Đảm bảo buggyCode là string và format trước khi lưu
    let formattedBuggyCode = buggyCode;
    if (language === "html") {
      formattedBuggyCode = await prettier.format(buggyCode, { parser: "html", plugins: [parserHtml] });
    } else if (language === "css") {
      formattedBuggyCode = await prettier.format(buggyCode, { parser: "css" });
    }

    console.log("📌 Debug buggyCode:", typeof formattedBuggyCode, formattedBuggyCode);

    const newQuestion = new Question({
      title,
      description,
      language,
      type: "debugging",
      difficulty,
      buggyCode: formattedBuggyCode, // Đảm bảo đã format và là string
      expectedFixes,
      createdBy: req.user.id,
    });

    await newQuestion.save();
    res.status(201).json({ message: "Câu hỏi debug đã được tạo thành công", question: newQuestion });

  } catch (error) {
    console.error("❌ Lỗi Server khi tạo câu hỏi debug:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};




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
