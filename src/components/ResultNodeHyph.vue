<script setup lang="ts">
import type { PropType } from 'vue';
import { IllionType, type IllionPart } from './EngNumConv';

defineProps({
  node: Object as PropType<IllionPart>
});
</script>

<template>
  <span v-for="p in node?.parts">
    <span v-if="p.type === IllionType.WORD">{{ p.word + "-" }}</span>
    <ResultNodeHyph v-if="p.type === IllionType.PART && p.parts.length" :node="p" />
  </span>
</template>
