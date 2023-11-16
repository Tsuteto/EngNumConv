import { createI18n } from "vue-i18n"

export const TRANSLATE = {
  en: {
    btn: {
      exponent: "Exponent",
      number: "Number"
    },
    message: {
    }
  },
  ja: {
    btn: {
      exponent: "指数",
      number: "数字"
    },
    message: {
    }
  }
}

export const i18n = createI18n({
  locale: 'ja', // set locale
  fallbackLocale: 'en', // set fallback locale
  TRANSLATE, // set locale messages
})
