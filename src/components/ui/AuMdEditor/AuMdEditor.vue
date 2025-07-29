<template>
  <textarea v-model="mdText"/>
  <au-markdown-viewer :content="mdText"
      @update-headings="handleHeadingsUpdate"/>
      <!-- {{mdText}} -->
</template>

<script setup>
import {ref} from 'vue';

const headings = ref([])
const mdText = ref('')

const handleHeadingsUpdate = (list) => {
  headings.value = list
}
</script>