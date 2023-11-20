<script setup lang="ts">
import { reactive } from "vue";
import { EngNumConv, Scale, LongScaleStyle, type ResultData } from "@/components/EngNumConv";
import SpeechManager from "@/components/SpeechManager";
import ResultView from "@/components/Result.vue";
import InputField from "@/components/InputField.vue";

const speech = new SpeechManager();
speech.init();
speech.onStart(() => state.isSpeaking = true);
speech.onEnd(() => state.isSpeaking = false);

const SYSTEM_DESC = {
  DIC: "辞書の語彙を基に構築された命数法で表現します",
  JB: "Jonathan Bowsers氏により拡張定義された命数法で表現します"
};

const SCALE_DESC = {
  SHORT: "主に米国、英国、東欧等で使用される千進法で表現します",
  LONG: "主に欧州で使用される百万進法で表現します（英国では歴史的表現）"
}

const STYLE_DESC = {
  BRITISH: "英国での百万進法表現（Million → Thousand million → Billion）",
  EUROPEAN: "欧州での百万進法表現（Million → Milliard → Billion）"
}

const WORD_DESC = {
  PLAIN: "単語(-illion)をそのまま表示（ソフトハイフンを含みます）",
  HYPHENATED: "単語(-illion)をハイフン区切りで表示",
  DESCRIBED: "単語(-illion)を構成要素に分解しTierと序数を示す解説的表示"
}

const ERROR_MSGS: {[id: string]: string} = {
  "error.numberRequired": "実数を入力してください",
  "error.integerRequired": "整数を入力してください",
  "error.maxValue": "{}を超える値は入力できません"
}

type ValidationError = {
  item: string;
  msg: string;
  param?: string[];
}

const state = reactive({
  system: "JB" as "JB" | "DIC",
  systemDesc: SYSTEM_DESC.JB,
  scale: Scale.SHORT,
  scaleDesc: SCALE_DESC.SHORT,
  style: LongScaleStyle.BRITISH,
  styleDesc: STYLE_DESC.BRITISH,
  word: WordStyle.PLAIN,
  wordDesc: WORD_DESC.PLAIN,
  inputMode: InputMode.NUM,
  coef1: "1",
  exp1: "64",
  coef2: "3",
  coef3: "3",
  exp2: "0",
  exp3: "0",
  number: "123",
  result: null as unknown as ResultData,
  speechText: "",
  isSpeaking: false,
  errors: [] as ValidationError[]
});

function validate() {
  state.errors = [];

  switch (state.inputMode) {
    case InputMode.EXP1:
      numberRequired("coef1", state.coef1);
      integerRequired("exp1", state.exp1);
      break;
    case InputMode.EXP2:
      numberRequired("coef1", state.coef1);
      integerRequired("exp1", state.exp1);
      integerRequired("exp2", state.exp2);
      maxValue("exp2", state.exp2, 100000n);
      integerRequired("coef2", state.coef2);
      break;
    case InputMode.EXP3:
      integerRequired("exp2", state.exp2);
      break;
    case InputMode.EXP4:
      integerRequired("exp2", state.exp2);
      integerRequired("exp3", state.exp3);
      maxValue("exp3", state.exp3, 100000n);
      integerRequired("coef3", state.coef3);
      break;
    case InputMode.EXP5:
      integerRequired("exp3", state.exp3);
      maxValue("exp3", state.exp3, 3n * 10n ** 45n - 1n);
      break;
    case InputMode.NUM:
      integerRequired("number", state.number.replace(/[\n\r,]+/g, ""));
      break;
  }

  return !state.errors.length;

  function numberRequired(item: string, val: string) {
    if (!isNumber(val)) {
      state.errors.push({
        item: item,
        msg: "error.numberRequired"
      });
    }
  }

  function integerRequired(item: string, val: string) {
    if (!isNumber(val) || val.indexOf(".") > -1) {
      state.errors.push({
        item: item,
        msg: "error.integerRequired"
      });
    }
  }
  function maxValue(item: string, val: string, max: bigint) {
    if (isNumber(val) && BigInt(val.replace(/[,\s]/g, "")) > BigInt(max)) {
      state.errors.push({
        item: item,
        msg: "error.maxValue",
        param: [max.toString()]
      });
    }
  }
  function isNumber(val: string) {
    return val.match(/^[-+]?([0-9,\s]+\.?|\.[0-9\s]+|[0-9,\s]+\.[0-9\s]+)$/)
  }
}

function hasError(item: string) {
  return state.errors.some(e => e.item === item);
}

function getErrorMsgs() {
  return state.errors.map(e => {
    let msg = ERROR_MSGS[e.msg];
    if (e.param) {
      for (const p of e.param) {
        msg = msg.replace("{}", p);
      }
    }
    return msg;
  });
}

function handleSystemDictionaryClicked(e: Event) {
  state.system = 'DIC';
  state.systemDesc = SYSTEM_DESC.DIC;
  if (state.inputMode > InputMode.EXP2) {
    state.inputMode = InputMode.EXP2;
  }
}

function handleSystemJBsExtentionClicked(e: Event) {
  state.system = 'JB';
  state.systemDesc = SYSTEM_DESC.JB;
}

function handleConvertClicked(e: Event) {
  e.preventDefault();

  if (!validate()) {
    return;
  }

  // Sanitize
  const exp1 = state.exp1.replace(/[,\s]/g, "");
  const exp2 = state.exp2.replace(/[,\s]/g, "");
  const exp3 = state.exp3.replace(/[,\s]/g, "");
  const coef1 = state.coef1.replace(/[,\s]/g, "");
  const coef2 = state.coef2.replace(/[,\s]/g, "");
  const coef3 = state.coef3.replace(/[,\s]/g, "");
  const number = state.number.replace(/[\n\r,\s]+/g, "");

  let input;
  switch (state.inputMode) {
    case InputMode.EXP1:
      input = { coef: coef1, exp: exp1 };
      break;
    case InputMode.EXP2:
      input = {
        coef: coef1,
        exp: (BigInt(coef2) * 10n ** BigInt(exp2) + BigInt(exp1)).toString()
      };
      break;
    case InputMode.EXP3:
      input = {
        exp2: exp2
      };
      break;
    case InputMode.EXP4:
      input = {
        exp2: (BigInt(coef3) * 10n ** BigInt(exp3) + BigInt(exp2)).toString()
      }
      break;
    case InputMode.EXP5:
      input = {
        exp3: exp3
      }
      break;
    case InputMode.NUM:
      input = { coef: number, exp: "0" };
      break;
  }
  const converter = new EngNumConv(input).setOptions({
    system: state.system,
    scale: state.scale, longScaleStyle: state.style});
  const result = converter.convert();
  state.result = result.data;
  state.speechText = result.toSpeechText();
  console.log(result.data);
}

function handleSpeechClicked(e: Event) {
  if (state.speechText) {
    speech.setText(state.speechText);
    speech.onSpeechClicked(e);
  }
}

</script>

<script lang="ts">
enum InputMode {
  NUM, EXP1, EXP2, EXP3, EXP4, EXP5
};

export enum WordStyle {
  PLAIN = "p", HYPHENATED = "h", DESCRIBED = "d"
};
</script>

<template>
  <main>
    <form id="form">
      <div class="box box-mode">
        <div class="box-cont">

          <!-- OPTIONS -->
          <div class="options">
            <span class="label">System</span>
            <div class="label-switcher">
              <div class="switcher" id="system-switcher">
                <button type="button" class="btn" v-bind:class="{ active: state.system === 'DIC' }"
                  @click="handleSystemDictionaryClicked">Dictionary</button>
                <button type="button" class="btn" v-bind:class="{ active: state.system === 'JB' }"
                  @click="handleSystemJBsExtentionClicked">JB’s Extension</button>
              </div>
            </div>
            <div class="desc">{{state.systemDesc}}</div>
            <span class="label">Scale</span>
            <div class="label-switcher">
              <div class="switcher" id="scale-switcher">
                <button type="button" class="btn" v-bind:class="{ active: state.scale === Scale.SHORT }"
                  @click="state.scale = Scale.SHORT; state.scaleDesc = SCALE_DESC.SHORT">Short Scale</button>
                <button type="button" class="btn" v-bind:class="{ active: state.scale === Scale.LONG }"
                  @click="state.scale = Scale.LONG; state.scaleDesc = SCALE_DESC.LONG">Long Scale</button>
              </div>
            </div>
            <div class="desc">{{state.scaleDesc}}</div>
            <span class="label" v-bind:class="{ disabled: state.scale !== Scale.LONG }">Long Scale Style</span>
            <div class="label-switcher">
              <div class="switcher" id="style-switcher">
                <button type="button" class="btn" v-bind:class="{ active: state.style === LongScaleStyle.BRITISH }" :disabled="state.scale !== Scale.LONG"
                  @click="state.style = LongScaleStyle.BRITISH; state.styleDesc = STYLE_DESC.BRITISH">British Style</button>
                <button type="button" class="btn" v-bind:class="{ active: state.style === LongScaleStyle.EUROPEAN }" :disabled="state.scale !== Scale.LONG"
                  @click="state.style = LongScaleStyle.EUROPEAN; state.styleDesc = STYLE_DESC.EUROPEAN">European Style</button>
              </div>
            </div>
            <div class="desc" v-bind:class="{ disabled: state.scale !== Scale.LONG }">{{state.styleDesc}}</div>
            <span class="label">Word Style</span>
            <div class="label-switcher">
              <div class="switcher" id="style-switcher">
                <button type="button" class="btn" v-bind:class="{ active: state.word === WordStyle.PLAIN }"
                  @click="state.word = WordStyle.PLAIN; state.wordDesc = WORD_DESC.PLAIN">Plain</button>
                <button type="button" class="btn" v-bind:class="{ active: state.word === WordStyle.HYPHENATED }"
                  @click="state.word = WordStyle.HYPHENATED; state.wordDesc = WORD_DESC.HYPHENATED">Hyphenated</button>
                <button type="button" class="btn" v-bind:class="{ active: state.word === WordStyle.DESCRIBED }"
                  @click="state.word = WordStyle.DESCRIBED; state.wordDesc = WORD_DESC.DESCRIBED">Described</button>
              </div>
            </div>
            <div class="desc">{{state.wordDesc}}</div>
          </div>
        </div>
      </div>
      <hr/>

      <!-- INPUT -->
      <div class="box box-input">
        <div class="box-header">
          <div class="switcher" id="form-switcher">
            <button type="button" class="btn" v-bind:class="{ active: state.inputMode === InputMode.NUM }"
              @click="state.inputMode = InputMode.NUM; validate()">数字</button>
            <button type="button" class="btn" v-bind:class="{ active: state.inputMode === InputMode.EXP1 }"
              @click="state.inputMode = InputMode.EXP1; validate()">指数 I</button>
            <button type="button" class="btn" v-bind:class="{ active: state.inputMode === InputMode.EXP2 }"
              @click="state.inputMode = InputMode.EXP2; validate()">指数 II</button>
            <button type="button" class="btn" v-bind:class="{ active: state.inputMode === InputMode.EXP3 }" :disabled="state.system !== 'JB'"
              @click="state.inputMode = InputMode.EXP3; validate()">指数 III</button>
            <button type="button" class="btn" v-bind:class="{ active: state.inputMode === InputMode.EXP4 }" :disabled="state.system !== 'JB'"
              @click="state.inputMode = InputMode.EXP4; validate()">指数 IV</button>
            <button type="button" class="btn" v-bind:class="{ active: state.inputMode === InputMode.EXP5 }" :disabled="state.system !== 'JB'"
              @click="state.inputMode = InputMode.EXP5; validate()">指数 V</button>
          </div>
        </div>

        <div class="box-cont">

          <!-- EXP class 1 -->
          <div class="expression exp-class1" v-if="state.inputMode === InputMode.EXP1">
            <div class="input-fld coef1">
              <InputField v-model="state.coef1" class="input-coef" v-bind:class="{error: hasError('coef1')}" @update:model-value="validate()" />
            </div>
            <div class="label">&nbsp;×&nbsp;10&nbsp;</div>
            <div class="input-fld exp1">
              <InputField v-model="state.exp1" class="input-exp1" v-bind:class="{error: hasError('exp1')}" @update:model-value="validate()" />
            </div>
          </div>

          <!-- EXP class 2 -->
          <div class="expression exp-class2" v-if="state.inputMode === InputMode.EXP2">
            <div class="input-fld coef1">
              <InputField v-model="state.coef1" class="input-coef" v-bind:class="{error: hasError('coef1')}" @update:model-value="validate()" />
            </div>
            <div class="label">&nbsp;×&nbsp;10</div>
            <div class="label"><sup>&nbsp;(&nbsp;</sup></div>
            <div class="input-fld coef2">
              <InputField v-model="state.coef2" class="input-coef2" v-bind:class="{error: hasError('coef2')}" @update:model-value="validate()" />
            </div>
            <div class="label"><sup>&nbsp;×&nbsp;10&nbsp;</sup></div>
            <div class="input-fld exp2">
              <InputField v-model="state.exp2" class="input-exp2" v-bind:class="{error: hasError('exp2')}" @update:model-value="validate()" />
            </div>
            <div class="label"><sup>&nbsp;+&nbsp;</sup></div>
            <div class="input-fld exp1">
              <InputField v-model="state.exp1" class="input-exp1" v-bind:class="{error: hasError('exp1')}" @update:model-value="validate()" />
            </div>
            <div class="label"><sup>&nbsp;)</sup></div>
          </div>

          <!-- EXP class 3 -->
          <div class="expression exp-class3" v-if="state.inputMode === InputMode.EXP3 && state.scale === Scale.SHORT">
            <div class="label">
              10
            </div>
            <div class="label">
              <sup>&nbsp;(&nbsp;</sup><sup>3&nbsp;×&nbsp;10&nbsp;</sup>
            </div>
            <div class="input-fld exp2">
              <InputField v-model="state.exp2" class="input-exp2" v-bind:class="{error: hasError('exp2')}" @update:model-value="validate()" />
            </div>
            <div class="label"><sup>&nbsp;+&nbsp;3&nbsp;)</sup></div>
          </div>

          <div class="expression exp-class3" v-if="state.inputMode === InputMode.EXP3 && state.scale === Scale.LONG">
            <div class="label">
              10
            </div>
            <div class="label">
              <sup>&nbsp;(&nbsp;</sup><sup>6&nbsp;×&nbsp;10&nbsp;</sup>
            </div>
            <div class="input-fld exp2">
              <InputField v-model="state.exp2" class="input-exp2" v-bind:class="{error: hasError('exp2')}" @update:model-value="validate()" />
            </div>
            <div class="label"><sup>&nbsp;)</sup></div>
          </div>

          <!-- EXP class 4 -->
          <div class="expression exp-class4" v-if="state.inputMode === InputMode.EXP4 && state.scale === Scale.SHORT">
            <div class="label">10</div>
            <div class="label"><sup>&nbsp;{&nbsp;3&nbsp;×&nbsp;10</sup></div>
            <div class="label"><sup><sup>&nbsp;(&nbsp;</sup></sup></div>
            <div class="input-fld coef3">
              <InputField v-model="state.coef3" class="input-coef3" v-bind:class="{error: hasError('coef3')}" @update:model-value="validate()" />
            </div>
            <div class="label"><sup><sup>&nbsp;×&nbsp;10&nbsp;</sup></sup></div>
            <div class="input-fld exp3">
              <InputField v-model="state.exp3" class="input-exp3" v-bind:class="{error: hasError('exp3')}" @update:model-value="validate()" />
            </div>
            <div class="label"><sup><sup>&nbsp;+&nbsp;</sup></sup></div>
            <div class="input-fld exp2">
              <InputField v-model="state.exp2" class="input-exp2" v-bind:class="{error: hasError('exp2')}" @update:model-value="validate()" />
            </div>
            <div class="label"><sup><sup>&nbsp;)&nbsp;</sup></sup></div>
            <div class="label"><sup>+&nbsp;3&nbsp;}</sup></div>
          </div>

          <div class="expression exp-class4" v-if="state.inputMode === InputMode.EXP4 && state.scale === Scale.LONG">
            <div class="label">10</div>
            <div class="label"><sup>&nbsp;{&nbsp;6&nbsp;×&nbsp;10</sup></div>
            <div class="label"><sup><sup>&nbsp;(&nbsp;</sup></sup></div>
            <div class="input-fld coef3">
              <InputField v-model="state.coef3" class="input-coef3" v-bind:class="{error: hasError('coef3')}" @update:model-value="validate()" />
            </div>
            <div class="label"><sup><sup>&nbsp;×&nbsp;10&nbsp;</sup></sup></div>
            <div class="input-fld exp3">
              <InputField v-model="state.exp3" class="input-exp3"  v-bind:class="{error: hasError('exp3')}" @update:model-value="validate()"/>
            </div>
            <div class="label"><sup><sup>&nbsp;+&nbsp;</sup></sup></div>
            <div class="input-fld exp2">
              <InputField v-model="state.exp2" class="input-exp2" v-bind:class="{error: hasError('exp2')}" @update:model-value="validate()" />
            </div>
            <div class="label"><sup><sup>&nbsp;)&nbsp;</sup></sup></div>
            <div class="label"><sup>&nbsp;}</sup></div>
          </div>

          <!-- EXP class 5 -->
          <div class="expression exp-class5" v-if="state.inputMode === InputMode.EXP5 && state.scale === Scale.SHORT">
            <div class="label">10</div>
            <div class="label"><sup>&nbsp;{&nbsp;3&nbsp;×&nbsp;10</sup></div>
            <div class="label"><sup><sup>&nbsp;(&nbsp;3</sup></sup></div>
            <div class="label"><sup><sup>&nbsp;×&nbsp;10&nbsp;</sup></sup></div>
            <div class="input-fld exp3">
              <InputField v-model="state.exp3" class="input-exp3" v-bind:class="{error: hasError('exp3')}" @update:model-value="validate()" />
            </div>
            <div class="label"><sup><sup>&nbsp;)&nbsp;</sup></sup></div>
            <div class="label"><sup>+&nbsp;3&nbsp;}</sup></div>
          </div>

          <div class="expression exp-class5" v-if="state.inputMode === InputMode.EXP5 && state.scale === Scale.LONG">
            <div class="label">10</div>
            <div class="label"><sup>&nbsp;{&nbsp;6&nbsp;×&nbsp;10</sup></div>
            <div class="label"><sup><sup>&nbsp;(&nbsp;6</sup></sup></div>
            <div class="label"><sup><sup>&nbsp;×&nbsp;10&nbsp;</sup></sup></div>
            <div class="input-fld exp3">
              <InputField v-model="state.exp3" class="input-exp3" v-bind:class="{error: hasError('exp3')}" @update:model-value="validate()" />
            </div>
            <div class="label"><sup><sup>&nbsp;)&nbsp;</sup></sup></div>
            <div class="label"><sup>&nbsp;}</sup></div>
          </div>

          <!-- NUMBER -->
          <div class="number" v-if="state.inputMode === InputMode.NUM">
            <textarea v-model="state.number" class="input-number" v-bind:class="{error: hasError('number')}" @update:model-value="validate()"></textarea>
          </div>

          <div class="error-msg">
            <ul v-for="msg in getErrorMsgs()">
              <li>{{ msg }}</li>
            </ul>
          </div>
        </div>
      </div>

      <hr/>

      <div class="box box-conv">
        <div class="box-header">
          <button type="submit" @click="handleConvertClicked" class="btn btn-light btn-conv">変換</button>
        </div>
      </div>

      <hr/>

      <div class="box box-result">
        <div class="box-header">
          <div class="title">英語表記</div>
          <div class="speech-panel">
            <button type="button" class="btn fa fa-volume-up" @click="handleSpeechClicked">
              <font-awesome-icon icon="fa-stop" v-if="state.isSpeaking"/><font-awesome-icon icon="fa-play" v-if="!state.isSpeaking"/> Speech</button>
          </div>
        </div>
        <div class="box-cont">
          <div class="result">
            <ResultView :style="state.word" :result="state.result" v-if="state.result" />
          </div>
        </div>
      </div>
    </form>

    <hr/>

    <ul class="note">
      <li>ソフトハイフンとは不可視の制御文字で、単語の区切りに挿入するとその位置で行を折り返す際に自動的にハイフンに変化するものです。</li>
      <li>小数が発生した場合は切り捨てます。</li>
      <li>変換処理はJavaScriptで完結しサーバ等との通信は発生しません。</li>
      <li>「数字」入力モードで大量の数字（10万桁以上）を変換する際は時間と負荷が掛かる場合があるので注意。</li>
      <li>そのほか<strong><a href="https://github.com/Tsuteto/EngNumConv/blob/main/README.md" target="_blank">詳細な説明はこちらへ</a></strong></li>
    </ul>
    
    <hr/>

    <div class="box box-conv">
      <div class="box-cont">
        <p>v1.0.2 - made by <a href="https://twitter.com/tsuteto">@tsuteto</a>, last updated 2023.11.20, released 2023.11.16<br />
          <a href="https://github.com/Tsuteto/EngNumConv">Source available on GitHub</a>
        </p>
      </div>
    </div>

  </main>
</template>

<style>
.box {
  margin: 15px 0;
}

.box-header {
  padding: 5px;
  text-align: center;
  font-weight: bold;
}

.box-cont {
  padding: 10px;
  text-align: center;
  padding: 10px 20px;
  transition: height 0.1s;
}

hr {
  border: none;
  border-bottom: 1px solid var(--color-separator);
}

/* SWITCHER */
.switcher .btn {
  position: relative;
  border: 0px solid transparent;
  border-bottom: 1px solid white;
}


.switcher .btn.active {
  z-index: 1;
}

/* OPTIONS */
.options {
  display: grid;
  grid-template-columns: auto 20em 1fr;
  width: 960px;
  gap: 1em;
  margin: 0 auto;
  text-align: left;
  align-items: center;
}

.options .label {
  text-align: right;
}

.options .switcher {
  display: flex;
}
.options .switcher .btn {
  width: 100%;
}

.options .desc {
  font-size: 14px;
}
.options .disabled {
  opacity: 0.2;
}

textarea.error,
input.error {
  border-color: darkred;
  background-color: #43000080;
}

/* MOBILE */
@media (max-width: 1000px) {
  .box-cont {
    padding: 10px 2vw;
  }

  .options {
    grid-template-columns: auto 1fr;
    width: 100%;
    row-gap: 10px;
  }

  .options .label {
    grid-row: span 2;
    align-self: start;
    line-height: 27px;
  }

  .options .desc {
    grid-column-start: 2;
    margin-bottom: 10px;
  }
}

/* INPUT FORM */
.box-input {}

.box-input .box-header {
}

.box-input .box-cont {
  line-height: 1.0;
}

#form-switcher .btn {
  font-size: inherit;
  width: 100px;
}

#form-switcher .active {
}

/* INPUT */
.expression {
  display: flex;
  width: fit-content;
  margin: 0 auto;
  font-size: 1.5em;
  align-items: end;
}

sup {
  vertical-align: 0.8em;
  font-size: 85%;
}

.expression .input-fld {
  line-height: 1;
}

.expression .label {
  line-height: 1.2;
}

.input-coef {
  font-size: 100%;
}

.input-fld.coef2 {
  margin-bottom: 0.7em;
}
.input-coef2 {
  font-size: 85%;
}

.input-fld.coef3 {
  margin-bottom: 1.35em;
}
.input-coef3 {
  font-size: calc(85% * 0.85);
}

.input-exp {
  width: 30px;
}

.input-fld.exp1 {
  margin-bottom: 0.7em;
}

.input-exp1 {
  font-size: 85%;
}

.input-fld.exp2 {
  margin-bottom: 1.35em;
}
.input-exp2 {
  font-size: calc(85% * 0.85);
}

.input-fld.exp3 {
  margin-bottom: 1.8em;
}

.input-exp3 {
  font-size: 60%;
}

.input-number {
  width: 100%;
  height: 150px;
  font-size: 1.5em;
}


/* CONVERSION BUTTON */
.box-conv .box-header {
  padding: 10px 0;
  text-align: center;
}

.btn-conv {
  font-size: 1.2em;
  width: 200px;
}

/* OPTIONS */
.opt-row {
  display: table;
  width: 100%;
}

.opt-cell {
  display: table-cell;
  text-align: center;
  vertical-align: middle;
  width: calc(100% / 4);
}

/* OUTPUT */
.box-result .box-header {
  position: relative;
}

.box-result .title {
}

.box-result .speech-panel {
  position: absolute;
  top: 5px;
  right: 20px;
}

.box-result .box-cont .result {
  position: relative;
  margin-top: 10px;
  padding: 0.5em 10px;
  min-height: 200px;
  font-size: 120%;
  line-height: 2;
  text-align: center;
}

.box-result .box-cont .result::before,
.box-result .box-cont .result::after {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  border: 1px solid white;
  width: 3vw;
  max-width: 20px;
  height: 100%;
  z-index: -1;
}

.box-result .box-cont .result::before {
  left: 0;
  border-width: 1px 0 1px 1px;
}

.box-result .box-cont .result::after {
  right: 0;
  border-width: 1px 1px 1px 0;
}

/* NOTICE */
.note {
  color: var(--color-notice);
  font-size: 0.8em;
}

.note li::marker {
  font-size: 0.7em;
}

ul {
  list-style-type: disclosure-closed;
  padding-left: 20px;
  color: var(--color-notice);
}

/* ERROR MSG */
.error-msg {
  margin: 0 auto;
  width: fit-content;
}
.error-msg ul {
  color: #e04b82a0;
}

</style>