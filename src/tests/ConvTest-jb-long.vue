<script setup lang="ts">
import { EngNumConv, ResultFormat, type Input, type ResultData, Scale, type ExOptions, LongScaleStyle } from '@/components/EngNumConv';
import { ref, type Ref } from 'vue';
import Testcase from './Testcase.vue';

type TestResult = {
  input: Input;
  output: ResultData;
  assertion: boolean;
  correct: string;
}

type TestCase = {
  input: Input;
  result: {
    text: string;
  }
}

const TEST_CASES_BRITISH_TIER1 = [
  {
    input: { coef: "0", exp: "0" },
    result: {text: "Zero"}
  },
  {
    input: { coef: "1", exp: "0" },
    result: {text: "One"}
  },
  {
    input: { coef: "2", exp: "0" },
    result: {text: "Two"}
  },
  {
    input: { coef: "3", exp: "0" },
    result: {text: "Three"}
  },
  {
    input: { coef: "4", exp: "0" },
    result: {text: "Four"}
  },
  {
    input: { coef: "5", exp: "0" },
    result: {text: "Five"}
  },
  {
    input: { coef: "6", exp: "0" },
    result: {text: "Six"}
  },
  {
    input: { coef: "7", exp: "0" },
    result: {text: "Seven"}
  },
  {
    input: { coef: "8", exp: "0" },
    result: {text: "Eight"}
  },
  {
    input: { coef: "9", exp: "0" },
    result: {text: "Nine"}
  },
  {
    input: { coef: "10", exp: "0" },
    result: {text: "Ten"}
  },
  {
    input: { coef: "1", exp: "1" },
    result: {text: "Ten"}
  },
  {
    input: { coef: "11", exp: "0" },
    result: {text: "Eleven"}
  },
  {
    input: { coef: "2", exp: "1" },
    result: {text: "Twenty"}
  },
  {
    input: { coef: "1", exp: "2" },
    result: {text: "One hundred"}
  },
  {
    input: { coef: "1", exp: "3" },
    result: {text: "One thousand"}
  },
  {
    input: { coef: "1", exp: "4" },
    result: {text: "Ten thousand"}
  },
  {
    input: { coef: "1", exp: "5" },
    result: {text: "One hundred thousand"}
  },
  {
    input: { coef: "1", exp: "6" },
    result: {text: "One mi-llion"}
  },
  {
    input: { coef: "1", exp: "7" },
    result: {text: "Ten mi-llion"}
  },
  {
    input: { coef: "1", exp: "8" },
    result: {text: "One hundred mi-llion"}
  },
  {
    input: { coef: "1", exp: "9" },
    result: {text: "One thousand mi-llion"}
  },
  {
    input: { coef: "1", exp: "10" },
    result: {text: "Ten thousand mi-llion"}
  },
  {
    input: { coef: "1", exp: "11" },
    result: {text: "One hundred thousand mi-llion"}
  },
  {
    input: { coef: "1", exp: "12" },
    result: {text: "One bi-llion"}
  },
  {
    input: { coef: "1", exp: "13" },
    result: {text: "Ten bi-llion"}
  },
  {
    input: { coef: "1", exp: "14" },
    result: {text: "One hundred bi-llion"}
  },
  {
    input: { coef: "1", exp: "15" },
    result: {text: "One thousand bi-llion"}
  },
  {
    input: { coef: "1", exp: "16" },
    result: {text: "Ten thousand bi-llion"}
  },
  {
    input: { coef: "1", exp: "17" },
    result: {text: "One hundred thousand bi-llion"}
  },
  {
    input: { coef: "1", exp: "18" },
    result: {text: "One tri-llion"}
  },
  {
    input: { coef: "1", exp: "24" },
    result: {text: "One quadri-llion"}
  },
  {
    input: { coef: "1", exp: "30" },
    result: {text: "One quinti-llion"}
  },
  {
    input: { coef: "1", exp: "36" },
    result: {text: "One sexti-llion"}
  },
  {
    input: { coef: "1", exp: "42" },
    result: {text: "One septi-llion"}
  },
  {
    input: { coef: "1", exp: "48" },
    result: {text: "One octi-llion"}
  },
  {
    input: { coef: "1", exp: "54" },
    result: {text: "One noni-llion"}
  },
  {
    input: { coef: "1", exp: "60" },
    result: {text: "One dec-illion"}
  },
  {
    input: { coef: "1", exp: "63" },
    result: {text: "One thousand dec-illion"}
  },
  {
    input: { coef: "1", exp: "120" },
    result: {text: "One vigin-tillion"}
  },
  {
    input: { coef: "1", exp: "594" },
    result: {text: "One nove-nonagin-tillion"}
  },
  {
    input: { coef: "1", exp: "597" },
    result: {text: "One thousand nove-nonagin-tillion"}
  },
  {
    input: { coef: "1", exp: "600" },
    result: {text: "One cen-tillion"}
  },
  {
    input: { coef: "1", exp: "606" },
    result: {text: "One un-cen-tillion"}
  },
  {
    input: { coef: "1", exp: "6000" },
    result: {text: "One mill-illion"}
  },
];

const TEST_CASES_EUROPEAN_TIER1 = [
  {
    input: { coef: "0", exp: "0" },
    result: {text: "Zero"}
  },
  {
    input: { coef: "1", exp: "0" },
    result: {text: "One"}
  },
  {
    input: { coef: "2", exp: "0" },
    result: {text: "Two"}
  },
  {
    input: { coef: "3", exp: "0" },
    result: {text: "Three"}
  },
  {
    input: { coef: "4", exp: "0" },
    result: {text: "Four"}
  },
  {
    input: { coef: "5", exp: "0" },
    result: {text: "Five"}
  },
  {
    input: { coef: "6", exp: "0" },
    result: {text: "Six"}
  },
  {
    input: { coef: "7", exp: "0" },
    result: {text: "Seven"}
  },
  {
    input: { coef: "8", exp: "0" },
    result: {text: "Eight"}
  },
  {
    input: { coef: "9", exp: "0" },
    result: {text: "Nine"}
  },
  {
    input: { coef: "10", exp: "0" },
    result: {text: "Ten"}
  },
  {
    input: { coef: "1", exp: "1" },
    result: {text: "Ten"}
  },
  {
    input: { coef: "11", exp: "0" },
    result: {text: "Eleven"}
  },
  {
    input: { coef: "2", exp: "1" },
    result: {text: "Twenty"}
  },
  {
    input: { coef: "1", exp: "2" },
    result: {text: "One hundred"}
  },
  {
    input: { coef: "1", exp: "3" },
    result: {text: "One thousand"}
  },
  {
    input: { coef: "1", exp: "4" },
    result: {text: "Ten thousand"}
  },
  {
    input: { coef: "1", exp: "5" },
    result: {text: "One hundred thousand"}
  },
  {
    input: { coef: "1", exp: "6" },
    result: {text: "One mi-llion"}
  },
  {
    input: { coef: "1", exp: "7" },
    result: {text: "Ten mi-llion"}
  },
  {
    input: { coef: "1", exp: "8" },
    result: {text: "One hundred mi-llion"}
  },
  {
    input: { coef: "1", exp: "9" },
    result: {text: "One mi-lliard"}
  },
  {
    input: { coef: "1", exp: "10" },
    result: {text: "Ten mi-lliard"}
  },
  {
    input: { coef: "1", exp: "11" },
    result: {text: "One hundred mi-lliard"}
  },
  {
    input: { coef: "1", exp: "12" },
    result: {text: "One bi-llion"}
  },
  {
    input: { coef: "1", exp: "13" },
    result: {text: "Ten bi-llion"}
  },
  {
    input: { coef: "1", exp: "14" },
    result: {text: "One hundred bi-llion"}
  },
  {
    input: { coef: "1", exp: "15" },
    result: {text: "One bi-lliard"}
  },
  {
    input: { coef: "1", exp: "16" },
    result: {text: "Ten bi-lliard"}
  },
  {
    input: { coef: "1", exp: "17" },
    result: {text: "One hundred bi-lliard"}
  },
  {
    input: { coef: "1", exp: "18" },
    result: {text: "One tri-llion"}
  },
  {
    input: { coef: "1", exp: "24" },
    result: {text: "One quadri-llion"}
  },
  {
    input: { coef: "1", exp: "30" },
    result: {text: "One quinti-llion"}
  },
  {
    input: { coef: "1", exp: "36" },
    result: {text: "One sexti-llion"}
  },
  {
    input: { coef: "1", exp: "42" },
    result: {text: "One septi-llion"}
  },
  {
    input: { coef: "1", exp: "48" },
    result: {text: "One octi-llion"}
  },
  {
    input: { coef: "1", exp: "54" },
    result: {text: "One noni-llion"}
  },
  {
    input: { coef: "1", exp: "60" },
    result: {text: "One dec-illion"}
  },
  {
    input: { coef: "1", exp: "63" },
    result: {text: "One dec-illiard"}
  },
  {
    input: { coef: "1", exp: "66" },
    result: {text: "One un-dec-illion"}
  },
  {
    input: { coef: "1", exp: "120" },
    result: {text: "One vigin-tillion"}
  },
  {
    input: { coef: "1", exp: "594" },
    result: {text: "One nove-nonagin-tillion"}
  },
  {
    input: { coef: "1", exp: "597" },
    result: {text: "One nove-nonagin-tilliard"}
  },
  {
    input: { coef: "1", exp: "600" },
    result: {text: "One cen-tillion"}
  },
  {
    input: { coef: "1", exp: "606" },
    result: {text: "One un-cen-tillion"}
  },
  {
    input: { coef: "1", exp: "6000" },
    result: {text: "One mill-illion"}
  },
];

const resultsBritish1 = ref<TestResult[]>([]);
const resultsEuropean1 = ref<TestResult[]>([]);

function runTest(tests: TestCase[], opts: ExOptions, results: Ref) {
  for (let test of tests) {
    test.result.text = test.result.text;
    const conv = new EngNumConv(test.input)
        .setOptions(opts)
    const result = conv.convert().toText(ResultFormat.HYPHENS);

    results.value.push({
      input: test.input,
      output: result,
      assertion: result.trim() === test.result.text,
      correct: test.result.text
    });
  }
}

runTest(TEST_CASES_BRITISH_TIER1, {scale: Scale.LONG}, resultsBritish1);
runTest(TEST_CASES_EUROPEAN_TIER1, {scale: Scale.LONG, longScaleStyle: LongScaleStyle.EUROPEAN}, resultsEuropean1);

</script>

<template>
<div class="test-report">
  <h1>Long Scale British</h1>
  <ol>
    <Testcase :cases="resultsBritish1" />
  </ol>
  <h1>Long Scale European</h1>
  <ol>
    <Testcase :cases="resultsEuropean1" />
  </ol>
</div>
</template>