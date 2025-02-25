const Exam = require("../models/exam");
const Question = require("../models/question");
const moment = require("moment-timezone"); // Hỗ trợ múi giờ

// 📌 Tạo bài thi mới
exports.createExam = async (req, res) => {
  try {
    const { title, description, questions, timeLimit, startTime, endTime } = req.body;

    // Kiểm tra danh sách câu hỏi hợp lệ
    const validQuestions = await Question.find({ _id: { $in: questions } });

    if (validQuestions.length !== questions.length) {
      return res.status(400).json({ message: "Một hoặc nhiều câu hỏi không hợp lệ" });
    }

    // Kiểm tra câu hỏi trùng lặp
    const uniqueQuestions = [...new Set(questions.map(q => q.toString()))];
    if (uniqueQuestions.length !== questions.length) {
      return res.status(400).json({ message: "Không được phép thêm câu hỏi trùng lặp" });
    }

    // Chỉ cho phép dạng câu hỏi `coding` và `debugging`
    const allowedTypes = ["coding", "debugging"];
    const invalidQuestions = validQuestions.filter(q => !allowedTypes.includes(q.type));
    if (invalidQuestions.length > 0) {
      return res.status(400).json({ message: "Chỉ được thêm câu hỏi dạng coding hoặc debugging vào bài thi" });
    }

    // Chuyển thời gian từ múi giờ +7 (Asia/Bangkok) sang UTC
    const startTimeUTC = moment.tz(startTime, "Asia/Bangkok").utc().toDate();
    const endTimeUTC = moment.tz(endTime, "Asia/Bangkok").utc().toDate();

    if (startTimeUTC >= endTimeUTC) {
      return res.status(400).json({ message: "Thời gian bắt đầu phải trước thời gian kết thúc" });
    }

    const newExam = new Exam({
      title,
      description,
      questions,
      timeLimit,
      startTime: startTimeUTC,
      endTime: endTimeUTC,
      createdBy: req.user.id,
    });

    await newExam.save();
    res.status(201).json({ message: "Bài thi đã được tạo thành công", exam: newExam });

  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// 📌 Lấy danh sách bài thi (chỉ hiển thị bài thi đang diễn ra)
exports.getAllExams = async (req, res) => {
  try {
    const nowUTC = moment().utc().toDate();

    const exams = await Exam.find({
      startTime: { $lte: nowUTC }, // Chỉ lấy bài thi đã bắt đầu
      endTime: { $gte: nowUTC }, // Chỉ lấy bài thi chưa kết thúc
    })
      .populate("createdBy", "username")
      .populate({
        path: "questions",
        select: "title language type difficulty",
      });

    const examsWithLocalTime = exams.map(exam => ({
      ...exam.toObject(),
      startTime: moment(exam.startTime).tz("Asia/Bangkok").format(),
      endTime: moment(exam.endTime).tz("Asia/Bangkok").format()
    }));

    res.json(examsWithLocalTime);
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// 📌 Lấy chi tiết bài thi theo ID (chỉ hiển thị nếu đang trong thời gian làm bài)
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

    const nowUTC = moment().utc().toDate();
    if (nowUTC < exam.startTime || nowUTC > exam.endTime) {
      return res.status(403).json({ message: "Bài thi chưa bắt đầu hoặc đã kết thúc" });
    }

    res.json({
      ...exam.toObject(),
      startTime: moment(exam.startTime).tz("Asia/Bangkok").format(),
      endTime: moment(exam.endTime).tz("Asia/Bangkok").format()
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// 📌 Cập nhật bài thi
exports.updateExam = async (req, res) => {
  try {
    const { title, description, questions, timeLimit, startTime, endTime } = req.body;

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

    // Chỉ chấp nhận `coding` và `debugging`
    const allowedTypes = ["coding", "debugging"];
    const invalidQuestions = validQuestions.filter(q => !allowedTypes.includes(q.type));
    if (invalidQuestions.length > 0) {
      return res.status(400).json({ message: "Chỉ được thêm câu hỏi dạng coding hoặc debugging vào bài thi" });
    }

    // Chuyển thời gian từ múi giờ +7 sang UTC
    const startTimeUTC = moment.tz(startTime, "Asia/Bangkok").utc().toDate();
    const endTimeUTC = moment.tz(endTime, "Asia/Bangkok").utc().toDate();

    if (startTimeUTC >= endTimeUTC) {
      return res.status(400).json({ message: "Thời gian bắt đầu phải trước thời gian kết thúc" });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      { title, description, questions, timeLimit, startTime: startTimeUTC, endTime: endTimeUTC },
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
