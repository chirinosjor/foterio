import type { Collection } from "../interfaces/collection.interface";
import galleryPlaceholder from "../assets/galleryPlaceholder.svg";


export const imgSrc = (collection: Collection) => {
  if (collection.coverUrl) {
    return collection.coverUrl;
  } else {
    return galleryPlaceholder;
  }
};

export const imageAlt = (collection: Collection) => {
  if (collection.coverUrl) {
    return collection.name;
  } else {
    return undefined;
  }
};