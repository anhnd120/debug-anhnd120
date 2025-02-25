<template>
  <div class="exam-container">
    <h2>{{ exam.title }}</h2>
    <h3>{{ exam.description }}</h3>

    <!-- Hiển thị thời gian còn lại -->
    <div class="timer">⏳ Thời gian làm bài: {{ formattedStartTime }} - {{ formattedEndTime }}</div>

    <div v-for="(question, index) in exam.questions" :key="question._id" class="question-block">
      <h4>Câu {{ index + 1 }}: {{ question.title }}</h4>
      <p>{{ question.description }}</p>

      <!-- Nút Reset Đề Bài -->
      <button @click="resetBuggyCode(question._id)" class="reset-btn">🔄 Reset Đề Bài</button>
      <!-- Nút kiểm tra riêng cho từng câu -->
      <button @click="checkAnswer(question._id)" class="checking-btn" :disabled="checking[question._id]">
        {{ checking[question._id] ? "⏳ Đang chấm điểm..." : "✔ Kiểm tra" }}
      </button>

      <!-- Monaco Editor hiển thị đề bài (READONLY) -->
      <h4>Đề bài:</h4>
      <MonacoEditor
        :key="monacoKeys[question._id]"
        :model-value="decodeHTML(buggyCode[question._id])"
        :language="question.language"
        :options="{ readOnly: true }"
      />

      <!-- Monaco Editor để sinh viên nhập bài làm -->
      <h4>Bài làm:</h4>
      <MonacoEditor
        v-model="submittedCode[question._id]"
        :language="question.language"
      />

      <!-- Hiển thị kết quả của từng câu -->
      <p v-if="questionResults[question._id]" class="result">
        {{ questionResults[question._id] }}
      </p>
    </div>

    <!-- Nút Nộp bài -->
     <div class="submit-container">
      <button @click="submitExam" :disabled="submitting" class="submit-btn">Nộp bài</button>
     </div>
    <p v-if="submissionResult">{{ submissionResult }}</p>
  </div>
</template>


<script>
import { api } from "@/api";
import MonacoEditor from "@/components/MonacoEditor.vue";

export default {
  components: { MonacoEditor },
  data() {
    return {
      exam: {},
      buggyCode: {}, // Lưu nội dung buggyCode (đề bài)
      originalBuggyCode: {}, // Lưu buggyCode gốc để reset
      monacoKeys: {}, // Key để force re-render Monaco Editor đề bài
      submittedCode: {}, // Lưu code sinh viên nhập vào
      checking: {}, // Trạng thái đang chấm điểm của từng câu hỏi
      questionResults: {}, // Lưu kết quả điểm của từng câu hỏi
      submissionResult: "",
      submitting: false,
      timeLeft: 0,
      timerInterval: null,
    };
  },
  async created() {
    await this.loadExam();
  },
  computed: {
    formattedStartTime() {
      return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Bangkok"
      }).format(new Date(this.exam.startTime));
    },
    formattedEndTime() {
      return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Bangkok"
      }).format(new Date(this.exam.endTime));
    }
  },
  methods: {
    async loadExam() {
      try {
        const response = await api.get(`/coding/exams/${this.$route.params.id}`);
        this.exam = response.data;
        this.timeLeft = this.exam.timeLimit * 60;
        this.startTimer();

        // Khởi tạo dữ liệu buggyCode và submittedCode
        this.exam.questions.forEach(q => {
          this.buggyCode[q._id] = q.buggyCode;
          this.originalBuggyCode[q._id] = q.buggyCode; // Lưu bản gốc để reset
          this.monacoKeys[q._id] = Date.now(); // Tạo key ban đầu cho Monaco Editor đề bài
          this.submittedCode[q._id] = ""; // Ban đầu để trống, sinh viên nhập bài làm
          this.questionResults[q._id] = ""; // Chưa có kết quả ban đầu
          this.checking[q._id] = false; // Chưa chấm điểm
        });

      } catch (error) {
        console.error("Lỗi khi tải bài thi:", error);
      }
    },

    resetBuggyCode(questionId) {
      this.buggyCode[questionId] = this.originalBuggyCode[questionId]; // Reset lại đề bài
      this.monacoKeys[questionId] = Date.now(); // Cập nhật key để force re-render Monaco Editor đề bài
      console.log(`🔄 Đã reset đề bài cho câu hỏi ${questionId}`);
    },

    decodeHTML(html) {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = html;
      return textarea.value;
    },

    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          clearInterval(this.timerInterval);
          this.submitExam();
        }
      }, 1000);
    },

    async checkAnswer(questionId) {
      try {
        const token = localStorage.getItem("token");

        if (!this.submittedCode[questionId] || this.submittedCode[questionId].trim() === "") {
          alert("Vui lòng nhập code trước khi kiểm tra!");
          return;
        }

        console.log("📩 Gửi request kiểm tra:", {
          questionId,
          code: this.submittedCode[questionId].trim(),
        });

        const response = await api.post(
          "/coding/check-answer",
          {
            questionId,
            code: this.submittedCode[questionId].trim(),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("✅ Kết quả kiểm tra:", response.data);
        alert(response.data.correct);

      } catch (error) {
        console.error("❌ Lỗi khi kiểm tra bài:", error);
        alert("❌ Lỗi khi kiểm tra bài!");
      }
    },



    async submitExam() {
      
        this.submitting = true;
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Bạn chưa đăng nhập!");
          return;
        }

        const formattedAnswers = Object.keys(this.submittedCode).map(questionId => ({
          questionId,
          code: this.submittedCode[questionId]?.trim() || "",
        }));

        const response = await api.post(
          "/coding/submissions",
          { examId: this.exam._id, answers: formattedAnswers },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.submissionResult = "✅ Nộp bài thành công!";
      } catch (error) {
        console.error("❌ Lỗi khi nộp bài:", error);
        this.submissionResult = "❌ Lỗi khi nộp bài";
      } finally {
        this.submitting = false;
      }
    },
  },
  beforeUnmount() {
    clearInterval(this.timerInterval);
  },
};
</script>


<style scoped>
.exam-container {
  padding: 20px;
}

.question-block {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.timer {
  font-size: 18px;
  font-weight: bold;
  color: red;
}

.reset-btn {
  background-color: #ff9800;
  color: white;
  border: none;
  padding: 8px 15px;
  cursor: pointer;
  margin-bottom: 15px;
  border-radius: 5px;
}

.checking-btn {
  background-color: #ff9800;
  color: white;
  border: none;
  padding: 8px 15px;
  cursor: pointer;
  margin-bottom: 15px;
  border-radius: 5px;
  float: right;
}
.submit-container {
  display: flex;
  justify-content: center; /* Căn giữa theo chiều ngang */
}

.submit-btn {
  background-color: #3e940d;
  color: white;
  border: none;
  padding: 8px 15px;
  cursor: pointer;
  margin-bottom: 15px;
  border-radius: 5px;
}
</style>
