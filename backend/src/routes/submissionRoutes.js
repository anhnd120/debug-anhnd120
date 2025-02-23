const express = require("express");
const {
  submitExam,
  getStudentSubmissions,
  getSubmissionById,
} = require("../controllers/submissionController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// Sinh viên nộp bài thi
router.post("/", authMiddleware, submitExam);

// Sinh viên xem danh sách bài thi đã làm
router.get("/", authMiddleware, getStudentSubmissions);

// Xem chi tiết bài thi đã làm
router.get("/:id", authMiddleware, getSubmissionById);

module.exports = router;
