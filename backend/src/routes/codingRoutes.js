const express = require("express");
const router = express.Router();
const codingQuestionController = require("../controllers/codingQuestionController");
const codingExamController = require("../controllers/codingExamController");
const codingSubmissionController = require("../controllers/codingSubmissionController");
const authMiddleware = require("../middlewares/auth");

// 📌 Route tạo câu hỏi lập trình
router.post("/questions", authMiddleware, codingQuestionController.createCodingQuestion);

// 📌 Route tạo bài thi lập trình
router.post("/exams", authMiddleware, codingExamController.createCodingExam);



// 📌 Route tạo bài thi lập trình
router.get("/exams", codingExamController.getAllCodingExam);

router.get("/exams/:id", codingExamController.getCodingExamById);


// 📌 Route nộp bài thi lập trình
router.post("/submissions", authMiddleware, codingSubmissionController.submitCodingExam);

router.post("/check-answer", authMiddleware, codingSubmissionController.checkAnswer);

module.exports = router;
