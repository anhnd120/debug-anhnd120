<template>
    <div>
      <h2>Đăng Ký</h2>
      <form @submit.prevent="handleRegister">
        <input type="text" v-model="username" placeholder="Tên đăng nhập" required />
        <input type="password" v-model="password" placeholder="Mật khẩu" required />
        <select v-model="role">
          <option value="student">Sinh viên</option>
          <option value="admin">Giáo viên</option>
        </select>
        <button type="submit">Đăng Ký</button>
      </form>
      <p>Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link></p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script>
  import { registerUser } from "../api";
  
  export default {
    data() {
      return {
        username: "",
        password: "",
        role: "student",
        errorMessage: "",
      };
    },
    methods: {
      async handleRegister() {
        try {
          await registerUser({ username: this.username, password: this.password, role: this.role });
          this.$router.push("/login");
        } catch (error) {
          this.errorMessage = error.response?.data?.message || "Lỗi đăng ký";
        }
      },
    },
  };
  </script>
  