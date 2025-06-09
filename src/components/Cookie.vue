<script setup>

import {use} from "i18next";
import {useTranslation} from "i18next-vue";

const {t}=useTranslation();

</script>

<template>
  <div class="cookie-popup">
    <div class="cookie-content-main">
      <div class="cookie-content">
        <h3>{{t('cookies.info')}}</h3>
      </div>
      <div class="cookie-action-container">
        <button class="cookie-button" type="button" @click="$emit('close', true)">{{t('cookies.accept')}}</button>
        <button class="cookie-button reject" type="button" @click="$emit('close', false)">{{t('cookies.reject')}}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>