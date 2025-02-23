import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/Login.vue";
import Register from "../components/Register.vue";
import Exams from "../views/Exams.vue";
import ExamDetail from "../components/ExamDetail.vue";
import ExamTake from "../views/ExamTake.vue";

const routes = [
  { path: "/", component: Exams, meta: { requiresAuth: true } },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/exams/:id", component: ExamDetail, meta: { requiresAuth: true } },
  { path: "/exams/:id/take", component: ExamTake, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token");

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

export default router;
