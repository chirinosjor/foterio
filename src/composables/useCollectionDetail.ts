import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { supabase } from "../lib/supabase";
import type { Collection, CollectionPhoto } from "../interfaces/collection.interface";

function useCollectionDetail() {
  const route = useRoute();
  const id = route.params.id;

  const collection = ref<Collection>({
    coverUrl: '',
    created_at: '',
    id: 0,
    name: '',
    slug: ''
  });

  const collectionPhotos = ref<CollectionPhoto[]>([]);
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

  const clearSelection = () => {
    selectedPhotos.value = [];
  };

  const downloadSelected = async () => {
    if (selectedPhotos.value.length === 1) {
      saveAs(selectedPhotos.value[0].public_url || selectedPhotos.value[0].storage_path);
      return;
    }

    const zip = new JSZip();

    for (const photo of selectedPhotos.value) {
      const response = await fetch(photo.public_url || photo.storage_path);
      const blob = await response.blob();
      zip.file(`${photo.id}.jpg`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "photos.zip");
  };

  const deleteSelected = async () => {
    if (!selectedPhotos.value.length) return;

    if (!confirm("Delete selected photos permanently?")) return;
    if (!collectionPhotos.value) return;

    try {
      // 1️⃣ Collect IDs for DB and storage paths for bucket
      const ids = selectedPhotos.value.map(p => p.id);
      const paths = selectedPhotos.value.map(p =>
        p.storage_path.replace(/^foterio\//, "") // remove bucket prefix
      );

      // 2️⃣ Delete from database
      const { error: dbError } = await supabase
        .from("collection_photo") // ✅ correct table
        .delete()
        .in("id", ids);

      if (dbError) {
        alert("Error deleting from DB: " + dbError.message);
        return;
      }

      // 3️⃣ Delete files from storage
      const { data, error: storageError } = await supabase.storage
        .from("foterio") // bucket name
        .remove(paths);

      if (storageError) console.error("Error deleting from storage:", storageError);

      console.log('data', data);

      // 4️⃣ Remove deleted photos from reactive array
      collectionPhotos.value = collectionPhotos.value.filter(
        p => !ids.includes(p.id)
      );

      // 5️⃣ Clear selection
      selectedPhotos.value = [];
    } catch (err) {
      console.error("Failed deleting photos:", err);
    }
  };


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

    if (error) errorMessage.value = error.message;
    else {
      collection.value = data;
      collectionPhotos.value = data.collection_photo || [];
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
    collectionPhotos,
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
