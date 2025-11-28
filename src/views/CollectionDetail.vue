<template>
  <div class="p-6">
    <!-- Loading -->
    <div v-if="loading" class="text-gray-600">Loading collection...</div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="text-red-500">
      {{ errorMessage }}
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Collection Info -->
      <div class="mb-6 p-4 border rounded bg-white shadow-sm">
        <h1 class="text-gray-700 text-2xl font-bold mb-2">
          {{ collection.name }}
        </h1>

        <p class="text-gray-700 mb-2">Slug: {{ collection.slug }}</p>

        <p class="text-sm text-gray-500">
          Created: {{ new Date(collection.created_at).toLocaleDateString() }}
        </p>
      </div>

      <!-- Gallery Grid -->
      <h2 class="text-xl font-semibold mb-4">Photos</h2>

      <div
        v-if="collection.collection_photo.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
      >
        <div
          v-for="photo in collection.collection_photo"
          :key="photo.id"
          class="relative border rounded overflow-hidden bg-white shadow-sm"
        >
          <!-- Checkbox -->
          <input
            type="checkbox"
            :value="photo"
            v-model="selectedPhotos"
            class="absolute top-2 left-2 w-5 h-5 z-20 cursor-pointer"
            @click.stop
          />

          <!-- Click to open modal -->
          <img
            :src="photo.storage_path"
            class="w-full h-40 object-cover cursor-pointer"
            @click="openModal(photo.storage_path)"
          />

          <div class="p-2">
            <p class="text-gray-700 text-sm font-medium">
              {{ photo.caption }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="text-gray-500">
        No photos have been added to this gallery yet.
      </div>
    </div>
  </div>

  <!-- ACTION PANEL -->
  <div
    v-if="selectedPhotos.length > 0"
    class="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white shadow-xl border rounded-xl px-6 py-3 flex items-center gap-6 z-50"
  >
    <span class="text-gray-700 font-medium">
      {{ selectedPhotos.length }} selected
    </span>

    <button
      @click="downloadSelected"
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Download
    </button>

    <button
      @click="deleteSelected"
      class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Delete
    </button>

    <button
      @click="clearSelection"
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
    <img :src="modalImage" class="max-w-full max-h-full rounded shadow-lg" />
    <button
      @click="closeModal"
      class="absolute top-4 right-4 text-white text-3xl font-bold"
    >
      ✕
    </button>
  </div>
</template>

<script setup lang="ts">
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "../lib/supabase";
import type { CollectionPhoto } from "../interfaces/collection.interface";

const route = useRoute();
const id = route.params.id;

const collection = ref<any>(null);
const loading = ref(true);
const errorMessage = ref<string | null>(null);

const selectedPhotos = ref<any[]>([]);

// Modal
const modalImage = ref<string | null>(null);

const openModal = (url: string) => {
  modalImage.value = url;
  document.body.style.overflow = "hidden";
};
const closeModal = () => {
  modalImage.value = null;
  document.body.style.overflow = "";
};

// Clear selection
const clearSelection = () => {
  selectedPhotos.value = [];
};

// Download selected images
const downloadSelected = async () => {
  if (selectedPhotos.value.length === 1) {
    // Single file → download directly
    saveAs(selectedPhotos.value[0].storage_path);
    return;
  }

  // Multiple → generate ZIP
  const zip = new JSZip();

  for (const photo of selectedPhotos.value) {
    const response = await fetch(photo.storage_path);
    const blob = await response.blob();
    const filename = `${photo.id}.jpg`;

    zip.file(filename, blob);
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "photos.zip");
};

// Delete selected
const deleteSelected = async () => {
  if (!confirm("Delete selected photos permanently?")) return;

  const ids = selectedPhotos.value.map((p) => p.id);

  const { error } = await supabase
    .from("collection_photo")
    .delete()
    .in("id", ids);

  if (error) {
    alert("Error deleting: " + error.message);
    return;
  }

  collection.value.collection_photo = collection.value.collection_photo.filter(
    (p: CollectionPhoto) => !ids.includes(p.id)
  );

  clearSelection();
};

// Close on ESC
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") closeModal();
};

onMounted(async () => {
  window.addEventListener("keydown", handleKeydown);

  const { data, error } = await supabase
    .from("collection")
    .select("*, collection_photo(*)")
    .eq("id", id)
    .single();

  if (error) {
    errorMessage.value = error.message;
  } else {
    collection.value = data;
  }

  loading.value = false;
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>
