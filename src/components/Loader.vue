<script setup>
import {useTranslation} from "i18next-vue";

const {t}=useTranslation()
</script>

<template>
  <div class="loader-main">
    <div class="loader-box">
      <div class="loader-container">
        <span class="loader"></span>
      </div>
      <h3>{{ t('enums.loading') }}</h3>
    </div>
  </div>
</template>

<style scoped>

</style>