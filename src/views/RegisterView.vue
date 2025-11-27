<script setup>
import { ref } from "vue";
import { supabase } from "../lib/supabase";
import { useRouter } from "vue-router";

const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

const handleSubmit = async () => {
  loading.value = true;
  errorMessage.value = "";

  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  });

  loading.value = false;

  if (error) {
    errorMessage.value = error.message;
    return;
  }

  console.log("User registered:", data);

  // Example: redirect to login or home
  router.push("/login");
};
</script>

<template>
  <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img
        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
        alt="Your Company"
        class="mx-auto h-10 w-auto"
      />
      <h2
        class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white"
      >
        Registro
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="email" class="block text-sm/6 font-medium text-gray-100"
            >Dirección de correo electrónico</label
          >
          <div class="mt-2">
            <input
              v-model="email"
              id="email"
              type="email"
              name="email"
              required
              autocomplete="email"
              class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
            />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label
              for="password"
              class="block text-sm/6 font-medium text-gray-100"
              >Contraseña</label
            >
          </div>
          <div class="mt-2">
            <input
              id="password"
              v-model="password"
              type="password"
              name="password"
              required
              autocomplete="current-password"
              class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
