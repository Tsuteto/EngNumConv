<script setup lang="ts">
import { ref } from "vue";

const props = defineProps(["value", "class", "modelValue"]);
const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="input-text">
    <input type="text"
      :class="'form-input ' + props.class"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    <div :class="'dummy-text ' + props.class" v-text="modelValue"></div>
  </div>
</template>

<style scoped>
.input-text {
  position: relative;
}

input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.dummy-text {
  display: inline-block;
  overflow: hidden;
  min-width: 50px;
  height: 1.2em;
  padding: 0px 7px;
  white-space: nowrap;
  visibility: hidden;
}

.dummy-text::before {
  content: "";
}
</style>