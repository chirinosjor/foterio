<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import DetailHeader from "../components/collectionDetail/DetailHeader.vue";
import LoadingComponent from "../components/common/LoadingComponent.vue";
import ErrorMessageComponent from "../components/common/ErrorMessageComponent.vue";

import useCollectionDetail from "../composables/useCollectionDetail";
import { supabase } from "../lib/supabase";

const {
  loading,
  errorMessage,
  collection,
  collectionPhotos,
  selectedPhotos,
  downloadSelected,
  deleteSelected,
  clearSelection,
  modalImage,
  closeModal,
} = useCollectionDetail();

/* --------------------------------------------
   Upload Modal State
---------------------------------------------*/
const showUploadModal = ref(false);
const filesToUpload = ref<File[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

const openUploadModal = () => (showUploadModal.value = true);
const closeUploadModal = () => {
  filesToUpload.value = [];
  showUploadModal.value = false;
};

/* --------------------------------------------
   Drag + Click Select
---------------------------------------------*/
const handleDragOver = (e: DragEvent) => e.preventDefault();

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  if (e.dataTransfer?.files) {
    filesToUpload.value.push(...Array.from(e.dataTransfer.files));
  }
};

const handleFilesSelected = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files) {
    filesToUpload.value.push(...Array.from(input.files));
  }
};

/* --------------------------------------------
   UPLOAD FILES (FINAL CLEAN VERSION)
---------------------------------------------*/
// uploadFiles.ts
const uploadFiles = async () => {
  if (!filesToUpload.value.length) return;
  if (!collection.value) return;

  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return;

  for (const file of filesToUpload.value) {
    try {
      // 1️⃣ Upload file to Supabase storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { data: storageUploadData, error: storageUploadError } =
        await supabase.storage
          .from("foterio")
          .upload(`user-${userId}/${fileName}`, file);

      if (storageUploadError) {
        console.error("Storage upload error:", storageUploadError);
        continue;
      }

      const fullPath = storageUploadData?.fullPath || "";

      // 2️⃣ Get public URL
      const { data: urlData } = supabase.storage
        .from("foterio")
        .getPublicUrl(fullPath.replace("foterio/", ""));
      const publicUrl = urlData.publicUrl;

      // 3️⃣ Insert row in DB
      const { data: rowInsertData, error: rowInsertError } = await supabase
        .from("collection_photo")
        .insert([
          {
            collection_id: collection.value.id,
            storage_path: fullPath,
            public_url: publicUrl,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (rowInsertError) {
        console.error("DB insert error:", rowInsertError);
        continue;
      }

      // ✅ Add new photo to the reactive array
      if (rowInsertData && rowInsertData.length > 0) {
        collectionPhotos.value.push(rowInsertData[0]);
      }
    } catch (err) {
      console.error("Upload failed for", file.name, err);
    }
  }

  // 4️⃣ Clear modal state
  filesToUpload.value = [];
  showUploadModal.value = false;
};

/* --------------------------------------------
   Close on ESC
---------------------------------------------*/
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") closeModal();
};

onMounted(async () => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div class="p-6">
    <LoadingComponent v-if="loading" />
    <ErrorMessageComponent
      v-else-if="errorMessage"
      :error-message="errorMessage"
    />

    <div v-else class="flex gap-6">
      <!-- LEFT SIDE -->
      <div class="w-1/2 space-y-4">
        <DetailHeader :collection="collection" />

        <button
          @click="openUploadModal"
          class="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add Photos
        </button>
      </div>

      <!-- RIGHT: GALLERY -->
      <div class="w-3/4">
        <h2 class="text-xl font-semibold mb-4">Photos</h2>

        <div
          v-if="collectionPhotos.length > 0"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        >
          <div
            v-for="photo in collectionPhotos"
            :key="photo.id"
            class="relative border rounded overflow-hidden bg-white shadow-sm w-full aspect-square"
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
              alt="Thumbnail"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

        <div v-else class="text-gray-500">No photos added yet.</div>
      </div>
    </div>

    <!-- ACTION PANEL -->
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

    <!-- UPLOAD MODAL -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-lg relative">
        <button
          @click="closeUploadModal"
          class="absolute top-4 right-4 text-gray-700 text-xl font-bold"
        >
          ✕
        </button>

        <h3 class="text-lg font-semibold mb-4">Add Photos</h3>

        <div
          @drop="handleDrop"
          @dragover="handleDragOver"
          class="border-2 border-dashed border-gray-300 p-8 text-center text-gray-500 mb-4 rounded cursor-pointer"
          @click="fileInput?.click()"
        >
          Drag & drop photos here or click to select
          <input
            type="file"
            multiple
            class="hidden"
            @change="handleFilesSelected"
            ref="fileInput"
          />
        </div>

        <div v-if="filesToUpload.length" class="mb-4">
          <p class="text-gray-700 font-medium">Files to upload:</p>
          <ul class="list-disc list-inside">
            <li v-for="file in filesToUpload" :key="file.name">
              {{ file.name }}
            </li>
          </ul>
        </div>

        <button
          @click="uploadFiles"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Upload
        </button>
      </div>
    </div>
  </div>
</template>
