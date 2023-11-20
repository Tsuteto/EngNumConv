<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <header>
    <h1>英語数詞変換</h1>
    <p>数字を英語の読み方に変換します。<wbr/>拡張定義により大きな数&nbsp;<wbr/>10<sup>&nbsp;[&nbsp;3&nbsp;×&nbsp;10<sup>&nbsp;{&nbsp;3&nbsp;×&nbsp;10<sup>&nbsp;(&nbsp;3&nbsp;×&nbsp;10<sup>&nbsp;45</sup>&nbsp;-&nbsp;1&nbsp;)</sup>&nbsp;}</sup>&nbsp;+&nbsp;3&nbsp;]</sup>&nbsp;<wbr/>まで対応。</p>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 20px;
  align-items: baseline;
}

header h1 {
  font-weight: 200;
  border-right: 1px solid white;
  padding: 0.1em 0.5em;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}


@media (max-width: 1000px) {
  header {
    grid-template-columns: 1fr;
    gap: 20px;
    align-items: baseline;
    padding: 0 20px;
    gap: 0;
    margin-bottom: 2em;
  }

  header h1 {
    border-right: none;
    margin: 0;
    padding: 0;
  }

  header p {
    margin: 0;
    word-break: keep-all;
    font-size: 12px;
  }
}

</style>
