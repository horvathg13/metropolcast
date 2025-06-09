<script setup>
import { AkFacebookFill, CgFacebook, AkGithubFill, AkGithubOutlineFill, IcWww, IcGithub, AkLinkedinBoxFill, AkLinkedInV2Fill, AnOutlinedLinkedin, BxGmail, BxVuejs } from '@kalimahapps/vue-icons';
</script>

<template>
  <div class="footer-main-container">
    <div class="footer-icon-container">
      <a href="https://www.facebook.com/gabor.horvath.18041?locale=hu_HU" target="_blank"><CgFacebook class="small-icon"/></a>
      <a href="https://github.com/horvathg13" target="_blank"><IcGithub class="small-icon"/></a>
      <a href="https://www.linkedin.com/in/gábor-horváth-8230a1290" target="_blank"><AkLinkedInV2Fill class="small-icon"/></a>
      <a href="https://horvathg13.github.io/" target="_blank"><IcWww class="small-icon"/></a>
    </div>
    <div class="api-container">
      <h3>Powered by</h3> <a href="https://www.weatherapi.com/" target="_blank">WeatherAPI.com</a>
    </div>
    <div class="footer-icon-container">
      <BxVuejs class="small-icon no-click" title="vue3.js"/>
    </div>
  </div>
</template>