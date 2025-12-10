<script setup>
import { supabase } from "../lib/supabase";
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const isMobileMenuOpen = ref(false);

const logout = async () => {
  await supabase.auth.signOut();
  router.push("/login");
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// Close mobile menu on route change
router.afterEach(() => {
  isMobileMenuOpen.value = false;
});
</script>

<template>
  <div class="flex h-screen bg-gray-900 text-white relative">
    <!-- Mobile Overlay -->
    <div
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'bg-gray-800 p-6 flex flex-col gap-4',
        'fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Dashboard</h2>
        <!-- Close button (Mobile only) -->
        <button
          @click="isMobileMenuOpen = false"
          class="lg:hidden text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex flex-col gap-3">
        <RouterLink to="/dashboard" class="py-2 px-3 rounded hover:bg-gray-700">
          Home
        </RouterLink>

        <RouterLink to="/gallery" class="py-2 px-3 rounded hover:bg-gray-700">
          Gallery
        </RouterLink>
      </nav>
    </aside>

    <!-- Main area -->
    <div class="flex-1 flex flex-col">
      <!-- Navbar -->
      <header
        class="h-16 bg-gray-800 flex items-center justify-between px-6 border-b border-gray-700"
      >
        <!-- Mobile Menu Button -->
        <button
          @click="toggleMobileMenu"
          class="lg:hidden p-2 text-gray-300 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        
        <div class="flex-1 flex justify-end">
          <button
            @click="logout"
            class="px-4 py-2 bg-red-500 rounded hover:bg-red-400"
          >
            Logout
          </button>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 p-4 lg:p-6 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
