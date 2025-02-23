const express = require("express");
const {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
} = require("../controllers/examController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// CRUD bài thi (Chỉ giáo viên mới có thể thêm, sửa, xóa)
router.post("/", authMiddleware, createExam);
router.get("/",  getAllExams);
router.get("/:id", getExamById);
router.put("/:id", authMiddleware, updateExam);
router.delete("/:id", authMiddleware, deleteExam);

module.exports = router;
