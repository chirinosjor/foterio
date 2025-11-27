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
  <div>
    <h1>HomeView</h1>
    <button
      @click="logout"
      class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400"
    >
      Logout
    </button>
  </div>
</template>
