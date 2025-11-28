<script setup lang="ts">
import type { Collection } from "../../interfaces/collection.interface";
import { imageAlt, imgSrc } from "../../utils/image";

interface Props {
  collection: Collection;
}
const props = defineProps<Props>();
</script>

<template>
  <div
    class="flex items-center p-4 mb-4 border rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
  >
    <div class="shrink-0 w-24 h-24 overflow-hidden rounded-lg">
      <img
        class="w-full h-full object-cover"
        :src="imgSrc(props.collection)"
        :alt="imageAlt(props.collection)"
      />
    </div>
    <div class="ml-4 flex-1">
      <h1 class="text-gray-800 text-lg md:text-xl font-semibold truncate">
        {{ props.collection.name }}
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        Fecha de creación:
        {{ new Date(props.collection.created_at).toLocaleDateString() }}
      </p>
    </div>
  </div>
</template>
