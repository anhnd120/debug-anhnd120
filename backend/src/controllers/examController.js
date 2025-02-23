const Exam = require("../models/exam");
const Question = require("../models/question");

// 📌 Tạo bài thi mới
exports.createExam = async (req, res) => {
  try {
    const { title, description, questions, timeLimit } = req.body;

    // Kiểm tra xem danh sách câu hỏi có hợp lệ không
    const validQuestions = await Question.find({ _id: { $in: questions } });

    if (validQuestions.length !== questions.length) {
      return res.status(400).json({ message: "Một hoặc nhiều câu hỏi không hợp lệ" });
    }

    // Kiểm tra xem có câu hỏi nào bị trùng không
    const uniqueQuestions = [...new Set(questions.map(q => q.toString()))];
    if (uniqueQuestions.length !== questions.length) {
      return res.status(400).json({ message: "Không được phép thêm câu hỏi trùng lặp" });
    }

    // Chỉ chấp nhận các loại câu hỏi `coding` và `debugging`
    const allowedTypes = ["coding", "debugging"];
    const invalidQuestions = validQuestions.filter(q => !allowedTypes.includes(q.type));

    if (invalidQuestions.length > 0) {
      return res.status(400).json({ message: "Chỉ được thêm câu hỏi dạng coding hoặc debugging vào bài thi" });
    }

    const newExam = new Exam({
      title,
      description,
      questions,
      timeLimit,
      createdBy: req.user.id, // Giáo viên tạo bài thi
    });

    await newExam.save();
    res.status(201).json({ message: "Bài thi đã được tạo thành công", exam: newExam });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// 📌 Lấy danh sách bài thi (có chi tiết câu hỏi)
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("createdBy", "username")
      .populate({
        path: "questions",
        select: "title language type difficulty",
      });

    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// 📌 Lấy chi tiết bài thi theo ID (hỗ trợ debugging)
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate("createdBy", "username")
      .populate({
        path: "questions",
        select: "title description language type difficulty testCases buggyCode expectedOutput",
      });

    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// 📌 Cập nhật bài thi (thêm điều kiện kiểm tra)
exports.updateExam = async (req, res) => {
  try {
    const { title, description, questions, timeLimit } = req.body;

    // Kiểm tra câu hỏi hợp lệ
    const validQuestions = await Question.find({ _id: { $in: questions } });

    if (validQuestions.length !== questions.length) {
      return res.status(400).json({ message: "Một hoặc nhiều câu hỏi không hợp lệ" });
    }

    // Kiểm tra trùng lặp
    const uniqueQuestions = [...new Set(questions.map(q => q.toString()))];
    if (uniqueQuestions.length !== questions.length) {
      return res.status(400).json({ message: "Không được phép thêm câu hỏi trùng lặp" });
    }

    // Kiểm tra chỉ cho phép `coding` và `debugging`
    const allowedTypes = ["coding", "debugging"];
    const invalidQuestions = validQuestions.filter(q => !allowedTypes.includes(q.type));

    if (invalidQuestions.length > 0) {
      return res.status(400).json({ message: "Chỉ được thêm câu hỏi dạng coding hoặc debugging vào bài thi" });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      { title, description, questions, timeLimit },
      { new: true }
    );

    if (!updatedExam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    res.json({ message: "Bài thi đã được cập nhật thành công", exam: updatedExam });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// 📌 Xóa bài thi
exports.deleteExam = async (req, res) => {
  try {
    const deletedExam = await Exam.findByIdAndDelete(req.params.id);
    if (!deletedExam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    res.json({ message: "Bài thi đã được xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};
