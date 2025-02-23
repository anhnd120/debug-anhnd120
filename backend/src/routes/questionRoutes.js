const express = require("express");
const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// CRUD câu hỏi (Chỉ giáo viên mới có thể thêm, sửa, xóa)
router.post("/", authMiddleware, createQuestion);
router.get("/", authMiddleware, getAllQuestions);
router.get("/:id", authMiddleware, getQuestionById);
router.put("/:id", authMiddleware, updateQuestion);
router.delete("/:id", authMiddleware, deleteQuestion);

module.exports = router;
