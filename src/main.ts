import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEarthEurope, faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
import { faEarthAmerica } from '@fortawesome/free-solid-svg-icons/faEarthAmerica';

library.add(faEarthEurope)
library.add(faEarthAmerica)
library.add(faPlay)
library.add(faStop)

const app = createApp(App)

app.use(router)
app.use(i18n)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
