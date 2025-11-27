<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabase";
import { useRouter } from "vue-router";

const router = useRouter();
const userEmail = ref("");
const userName = ref("");

// Fetch session on mount
onMounted(async () => {
  const { data } = await supabase.auth.getUser();
  if (data?.user) {
    userEmail.value = data.user.email;
    userName.value = data.user.email.split("@")[0];
  }
});

const logout = async () => {
  await supabase.auth.signOut();
  router.push("/login");
};
</script>

<template>
  <div class="max-w-3xl mx-auto py-12 text-white text-center">
    <!-- Welcome Title -->
    <h1 class="text-4xl font-bold mb-4">Welcome, {{ userName }}!</h1>

    <!-- Message -->
    <p class="text-gray-300 mb-6">
      ¡Nos alegra verte de nuevo! Usa la barra lateral para navegar por tu panel
      y explorar todas las funcionalidades.
    </p>
  </div>
</template>
