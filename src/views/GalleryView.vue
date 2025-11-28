<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabase";
import type { Collection } from "../interfaces/collection.interface";

const collections = ref<Collection[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);

const imageAlt = (collection: Collection) => {
  if (collection.coverUrl) {
    return collection.name;
  } else {
    return undefined;
  }
};

onMounted(async () => {
  const { data, error } = await supabase.from("collection").select("*");

  if (error) {
    errorMessage.value = error.message;
  } else {
    collections.value = data;
  }

  loading.value = false;
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Gallery</h1>
    <div v-if="loading" class="text-gray-300">Loading...</div>
    <div v-else-if="errorMessage" class="text-red-500">
      {{ errorMessage }}
    </div>
    <ul v-else class="flex flex-wrap gap-6">
      <li
        v-for="item in collections"
        :key="item.id"
        class="w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
      >
        <RouterLink
          :to="`gallery/${item.id}`"
          class="bg-neutral-primary-soft block max-w-sm border border-default rounded-base shadow-xs"
        >
          <img
            class="rounded-t-base mx-auto p-2"
            :src="item.coverUrl"
            :alt="imageAlt(item)"
          />

          <div class="mb-6 p-4 border rounded bg-white shadow-sm">
            <h1 class="text-gray-700 text-2xl font-bold mb-2">
              {{ item.name }}
            </h1>

            <p class="text-gray-700 mb-2">Slug: {{ item.slug }}</p>

            <p class="text-sm text-gray-500">
              Created: {{ new Date(item.created_at).toLocaleDateString() }}
            </p>
          </div>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
