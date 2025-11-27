<script setup>
import { supabase } from "../lib/supabase";
import { useRouter } from "vue-router";

const router = useRouter();

const logout = async () => {
  await supabase.auth.signOut();
  router.push("/login");
};
</script>

<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 p-6 flex flex-col gap-4">
      <h2 class="text-xl font-bold mb-4">Dashboard</h2>

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
        class="h-16 bg-gray-800 flex items-center justify-end px-6 border-b border-gray-700"
      >
        <button
          @click="logout"
          class="px-4 py-2 bg-red-500 rounded hover:bg-red-400"
        >
          Logout
        </button>
      </header>

      <!-- Content -->
      <main class="flex-1 p-6 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
