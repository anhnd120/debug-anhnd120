import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Đăng ký tài khoản
export const registerUser = (userData) => api.post("/users/register", userData);

// Đăng nhập
export const loginUser = (credentials) => api.post("/users/login", credentials);

// Lấy danh sách bài thi
export const fetchExams = (token) =>
  api.get("/exams", { headers: { Authorization: `Bearer ${token}` } });

// Lấy chi tiết bài thi
export const fetchExamById = (examId, token) =>
  api.get(`/exams/${examId}`, { headers: { Authorization: `Bearer ${token}` } });

// Lấy danh sách bài thi code
export const fetchCodingExams = (token) =>
  api.get("/coding/exams", { headers: { Authorization: `Bearer ${token}` } });

// Lấy chi tiết bài thi
export const fetchCodingExamById = (examId, token) =>
  api.get(`/coding/exams/${examId}`, { headers: { Authorization: `Bearer ${token}` } });

// Lấy token từ localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ Không tìm thấy token trong localStorage");
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  };

// API nộp bài thi
export const submitExam = (submissionData) =>
    axios.post(`${API_BASE_URL}/submissions`, submissionData, { headers: getAuthHeaders() });

// API nộp bài thi
export const submitCodingExam = (submissionData) =>
  axios.post(`${API_BASE_URL}/coding/submissions`, submissionData, { headers: getAuthHeaders() });

export const checkAnswer = (submissionData) =>
  axios.post(`${API_BASE_URL}/coding/check-answer`, submissionData, { headers: getAuthHeaders() });