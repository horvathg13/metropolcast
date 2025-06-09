<script setup>
import FlagIcon from 'vue3-flag-icons'
import VueSelect from "vue3-select-component";
import {computed, onMounted, ref, watch} from "vue";
import {useTranslation} from "i18next-vue";
import i18next from "i18next";
import { LaCloudSunRainSolid, FlFilledWeatherRainShowersDay, FlFilledWeatherSunnyLow } from '@kalimahapps/vue-icons';
import { BsDot } from '@kalimahapps/vue-icons';
/*Translation*/
const {t} = useTranslation();

/*Data*/
const selectedValue = ref(localStorage.getItem("i18nextLng").slice(0, 2));
const options=[
  {
    label:t('enums.eng'), value:'gb',
  },
  {
    label:t('enums.hun'), value:'hu',
  },
]
let openMenu=ref(false);
/*Methods*/
function setSelectedValue(value) {
  selectedValue.value = value;
}
function open(e){
  e.stopPropagation();
  openMenu.value=!openMenu.value
}
function closeLngSelect(){
  openMenu.value === true ? openMenu.value=false : null;
}
watch(selectedValue, (newValue) => {
  if(newValue === 'gb'){
    localStorage.setItem("i18nextLng", 'en-GB');
    i18next.changeLanguage('en-GB')
  }
  if(newValue === 'hu'){
    localStorage.setItem("i18nextLng", 'hu-HU');
    i18next.changeLanguage('hu-HU')
  }
})
onMounted(()=>{
  if(localStorage.getItem("i18nextLng") === 'en-GB'){
    setSelectedValue("gb");
  }
})

</script>

<template>
  <div class="header-main-container" @click="closeLngSelect()">
    <div class="logo-container">
      <img src="../assets/metropolis_2.jpg"/>
      <h1>MetropolCast</h1>
    </div>
    <div class="lang-select-container" @click="(e)=>open(e)">

      <span><FlagIcon :code="selectedValue" size="25" circle/></span>
      <div class="lang-select-menu" v-if="openMenu" >
        <p v-for="option in options" @click="setSelectedValue(option.value)">
            <FlagIcon :code="option.value" size="25" :title="option.label" circle/>
        </p>
      </div>
    </div>
  </div>
</template>