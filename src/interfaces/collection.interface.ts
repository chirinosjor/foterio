export interface Collection {
  id: number;
  name: string;
  slug: string;
  coverUrl: string;
  created_at: string;
}

export interface CollectionPhoto {
  id: string;
  collection_id: number;
  storage_path: string;
  created_at: string;
  public_url: string;
}