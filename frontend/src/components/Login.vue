<template>
    <div class="row">
      <div class="col-lg-12">
          <!--=======  page wrapper  =======-->
          <div class="page-wrapper">
              <div class="page-content-wrapper">
                  <div class="row">
                      <div class="col-sm-12 col-md-12 col-xs-12 col-lg-12">
                          <!-- Login Form s-->
                          <form @submit.prevent="handleLogin">

                              <div class="login-form">
                                  <h4 class="login-title">Đăng nhập</h4>
                                  <p v-if="errorMessage" class="text-center text-danger error">{{ errorMessage }}</p>

                                  <div class="row">
                                      <div class="col-md-12 col-12">
                                          <label>Email đăng ký cuộc thi*</label>
                                          <input type="text" v-model="username" placeholder="Email Address">
                                      </div>
                                      <div class="col-12">
                                          <label>Mật khẩu</label>
                                          <input type="password" v-model="password" placeholder="Password">
                                      </div>
                                      <div class="col-sm-6">

                                          <div class="check-box d-inline-block ml-0 ml-md-2">
                                              <input type="checkbox" id="remember_me">
                                              <!-- <label for="remember_me">Remember me</label> -->
                                          </div>

                                      </div>

                                      <div class="col-sm-6 text-start text-sm-end">
                                          <!-- <a href="#" class="forget-pass-link"> Forgotten pasward?</a> -->
                                      </div>

                                      <div class="col-md-12 d-flex justify-content-center">
                                          <button class="register-button btn btn-primary">Đăng nhập</button>
                                      </div>

                                  </div>
                              </div>

                          </form>
                      </div>
                      
                  </div>
              </div>
          </div>
          <!--=======  End of page wrapper  =======-->
      </div>
    </div>
  </template>
  
  <script>
  import { loginUser } from "../api";
  
  export default {
    data() {
      return {
        username: "",
        password: "",
        errorMessage: "",
      };
    },
    methods: {
      async handleLogin() {
        try {
          const response = await loginUser({ username: this.username, password: this.password });
  
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("role", response.data.role);
  
          this.$router.push("/");
        } catch (error) {
          this.errorMessage = error.response?.data?.message || "Lỗi đăng nhập";
        }
      },
    },
  };
  </script>
  