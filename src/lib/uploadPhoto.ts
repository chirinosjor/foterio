// /src/lib/uploadPhoto.ts

import { supabase } from "./supabase";

/**
 * Upload a single file to the "collection-photos" bucket
 * Returns the storage path (e.g. "123/1690598843012-photo.jpg")
 */
export async function uploadPhoto(file: File, collectionId: number) {
  const fileName = `${Date.now()}-${file.name}`;
  const path = `${collectionId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("collection-photos")
    .upload(path, file, { upsert: false });

  if (uploadError) {
    console.error("uploadPhoto error:", uploadError);
    throw uploadError;
  }

  return path;
}
