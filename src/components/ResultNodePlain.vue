<script setup lang="ts">
import { Fragment, type PropType } from 'vue';
import { IllionType, type IllionPart } from './EngNumConv';

defineProps({
  node: Object as PropType<IllionPart>
});
</script>

<template>
  <template v-for="p in node?.parts">
    <span v-if="p.type === IllionType.WORD">{{ p.word + "&shy;" }}</span>
    <ResultNodePlain v-if="p.type === IllionType.PART && p.parts.length" :node="p" />
  </template>
</template>
