import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";

import GalleryView from "../views/GalleryView.vue";
import { supabase } from "../lib/supabase";
import HomeView from "../views/HomeView.vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import CollectionDetail from "../views/CollectionDetail.vue";

const routes = [
  { path: "/login", component: LoginView },
  { path: "/registro", component: RegisterView },

  {
    path: "/",
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "dashboard", component: HomeView },
      { path: "gallery", component: GalleryView },
      { path: "gallery/:id", component: CollectionDetail },
      { path: "", redirect: "/dashboard" },
    ],
  },

  // fallback route
  { path: "/:catchAll(.*)", redirect: "/dashboard" },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global auth guard
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return "/login";
    }
  }
});
