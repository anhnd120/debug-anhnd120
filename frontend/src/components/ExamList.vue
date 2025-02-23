<template>
    <div class="row">
      <div class="col-lg-12">
          <div class="page-wrapper">
              <div class="page-content-wrapper">
                  <div class="row">
                      <div class="col-sm-12 col-md-12 col-xs-12 col-lg-12">
                        <div class="accordion accordion-flush" id="accordionFlushExample">
                          <div v-for="exam in exams" :key="exam._id" class="accordion-item">
                            <h2 class="accordion-header">
                              <router-link :to="`/exams/${exam._id}/take`" class="accordion-button collapsed" type="button">
                                {{ exam.title }}
                              </router-link>
                            </h2>
                          </div>
                        </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  </template>
  
  <script>
  import { fetchExams } from "../api";
  
  export default {
    data() {
      return {
        exams: [],
      };
    },
    async created() {
      const response = await fetchExams();
      this.exams = response.data;
    },
  };
  </script>
  