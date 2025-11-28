<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import DetailHeader from "../components/collectionDetail/DetailHeader.vue";
import LoadingComponent from "../components/common/LoadingComponent.vue";
import ErrorMessageComponent from "../components/common/ErrorMessageComponent.vue";
import useCollectionDetail from "../composables/useCollectionDetail";

const {
  loading,
  errorMessage,
  collection,
  selectedPhotos,
  openModal,
  downloadSelected,
  deleteSelected,
  clearSelection,
  modalImage,
  closeModal,
} = useCollectionDetail();

// Upload modal state
const showUploadModal = ref(false);
const filesToUpload = ref<File[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

const openUploadModal = () => {
  showUploadModal.value = true;
};

const closeUploadModal = () => {
  filesToUpload.value = [];
  showUploadModal.value = false;
};

// Drag and drop handlers
const handleDragOver = (e: DragEvent) => e.preventDefault();
const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  if (e.dataTransfer?.files) {
    filesToUpload.value.push(...Array.from(e.dataTransfer.files));
  }
};
const handleFilesSelected = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    filesToUpload.value.push(...Array.from(target.files));
  }
};

// Upload files to Supabase Storage
const uploadFiles = async () => {
  // if (!filesToUpload.value.length) return;

  // const uploadedPhotos = [];
  // for (const file of filesToUpload.value) {
  //   const filePath = `${collection.value.id}/${file.name}`;
  //   const { error: uploadError } = await supabase.storage
  //     .from("collection-photos")
  //     .upload(filePath, file, { upsert: true });

  //   if (uploadError) {
  //     console.error("Upload error:", uploadError.message);
  //     continue;
  //   }

  //   // Insert record in DB
  //   const { data, error: dbError } = await supabase
  //     .from("collection_photo")
  //     .insert([
  //       {
  //         collection_id: collection.value.id,
  //         storage_path: supabase.storage
  //           .from("collection-photos")
  //           .getPublicUrl(filePath).data.publicUrl,
  //         caption: "",
  //         s3_key: file.name,
  //       },
  //     ])
  //     .select()
  //     .single();

  //   if (dbError) {
  //     console.error("DB insert error:", dbError.message);
  //     continue;
  //   }

  //   uploadedPhotos.push(data);
  // }

  // // Update UI
  // collection.value.collection_photo.push(...uploadedPhotos);
  // closeUploadModal();
  console.log("TODO: upload logic");
};

// Close on ESC
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") closeModal();
};

onMounted(() => window.addEventListener("keydown", handleKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", handleKeydown));
</script>

<template>
  <div class="p-6">
    <LoadingComponent v-if="loading" />
    <ErrorMessageComponent
      v-else-if="errorMessage"
      :error-message="errorMessage"
    />

    <div v-else class="flex gap-6">
      <!-- LEFT: Details + Add Photos -->
      <div class="w-1/4 space-y-4">
        <DetailHeader :collection="collection" />

        <button
          @click="openUploadModal"
          class="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add Photos
        </button>
      </div>

      <!-- RIGHT: Gallery -->
      <div class="w-3/4">
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
            <input
              type="checkbox"
              :value="photo"
              v-model="selectedPhotos"
              class="absolute top-2 left-2 w-5 h-5 z-20 cursor-pointer"
              @click.stop
            />

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

    <!-- ADD PHOTOS MODAL -->
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
              <span class="text-gray-700">{{ file.name }}</span>
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
