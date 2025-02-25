const CodingExam = require("../models/CodingExam");

const moment = require("moment-timezone"); // Thêm thư viện hỗ trợ múi giờ

exports.createCodingExam = async (req, res) => {
  try {
    const { title, questions, timeLimit, startTime, endTime } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Bài thi phải có ít nhất một câu hỏi" });
    }

    if (!startTime || !endTime || new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: "Thời gian bắt đầu phải trước thời gian kết thúc" });
    }

    // Chuyển startTime và endTime từ múi giờ +7 sang UTC
    const startTimeUTC = moment.tz(startTime, "Asia/Bangkok").utc().toDate();
    const endTimeUTC = moment.tz(endTime, "Asia/Bangkok").utc().toDate();

    const newExam = new CodingExam({
      title,
      questions,
      timeLimit,
      startTime: startTimeUTC,
      endTime: endTimeUTC,
      createdBy: req.user.id,
    });

    await newExam.save();
    res.status(201).json({ message: "Bài thi lập trình đã được tạo thành công", exam: newExam });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};



// 📌 Lấy danh sách bài thi (có chi tiết câu hỏi)
exports.getAllCodingExam = async (req, res) => {
  try {
    const nowUTC = moment().utc().toDate();

    const exams = await CodingExam.find({
      startTime: { $lte: nowUTC }, // Chỉ lấy bài thi đã bắt đầu
      endTime: { $gte: nowUTC }, // Chỉ lấy bài thi chưa kết thúc
    })
      .populate("createdBy", "username")
      .populate({
        path: "questions",
        select: "title language type difficulty",
      });

    // Chuyển thời gian về múi giờ +7 trước khi trả về frontend
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


// 📌 Lấy chi tiết bài thi theo ID (hỗ trợ debugging)
exports.getCodingExamById = async (req, res) => {
  try {
    const exam = await CodingExam.findById(req.params.id)
      .populate("createdBy", "username")
      .populate({
        path: "questions",
        select: "title description language type difficulty testCases buggyCode expectedOutput",
      });

    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Chuyển startTime và endTime từ UTC sang GMT+7 trước khi trả về
    const startTimeLocal = moment(exam.startTime).tz("Asia/Bangkok").format();
    const endTimeLocal = moment(exam.endTime).tz("Asia/Bangkok").format();

    // Kiểm tra thời gian hiện tại có nằm trong khoảng thi không
    const nowUTC = moment().utc().toDate();
    if (nowUTC < exam.startTime || nowUTC > exam.endTime) {
      return res.status(403).json({ message: "Bài thi chưa bắt đầu hoặc đã kết thúc" });
    }

    // Trả về dữ liệu với thời gian theo múi giờ GMT+7
    res.json({
      ...exam.toObject(),
      startTime: startTimeLocal,
      endTime: endTimeLocal
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};


