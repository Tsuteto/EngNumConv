<script setup lang="ts">
  import { type NumberPart, type Illion, IllionType, type Comma } from "./EngNumConv";
  import { WordStyle } from "../views/Conv.vue";
  import ResultNodePlain from "./ResultNodePlain.vue";
  import ResultNodeHyph from "./ResultNodeHyph.vue";
  import ResultNodeDesc from "./ResultNodeDesc.vue";
import { Fragment, type PropType } from "vue";

  defineProps({
    result: Array<(NumberPart | Illion | Comma)>,
    style: String as PropType<WordStyle>
  });
</script>

<template>
  <template v-for="(e, idx) in result">
    <span class="number" v-if="e.type === IllionType.NUMBER">{{ (idx === 0 ? e.words.slice(0, 1).toLocaleUpperCase("en-US") + e.words.slice(1) : e.words) + " " }}</span>
    <ResultNodePlain :node="e" v-if="e.type === IllionType.PART && style === WordStyle.PLAIN" />
    <ResultNodeHyph :node="e" v-if="e.type === IllionType.PART && style === WordStyle.HYPHENATED" />
    <ResultNodeDesc :node="e" v-if="e.type === IllionType.PART && style === WordStyle.DESCRIBED" />
    <span class="suffix" v-if="e.type === IllionType.SUFFIX">{{ e.word }}</span>
    <span class="comma" v-if="e.type === IllionType.COMMA">, </span>
  </template>
</template>
