require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/database");

// Import routes
const userRoutes = require("./src/routes/userRoutes");
const examRoutes = require("./src/routes/examRoutes");
const questionRoutes = require("./src/routes/questionRoutes");
const submissionRoutes = require("./src/routes/submissionRoutes");
const codeRoutes = require("./src/routes/codeRoutes");
const codingRoutes = require("./src/routes/codingRoutes");

const app = express();

// ✅ Bật CORS với `credentials: true` để gửi `Authorization`
app.use(cors({
  origin: "http://localhost:5173", // Hoặc domain FE của bạn
  credentials: true,
  allowedHeaders: ["Authorization", "Content-Type"]
}));

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Kết nối Database
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/coding", codingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
