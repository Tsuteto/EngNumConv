<script setup lang="ts">
defineProps({
  cases: Object
})
</script>

<template>
  <li v-for="test of cases">
    <template v-if="test.assertion">✅ </template>
    <template v-if="!test.assertion">❌ </template>
    
    <span v-html="test.output"></span>
    <template v-if="!test.assertion"> → </template>
    <span v-if="!test.assertion" v-html="test.correct"></span>
  </li>
</template>