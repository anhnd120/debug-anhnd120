<template>
    <div v-if="exam">
      <h2>{{ exam.title }}</h2>
      <p>{{ exam.description }}</p>
  
      <div v-for="(question, index) in exam.questions" :key="question._id">
        <h3>Câu {{ index + 1 }}: {{ question.title }}</h3>
        <p>{{ question.description }}</p>
  
        <MonacoEditor v-model="answers[question._id]" />
      </div>
  
      <button @click="submitExam">Nộp Bài</button>
    </div>
  </template>
  
  <script>
  import { fetchExamById, submitExam } from "../api";
  import MonacoEditor from "../components/MonacoEditor.vue";
  
  export default {
    components: { MonacoEditor },
    data() {
      return {
        exam: null,
        answers: {},
      };
    },
    async created() {
      const examId = this.$route.params.id;
      const response = await fetchExamById(examId);
      this.exam = response.data;
    },
    methods: {
      async submitExam() {
        const submissionData = {
          examId: this.exam._id,
          answers: Object.keys(this.answers).map((questionId) => ({
            questionId,
            code: this.answers[questionId],
          })),
        };
  
        await submitExam(submissionData);
        alert("Bài thi đã được nộp!");
        this.$router.push("/");
      },
    },
  };
  </script>
  