<template>
  <div class="exam-container">
    <h2>{{ exam.title }}</h2>
    <h3>{{ exam.description }}</h3>

    <!-- Hiển thị thời gian còn lại -->
    <div class="timer">⏳ Thời gian làm bài: {{ formattedStartTime }} - {{ formattedEndTime }}</div>


    <div v-for="(question, index) in exam.questions" :key="question._id" class="question-block">
      <h4>Câu {{ index + 1 }}: {{ question.title }}</h4>
      <p>{{ question.description }}</p>

      <!-- Nút Reset đề bài -->
      <button @click="resetBuggyCode(question._id)" class="reset-btn">🔄 Reset Đề Bài</button>
      <button @click="addError(question._id)" class="addfalse-btn">+ Thêm lỗi</button>

      <!-- Monaco Editor (READONLY) hiển thị đề bài -->
      <MonacoEditor
        :key="monacoKeys[question._id]"
        :model-value="decodeHTML(buggyCode[question._id])"
        :language="question.language"
        :options="{ readOnly: true }"
      />

      <h4>Danh sách lỗi cần sửa:</h4>
      
      <div v-for="(error, i) in submittedErrors[question._id]" :key="i" class="error-input-group">
        <input 
          v-model="error.error"
          placeholder="Lỗi phát hiện"
          class="input-field"
        />
        <input 
          v-model="error.correct"
          placeholder="Cách sửa"
          class="input-field"
        />
        <button @click="removeError(question._id, i)" class="remove-btn">✖</button>
      </div>

      <!-- Nút thêm lỗi -->
    </div>
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
      buggyCode: {}, // Lưu nội dung buggyCode có thể thay đổi
      originalBuggyCode: {}, // Lưu buggyCode gốc để reset
      monacoKeys: {}, // Key để force re-render Monaco
      submittedErrors: {},
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
        const response = await api.get(`/exams/${this.$route.params.id}`);
        this.exam = response.data;
        this.timeLeft = this.exam.timeLimit * 60;
        this.startTimer();

        // Khởi tạo dữ liệu buggyCode và submittedErrors
        this.exam.questions.forEach(q => {
          this.buggyCode[q._id] = q.buggyCode;
          this.originalBuggyCode[q._id] = q.buggyCode; // Lưu bản gốc để reset
          this.monacoKeys[q._id] = Date.now(); // Tạo key ban đầu
          this.submittedErrors[q._id] = [];
        });

      } catch (error) {
        console.error("Lỗi khi tải bài thi:", error);
      }
    },

    resetBuggyCode(questionId) {
      this.buggyCode[questionId] = this.originalBuggyCode[questionId]; // Reset nội dung
      this.monacoKeys[questionId] = Date.now(); // Thay đổi key để re-render Monaco
      console.log(`🔄 Đã reset buggyCode cho câu hỏi ${questionId}`);
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

    addError(questionId) {
      if (!this.submittedErrors[questionId]) {
        this.submittedErrors[questionId] = [];
      }
      this.submittedErrors[questionId].push({ error: "", correct: "" });
    },

    removeError(questionId, index) {
      this.submittedErrors[questionId].splice(index, 1);
    },

    async submitExam() {
      this.submitting = true;
      try {
        const token = localStorage.getItem("token");

        const formattedAnswers = Object.keys(this.submittedErrors).map(questionId => ({
          questionId,
          submittedErrors: this.submittedErrors[questionId].filter(e => e.error && e.correct),
        }));

        await api.post(
          "/submissions",
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

.addfalse-btn {
  background-color: #ff9800;
  color: white;
  border: none;
  padding: 8px 15px;
  cursor: pointer;
  margin-bottom: 15px;
  border-radius: 5px;
  float: right;
}

.error-input-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.input-field {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.add-btn, .remove-btn {
  padding: 8px;
  cursor: pointer;
}

.remove-btn {
  background: red;
  color: white;
  border: none;
  border-radius: 5px;
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
