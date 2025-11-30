import { supabase } from "./supabase";

// Returns a signed URL usable for 1 hour (3600s)
export async function getSignedUrl(fileName: string, expires = 3600) {
  const cleanPath = fileName.replace(/^collection_photo\//, "");
  const { data, error } = await supabase.storage
    .from("collection-photos")
    .createSignedUrl(cleanPath, expires);

  if (error) {
    console.error("Signed URL error:", error.message, cleanPath);
    return null;
  }

  return data.signedUrl;
}
