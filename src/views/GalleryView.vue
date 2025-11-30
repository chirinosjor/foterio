<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabase";
import type { Collection } from "../interfaces/collection.interface";
import { imageAlt, imgSrc } from "../utils/image";

const collections = ref<Collection[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);
const userId = ref<string | null>(null);

const copyPublicLink = (id: number) => {
  const link = `${window.location.origin}/public-gallery/${id}`;
  navigator.clipboard
    .writeText(link)
    .then(() => alert("Public gallery link copied!"))
    .catch((err) => console.error(err));
};

const fetchCollections = async () => {
  if (!userId.value) return;
  loading.value = true;
  const { data, error } = await supabase
    .from("collection")
    .select("*")
    .eq("user_id", userId.value);

  if (error) {
    errorMessage.value = error.message;
  } else {
    collections.value = data;
  }
  loading.value = false;
};

const createNewGallery = async () => {
  if (!userId.value) return;

  const name = prompt("Enter the name of your new gallery:");
  if (!name) return;

  const slug = name.toLowerCase().replace(/\s+/g, "-"); // simple slug generator
  const { error } = await supabase.from("collection").insert([
    {
      name,
      slug,
      user_id: userId.value,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    alert("Error creating gallery: " + error.message);
  } else {
    alert("Gallery created!");
    fetchCollections(); // refresh the list
  }
};

onMounted(async () => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) {
    errorMessage.value = "User not logged in";
    loading.value = false;
    return;
  }

  userId.value = user.id;
  fetchCollections();
});
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-800">Gallery</h1>
      <button
        @click="createNewGallery"
        class="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors duration-200"
      >
        + New Gallery
      </button>
    </div>

    <div v-if="loading" class="text-gray-400 text-lg">Loading...</div>

    <div v-else-if="errorMessage" class="text-red-500 text-lg">
      {{ errorMessage }}
    </div>

    <ul
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <li v-for="item in collections" :key="item.id" class="group">
        <div
          class="flex flex-col bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full"
        >
          <RouterLink :to="`gallery/${item.id}`" class="flex flex-col grow">
            <div class="overflow-hidden">
              <img
                class="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                :src="imgSrc(item)"
                :alt="imageAlt(item)"
              />
            </div>
            <div class="p-4 flex flex-col grow">
              <h2
                class="text-lg sm:text-xl font-semibold text-gray-800 mb-1 truncate"
              >
                {{ item.name }}
              </h2>
              <p class="text-gray-600 mb-2 truncate">Slug: {{ item.slug }}</p>
              <p class="text-sm text-gray-400 mt-auto">
                Created: {{ new Date(item.created_at).toLocaleDateString() }}
              </p>
            </div>
          </RouterLink>
          <button
            @click.stop="copyPublicLink(item.id)"
            class="w-full px-4 py-2 bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 transition-colors duration-200"
          >
            Share Public Link
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
