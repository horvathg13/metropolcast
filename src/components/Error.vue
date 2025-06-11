<script setup>
import {useTranslation} from "i18next-vue";

const {t}=useTranslation();
const props = defineProps(["error"])
</script>

<template>
  <div class="main-container search">
    <div class="error-main-container">
      <div class="error-message-container">
        <h3>{{ t(`app-error.${props?.error?.code}`)}}</h3>
      </div>
      <div class="img-container">
        <img src="/src/assets/error-img.png" alt="error">
      </div>
    </div>
  </div>
</template>
