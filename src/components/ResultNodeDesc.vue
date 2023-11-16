<script setup lang="ts">
import type { PropType } from 'vue';
import { IllionType, type IllionPart } from './EngNumConv';

defineProps({
  node: Object as PropType<IllionPart>
});
</script>

<template>
  <span v-for="p in node?.parts">
    <span v-if="p.type === IllionType.WORD" :class="`illion-part tier-${node?.tier}`" :data-ordinal="p.ordinal">{{ p.word }}</span>
    <span v-if="p.type === IllionType.WORD" >&shy;</span>
    <ResultNodeDesc v-if="p.type === IllionType.PART && p.parts.length" :node="p" />
  </span>
</template>

<style scoped>
.illion-part {
  position: relative;
  padding: 0 1px;
  background-color: var(--tier-bg);

  box-shadow: inset 0 0 3px 1px var(--tier);
}

.illion-part::after {
  content: attr(data-ordinal);
  display: block;
  position: absolute;
  top: -1.2em;
  right: 0px;
  font-size: 0.5em;
  line-height: 1;
  background-color: var(--tier);
  color: white;
  padding: 0.1em 0.2em;
  min-width: 1.2em;
  text-align: center;
}

.tier-1 {
  --tier: #a8a200;
  --tier-bg: #ffff0030;
}

.tier-2 {
  --tier: #436be3;
  --tier-bg: #0040ff30;
}

.tier-3 {
  --tier: #4fbe31;
  --tier-bg: #35f60030;
}

.tier-4 {
  --tier: #cd5a20;
  --tier-bg: #ff550030;
}


</style>