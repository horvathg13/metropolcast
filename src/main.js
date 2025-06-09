import './assets/main.css'
import App from './App.vue'
import {router} from "../App.js";

import {createApp, watch} from 'vue';

import I18NextVue from "i18next-vue";
import LanguageDetector from "i18next-browser-languagedetector";
import backend from "i18next-http-backend";
import i18next from "i18next";
import 'vue3-flag-icons/styles'
import FlagIcon from "vue3-flag-icons";
import './App.css';


const lng = localStorage.getItem('i18nextLng');

i18next
    .use(LanguageDetector)
    .use(backend)
    .init({
        debug:false,
        lng:'',
        fallbackLng:'hu-HU',
        ns:"translation",
        backend: {
            loadPath:'/locales/{{lng}}/translation.json',
        },
        initImmediate:true,
    })

const app = createApp(App)

app.use(I18NextVue, { i18next })
    .use(router)
app.mount('#app')