<script setup lang="ts">
interface Props {
  errorMessage: string;
}
const props = defineProps<Props>();
</script>
<template>
  <div class="text-red-500">
    {{ props.errorMessage }}
  </div>
</template>
