const CodingQuestion = require("../models/codingQuestion");

// 📌 API tạo câu hỏi lập trình
exports.createCodingQuestion = async (req, res) => {
    try {
      const { title, description, language, difficulty, buggyCode, testCases, expectedOutput } = req.body;
  
      if (!title || !description || !language || !difficulty || !buggyCode || !testCases) {
        return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
      }
  
      const newQuestion = new CodingQuestion({
        title,
        description,
        language,
        difficulty,
        buggyCode,
        testCases,
        createdBy: req.user.id,
        expectedOutput,
      });
  
      await newQuestion.save();
      res.status(201).json({ message: "Câu hỏi đã được tạo thành công", question: newQuestion });
    } catch (error) {
      console.error("❌ Lỗi khi tạo câu hỏi:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  };
  
