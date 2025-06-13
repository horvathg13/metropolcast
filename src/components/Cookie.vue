<script setup>

import {use} from "i18next";
import {useTranslation} from "i18next-vue";
import {addGtag, useConsent} from "vue-gtag";
import {computed, onMounted, ref,  watch} from "vue";
const { acceptAll, rejectAll } = useConsent();
const {t}=useTranslation();

let functionCookie=ref(true);
let analyticalCookie=ref(true);

</script>

<template>
  <div class="cookie-popup">
    <div class="cookie-content-main">
      <div class="cookie-content">
        <h3>{{t('cookies.info')}}</h3>
        <div class="switch-box-main">

          <div class="switch-box">
            <label>{{ t('cookies.functional') }}</label>
            <label class="switch">
              <input type="checkbox" v-model="functionCookie" disabled> >
              <span class="slider disabled round"></span>
            </label>
          </div>

          <div class="switch-box">
            <label for="analytic-box">{{ t('cookies.analytical') }}</label>
            <label class="switch">
              <input id="analytic-box" type="checkbox" v-model="analyticalCookie" >
              <span class="slide round"></span>
            </label>
          </div>

        </div>
      </div>
      <div class="cookie-action-container">
        <button class="cookie-button" type="button" @click="$emit('close',{functionality: true, analytical: analyticalCookie})">{{t('cookies.understand')}}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>