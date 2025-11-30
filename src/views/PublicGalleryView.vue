<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "../lib/supabase";

const route = useRoute();
const collectionId = route.params.id as string;

const collectionName = ref("");
const photos = ref<any[]>([]);
const selectedPhotos = ref<any[]>([]); // <-- selected for bulk download
const modalImage = ref<string | null>(null);

const loading = ref(true);
const errorMessage = ref<string | null>(null);

onMounted(async () => {
  try {
    // fetch collection info
    const { data: colData, error: colError } = await supabase
      .from("collection")
      .select("*")
      .eq("id", collectionId)
      .single();
    if (colError) throw colError;
    collectionName.value = colData.name;

    // fetch photos
    const { data: photoData, error: photoError } = await supabase
      .from("collection_photo")
      .select("*")
      .eq("collection_id", collectionId);
    if (photoError) throw photoError;

    photos.value = photoData || [];
  } catch (err: any) {
    errorMessage.value = err.message || "Failed to load gallery.";
  } finally {
    loading.value = false;
  }
});

// -----------------------------
// Bulk Download
// -----------------------------
const downloadSelected = async () => {
  if (!selectedPhotos.value.length) return;

  for (const photo of selectedPhotos.value) {
    const link = document.createElement("a");
    link.href = photo.public_url;
    link.download = photo.public_url.split("/").pop() || "photo.jpg";
    link.click();
  }

  // clear selection after download
  selectedPhotos.value = [];
};

// -----------------------------
// Image Modal
// -----------------------------
const openModal = (url: string) => (modalImage.value = url);
const closeModal = () => (modalImage.value = null);
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-4xl font-bold mb-6 text-center">{{ collectionName }}</h1>

    <div v-if="loading" class="text-center text-gray-400">Loading...</div>
    <div v-else-if="errorMessage" class="text-center text-red-500">
      {{ errorMessage }}
    </div>
    <div v-else>
      <!-- PHOTOS GRID -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        <div
          v-for="photo in photos"
          :key="photo.id"
          class="relative group cursor-pointer"
        >
          <input
            type="checkbox"
            :value="photo"
            v-model="selectedPhotos"
            class="absolute top-2 left-2 w-5 h-5 z-20 cursor-pointer"
            @click.stop
          />

          <img
            :src="photo.public_url"
            class="w-full h-64 object-cover rounded-lg shadow-md transform transition duration-300 group-hover:scale-105"
            :alt="photo.id"
            @click="openModal(photo.public_url)"
          />
        </div>
      </div>

      <!-- BULK ACTION PANEL -->
      <div
        v-if="selectedPhotos.length > 0"
        class="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white shadow-xl border rounded-xl px-6 py-3 flex items-center gap-6 z-50"
      >
        <span class="text-gray-700 font-medium"
          >{{ selectedPhotos.length }} selected</span
        >

        <button
          @click="downloadSelected"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Download
        </button>

        <button
          @click="() => (selectedPhotos = [])"
          class="px-3 py-1 border rounded text-gray-700 hover:bg-gray-100"
        >
          Clear
        </button>
      </div>

      <!-- IMAGE MODAL -->
      <div
        v-if="modalImage"
        class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
        @click.self="closeModal"
      >
        <img
          :src="modalImage"
          class="max-w-full max-h-full rounded shadow-lg"
        />
        <button
          @click="closeModal"
          class="absolute top-4 right-4 text-white text-3xl font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>
