import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { supabase } from "../lib/supabase";
import type { CollectionPhoto } from "../interfaces/collection.interface";


function useCollectionDetail() {
  const route = useRoute();
  const id = route.params.id;

  const collection = ref<any>(null);
  const loading = ref(true);
  const errorMessage = ref<string | null>(null);
  const selectedPhotos = ref<any[]>([]);
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

  // Delete selected photos
  const deleteSelected = async () => {
    if (!confirm("Delete selected photos permanently?")) return;

    const ids = selectedPhotos.value.map((p: CollectionPhoto) => p.id);
    const keys = selectedPhotos.value.map((p: CollectionPhoto) => p.s3_key);

    // 1) Delete from DB
    const { error: dbError } = await supabase
      .from("collection_photo")
      .delete()
      .in("id", ids);

    if (dbError) {
      console.error("DB deletion error:", dbError);
      alert("Error deleting from database: " + dbError.message);
      return;
    } else {
      console.log("DB deletion successful for IDs:", ids);
    }

    // 2) Delete from S3 via Edge Function
    for (const key of keys) {
      try {
        console.log("Calling Edge Function for key:", key);
        const { data, error: fnError } = await supabase.functions.invoke(
          "delete-from-s3",
          { body: { key } }
        );

        if (fnError) {
          console.error("Edge Function error for key", key, fnError);
        } else {
          console.log("Edge Function response for key", key, data);
        }
      } catch (err) {
        console.error("Exception calling Edge Function for key", key, err);
      }
    }

    // 3) Update UI
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
  return {
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
  };
}

export default useCollectionDetail;