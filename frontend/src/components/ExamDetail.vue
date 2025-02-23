<template>
    <div v-if="exam">
      <h2>{{ exam.title }}</h2>
      <p>{{ exam.description }}</p>
      <button @click="startExam">Bắt Đầu Làm Bài</button>
    </div>
  </template>
  
  <script>
  import { fetchExamById } from "../api";
  
  export default {
    data() {
      return {
        exam: null,
      };
    },
    async created() {
      const examId = this.$route.params.id;
      const response = await fetchExamById(examId);
      this.exam = response.data;
    },
    methods: {
      startExam() {
        this.$router.push(`/exams/${this.exam._id}/take`);
      },
    },
  };
  </script>
  