const axios = require("axios");
require("dotenv").config();

// 📌 Chạy code với Judge0
exports.runCodeWithJudge0 = async (req, res) => {
  try {
    const { code, language, stdin } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "Code hoặc ngôn ngữ không hợp lệ" });
    }

    // Map ngôn ngữ với Judge0
    const languageMap = {
      javascript: 63,
      python: 71,
      java: 62,
      csharp: 51,
      php: 68,
      typescript: 74,
      sql: 82,
    };

    if (!languageMap[language]) {
      return res.status(400).json({ message: "Ngôn ngữ không được hỗ trợ" });
    }

    // Gửi code lên Judge0
    const submission = await axios.post(
      `${process.env.JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: code,
        language_id: languageMap[language],
        stdin: stdin || "",
      },
      {
        headers: {
          "X-RapidAPI-Host": process.env.JUDGE0_API_HOST,
          "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(submission.data);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi gửi code", error: error.message });
  }
};
