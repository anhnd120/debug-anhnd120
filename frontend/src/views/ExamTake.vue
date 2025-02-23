<template>
  <div class="exam-container">
    <h2>{{ exam.title }}</h2>
    <h3>{{ exam.description }}</h3>

    <!-- Hiển thị thời gian còn lại -->
    <div class="timer">
      ⏳ Thời gian còn lại: {{ formattedTime }}
    </div>

    <div v-for="(question, index) in exam.questions" :key="question._id" class="question-block">
      <h4>Câu {{ index + 1 }}: {{ question.title }}</h4>
      <p>{{ question.description }}</p>
      <p>{{ question.buggyCode }}</p>

      <!-- Monaco Editor cho từng câu hỏi -->
      <MonacoEditor v-model="answers[question._id]" :language="question.language" />

      <pre v-if="results[question._id]">
        Kết quả: {{ results[question._id] }}
      </pre>
    </div>

    <button @click="submitExam" :disabled="submitting">Nộp bài</button>
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
      answers: {}, // Lưu mã nguồn cho từng câu hỏi
      results: {}, // Lưu kết quả chạy từng bài
      submissionResult: "",
      submitting: false,
      timeLeft: 0, // Thời gian làm bài còn lại
      timerInterval: null,
    };
  },
  async created() {
    try {
      // Lấy thông tin bài thi từ backend
      const response = await api.get(`/exams/${this.$route.params.id}`);
      this.exam = response.data;

      // Khởi tạo bộ đếm thời gian
      this.timeLeft = this.exam.timeLimit * 60; // Convert phút -> giây
      this.startTimer();
    } catch (error) {
      console.error("Lỗi khi tải bài thi:", error);
    }
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    },
  },
  methods: {
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

    async submitExam() {
      this.submitting = true;

      try {
        const token = localStorage.getItem("token");

        let formattedAnswers = [];
        for (const question of this.exam.questions) {
          let userCode = this.answers[question._id] || ""; // Nếu không nhập gì thì coi như rỗng

          try {
            const response = await api.post(
              "/code/run-judge0",
              { code: userCode, language: question.language },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const resultOutput = response.data.stdout || response.data.stderr || "Lỗi chạy code";

            formattedAnswers.push({
              questionId: question._id,
              code: userCode,
              output: resultOutput,
            });

            this.results[question._id] = resultOutput;
          } catch (error) {
            console.error("❌ Lỗi khi chạy code:", error);
            formattedAnswers.push({
              questionId: question._id,
              code: userCode,
              output: "Lỗi runtime",
            });
          }
        }

        const submissionResponse = await api.post(
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
    }


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
</style>
