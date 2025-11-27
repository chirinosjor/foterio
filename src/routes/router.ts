import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';

import { supabase } from "../lib/supabase";




const routes = [
  { path: '/', component: HomeView, meta: { requiresAuth: true } },
  { path: '/login', component: LoginView },
  { path: '/registro', component: RegisterView },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});


router.beforeEach(async (to) => {
  // Check if this route requires auth
  if (to.meta.requiresAuth) {
    const { data: { session } } = await supabase.auth.getSession();

    // If no session → redirect to login
    if (!session) {
      return "/login";
    }
  }
});
