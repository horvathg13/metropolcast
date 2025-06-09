<script setup>
import { CaLocationFilled, BxSearchAlt2, AkStar, AnFilledStar, CaTemperatureHot, CdHistory} from '@kalimahapps/vue-icons';
import Footer from './Footer.vue';
import {computed, onMounted, ref,  watch} from "vue";
import ServiceClient from "../../ServiceClient.js";
import {useTranslation} from "i18next-vue";
import i18next from "i18next";
import Error from "@/components/Error.vue";
import cities from '../cities.json';
import admin1 from '../admin1.json';
import {getBoundsOfDistance, isPointWithinRadius, orderByDistance} from "geolib";
import {countryToAlpha2} from "../../country-to-iso.js";
import Chart from "@/components/chart.vue";
import Cookie from "@/components/Cookie.vue";
import varosok from "../cities_hu.json"
import cities_en from "../cities_en.json"
import Helper from "../../Helper.js";
import  db from '@/database.js';
import Loader from "./Loader.vue"

/*data*/
let searchValue=ref('');
let weatherData=ref(null);
let isCelsius=ref(true);
let serverError=ref({});
let options=ref({});
let favorite = ref();
let nearestCities=ref();
let selectedItem=ref();
let arrowSearch=ref();
const optionRefs = ref([]);
let showChart=ref(false);
let generatedChartTempData=ref([]);
let generatedChartWindData=ref([]);
let generatedChartRainData=ref([]);
let generatedChartSnowData=ref([]);
let selectedForeCastDate=ref();
let cookies=ref();
let prevSelected=ref();
let loader=ref();


/*i18next*/
let currentLanguage = ref(i18next.language);
i18next.on('languageChanged', (lng) => {
  currentLanguage.value = lng
})

/*Translation*/
const {t}=useTranslation();

/*methods*/

async function searchHelper(geonameId, country=null, countryCode, state){

  let findName = findOriginalName(geonameId)
  let getCountryCode = country ? countryToAlpha2(country) : null

  loader.value=true;
  selectedItem.value=-1;

  try{
    const success = await ServiceClient.getForecast([findName, state, countryCode || getCountryCode])
    prevSelected.value = await translateCityName(success.location.name)
    weatherData.value = success;
    searchValue.value= '';
    findNearestCities();
    loader.value=false;
    if(!Object.keys(success.current).length){
      serverError.value={ "error":  { "code": 0 } }
    }

  }catch(error){
    loader.value=false;
    serverError.value=error;
    searchValue.value= '';
  }
}

function handleArrowSearchAction(){
  if(arrowSearch.value && arrowSearch.value.length){
    searchHelper(arrowSearch.value[0].geonameid, null, arrowSearch.value[0].countryCode, arrowSearch.value[0].state)
  }else{
    search()
  }
}
async function search(){
  serverError.value=[];
  selectedItem.value= -1
  loader.value=true;

  if(searchValue.value === ''){
    callWeatherByIP();
  }else{

    let getLocation= await findCityGeonameId(searchValue.value);
    try{
      const success = await ServiceClient.getForecast(getLocation || searchValue.value)
      prevSelected.value = await translateCityName(success.location.name)
      weatherData.value = success;
      searchValue.value= '';
      findNearestCities();
      loader.value=false;
      if(!Object.keys(success.current).length){
        serverError.value={ "error":  { "code": 0 } }
      }

    }catch(error){
      loader.value=false;
      serverError.value=error;
      searchValue.value= '';
    };
  }
}
async function searchCity(name, country){
  if(!name || !country){
    return null;
  }
  let countryCode = countryToAlpha2(country);
  let citiesFromDB = await db.cities
      .where({name: name, countryCode: countryCode})
      .toArray();

  if (citiesFromDB.length === 0) return null;
  return citiesFromDB[0];
}
async function findCityGeonameId(name){
    let findID = []
    let getGeonameID = null
    if(Helper.getUserLanguage() === 'hu') {
      findID = varosok.filter(e => new RegExp(name, "i").test(e.alternate_name));
    }else {
      findID = cities_en.filter(e => new RegExp(name, "i").test(e.alternate_name));
    }
    if(findID.length === 1){
      return await getCitiesDataByGeoID(findID[0].geonameid);
    }

    let bestMatch = null;
    let bestScore = 0;

    findID.forEach(entry => {
      const score = Helper.similarity(entry.alternate_name, name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry.geonameid;
      }
    });
    return await getCitiesDataByGeoID(bestMatch);
}

async function getCitiesDataByGeoID(geonameId){
  if(geonameId === null){
    return ''
  }
  let citiesFromDB = await db.cities
      .where('geonameid')
      .equals(geonameId)
      .toArray();

  if (citiesFromDB.length === 0) return null;

  const city = citiesFromDB[0];
  return [Helper.removeAccents(city.name), city.countryCode];
}
function dateRendering(date){
  if(Helper.checkToday(date)){
    return t("enums.today");
  }
  let newDate = new Date(date);
  let localizedDay=newDate.toLocaleDateString(i18next.language, { weekday: 'long' })
  return localizedDay.charAt(0).toUpperCase() + localizedDay.slice(1);
}

function findOriginalName(geonameid){
  return Helper.removeAccents(cities.find(e=>e.geonameid === geonameid).name);
}

function selectOption(e){
  options.value=[];
  //searchValue.value=[findOriginalName(e.geonameid),e.countryCode];
  searchHelper(e.geonameid, null, e.countryCode, e.state);
}

function selectFavorite(e){
  options.value=[];
  if(e.geonameid){
    let state = getAdmin1Data(e.countryCode, e.admin1);
    return searchHelper(e.geonameid, null, e.countryCode, state)
  }

  return ServiceClient.getForecast([e.name, countryToAlpha2(e.country)]).then((success)=>{
    prevSelected.value = success.location.name
    weatherData.value = success;
    searchValue.value= '';
    findNearestCities();
    if(!Object.keys(success.current).length){
      serverError.value={ "error":  { "code": 0 } }
    }
  }).catch(error=>{
    serverError.value=error?.response?.data;
    searchValue.value= '';
  });
}

async function saveCityData(e){
  if(!localStorage.getItem('favorite')){
    localStorage.setItem('favorite',JSON.stringify([]));
  }
  let getData = JSON.parse(localStorage.getItem('favorite'));
  if(!getData.length || !getData.some(f=>f.lat === e.lat && f.lng === e.lng)){
    let getCityData = await searchCity(e.name, e.country)
    if(getCityData){
      getData.push(getCityData);
      favorite.value=getData;
      return localStorage.setItem('favorite',JSON.stringify(getData));
    }
    getData.push(e);
    favorite.value=getData;
    return localStorage.setItem('favorite',JSON.stringify(getData));
  }
  return;
}
function removeCityFromFavorite(e){
  let getData = JSON.parse(localStorage.getItem('favorite'));
  let filteredValue = getData.filter(f=>(f.lat !== e.lat && f.lon !== e.lng));
  localStorage.setItem('favorite', JSON.stringify(filteredValue));
  favorite.value = filteredValue;
}

let isFavorite =computed(()=>{
      let e = weatherData?.value?.location;
      if(!e || !favorite.value){
        return false
      }

      return favorite.value.some(f=>f.name === e.name && countryToAlpha2(f.countryCode || f.country) === countryToAlpha2(e.country))
});

function isCookies(){
  let cookie = localStorage.getItem('cookies');
  if(JSON.parse(cookie) && JSON.parse(cookie) === true){
    return cookies.value=false;
  }
  return cookies.value=true;
}

function setCookie(data){
  if(cookies.value === true){
    localStorage.setItem('cookies', JSON.stringify(data));
    return cookies.value=false;
  }
}
function clickAway(){
  options.value=[];
  if(searchValue.value !== ''){
    search()
  }
}
function getAdmin1Data(countryCode,adminCode){
  if(countryCode && adminCode){
    let find=admin1.find(e=>e.code == countryCode +"."+ adminCode);
    if(find){
      return find.name
    }else{
      return ''
    }
  }
}
async function callWeatherByIP(){
  loader.value=true
  try{
    const success = await ServiceClient.getWeatherByIP()
    prevSelected.value = await translateCityName(success.location.name)
    weatherData.value = success;
    findNearestCities();
    loader.value=false;
  }catch(error){
    loader.value=false;
    serverError.value=error
  }
}

function findNearestCities() {
  let bounds = getBoundsOfDistance({
    latitude: weatherData.value.location.lat,
    longitude: weatherData.value.location.lon
  }, 100000);

  if (bounds.length > 0) {
    let findCities = cities.filter(city => Helper.isPointInBounds({latitude: city.latitude, longitude: city.longitude}, bounds)).filter(e => isPointWithinRadius({
              latitude: e.latitude,
              longitude: e.longitude
            }, {latitude: weatherData.value.location.lat, longitude: weatherData.value.location.lon}, 100000)
    )

    nearestCities.value = orderByDistance({latitude: weatherData.value.location.lat, longitude: weatherData.value.location.lon}, findCities)
        .map(e=>({geonameid: e.geonameid, name: getCityName(e.geonameid, e.name), state: getAdmin1Data(e.countryCode, e.admin1), country: Helper.getCountryNameFromISO(e.countryCode), countryCode:e.countryCode}))
        .slice(0,11);

  }
}
function handleArrowSearch(){
  if(options.value.length && options.value[selectedItem.value] !== undefined){
    arrowSearch.value= [{
      geonameid: options.value[selectedItem.value].geonameid,
      name:options.value[selectedItem.value].name,
      state:getAdmin1Data(options.value[selectedItem.value].countryCode, options.value[selectedItem.value].admin1),
      country: options.value[selectedItem.value].country,
      countryCode:options.value[selectedItem.value].countryCode
    }]
  }

}
function handleKeyDown(){
  if (selectedItem.value === -1 && options.value.length > 0) {
    selectedItem.value = 0
    return handleArrowSearch();
  }
  if (options.value.length - 1 !== selectedItem.value && selectedItem.value < options.value.length - 1) {
    selectedItem.value++
    return handleArrowSearch();
  }
}
function handleKeyUp(){
  if(selectedItem.value !== -1){
    selectedItem.value--
    handleArrowSearch();
  }else{
    return;
  }
}

function setWeatherIcon(query){
  if(query){
    let getLocalHour = new Date(query.location.localtime).getHours();
    let getLocalMinute = new Date(query.location.localtime).getMinutes();
    let finalLocalTime= getLocalHour + ":" + getLocalMinute;

    let getSunRise = Helper.convertTime12to24(query.forecast.forecastday[0].astro.sunrise);
    let getSunSet = Helper.convertTime12to24(query.forecast.forecastday[0].astro.sunset);

    if(finalLocalTime > getSunRise && finalLocalTime < getSunSet){
      return t(`weather.${query?.current?.condition?.code}.icon-day`)
    }else{
      return t(`weather.${query?.current?.condition?.code}.icon-night`)
    }
  }else{
    return t(`weather.0000.icon`);
  }
}
async function filterCities(filterCitiesEn){
  let citiesFromDB = await db.cities
      .where('geonameid')
      .anyOf(filterCitiesEn)
      .toArray();
  let citiesFilter = citiesFromDB
      .sort((a, b) => b.population - a.population)
      .slice(0, 19);
  return options.value = citiesFilter.map(e => ({
    geonameid: e.geonameid,
    name: getCityName(e.geonameid),
    state: getAdmin1Data(e.countryCode, e.admin1),
    country: Helper.getCountryNameFromISO(e.countryCode),
    countryCode: e.countryCode,
    admin1: e.admin1,

  }));
}

const timeout = ref();


watch(searchValue,(newValue) => {
  clearTimeout(timeout.value);
  timeout.value= setTimeout(()=>{
    selectedItem.value=-1;

    if(newValue !== ''){

      if(Helper.getUserLanguage() === 'hu'){
        let filterVarosok = varosok.filter(e => e.alternate_name.match(new RegExp(newValue, "i"))).map(e => e.geonameid);
        filterCities(filterVarosok)
      }
      if(Helper.getUserLanguage() === 'en'){

        let filterCitiesEn = cities_en.filter(e => e.alternate_name.match(new RegExp(newValue, "i"))).map(e => e.geonameid);
        filterCities(filterCitiesEn)
      }
    }else{
      options.value=[];
    }
  },800)

})

watch(selectedItem, (newIndex) => {
  const el = optionRefs.value[newIndex]
  if (el) {
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
})

watch(currentLanguage , async (newValue) => {
  let newCityName = await translateCityName(weatherData?.value?.location?.name)
  return prevSelected.value = newCityName;
})
function getCityName(geonameid, testValue=null){
  let find =[]

  if(Helper.getUserLanguage() === 'hu'){

    find = varosok.filter(e=>e.geonameid === geonameid)

    if(find.length){

      if (find.length === 1) {
        return find[0].alternate_name;
      }


      let bestMatch = null;
      let bestScore = 0;
      find.forEach(entry => {
        const score = Helper.similarity(entry.alternate_name, testValue ?? searchValue.value);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = entry.alternate_name;
        }
      });
      return bestMatch ?? "";
    }

  }
  if(Helper.getUserLanguage() === 'en'){
    find = cities_en.filter(e=>e.geonameid === geonameid)
    if(find.length){

      if (find.length === 1) {
        return find[0].alternate_name;
      }

      let bestMatch = null;
      let bestScore = 0;

      find.forEach(entry => {
        const score = Helper.similarity(entry.alternate_name, testValue ?? searchValue.value);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = entry.alternate_name;
        }
      });
      return bestMatch ?? "";
    }
  }
  return geonameid ? cities.find(e=>e.geonameid === geonameid).name : ''
}
async function translateCityName(name){
  let find =[]
  if(!name){
    return
  }
  find = await db.cities
      .where('name')
      .equals(name)
      .toArray()

  if(find.length){

    if (find.length === 1) {
      return getCityName(find[0].geonameid);
    }

    let bestMatch = null;
    let bestScore = 0;

    find.forEach(entry => {
      const score = Helper.similarity(entry.name, name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry.geonameid;
      }
    });
    return getCityName(bestMatch);
  }
  return name
}
function generateChartData(date, hour){
  if(hour.length){
    let finalLocalTime=[];
    let getTemp=[];

    hour.map(e=>{
      finalLocalTime.push(e.time.split(" ")[1]);
      getTemp.push(isCelsius ? e.temp_c : e.tem_f);
    })

    let final= {
      labels: finalLocalTime,
      datasets: [{
        data:getTemp,
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointBackgroundColor:'rgb(11,30,30)',
        showLine:true,
      }],
    }
    generatedChartTempData.value = final;

    if(windData(hour) === true && rainData(hour) === true && snowData(hour) === true){
      selectedForeCastDate.value=date;
      return showChart.value = true;
    }

  }
  return [];
}
function windData(hour){
  if(hour.length){
    let finalLocalTime=[];
    let getWind=[];

    hour.map(e=>{
      finalLocalTime.push(e.time.split(" ")[1]);
      getWind.push(isCelsius ? e.wind_kph : e.wind.mph);
    })

    let final= {
      labels: finalLocalTime,
      datasets: [{
        data:getWind,
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointBackgroundColor:'rgb(11,30,30)',
        showLine:true,
      }],
    }
    generatedChartWindData.value = final;
    return true;
  }
  return false;
}
function rainData(hour){
  if(hour.length){
    let finalLocalTime=[];
    let getRain=[];
    let getChance=[];

    hour.map(e=>{
      finalLocalTime.push(e.time.split(" ")[1]);
      getRain.push(isCelsius ? e.precip_mm : e.precip_in);
      getChance.push(e.chance_of_rain);
    })

    let final= {
      labels: finalLocalTime,
      datasets: [
        {
          data:getRain,
          type:"bar",
          fill: true,
          tension: 0.1,
          pointBackgroundColor:'rgb(11,30,30)',
          showLine:true,
          label:isCelsius ? t('chart.rain-mm') : t('chart.rain-in'),
          yAxisID: 'y1',
          borderWidth: 1,
          backgroundColor:'rgb(75, 192, 192)'
        },
        {
          data:getChance,
          type:"line",
          fill: false,
          borderColor: 'rgb(239,95,194)',
          tension: 0.5,
          pointBackgroundColor:'rgb(11,30,30)',
          showLine:true,
          label:t('chart.chance'),
          yAxisID: 'y2'
        },

      ],
    }
    generatedChartRainData.value = final;
    return true;
  }
  return false;
}
function snowData(hour){
  if(hour.length){
    let finalLocalTime=[];
    let getSnow=[];
    let getChance=[];

    hour.map(e=>{
      finalLocalTime.push(e.time.split(" ")[1]);
      getSnow.push(e.snow_cm);
      getChance.push(e.chance_of_snow);
    })

    let final= {
      labels: finalLocalTime,
      datasets: [
        {
          data:getSnow,
          type:"bar",
          fill: true,
          tension: 0.1,
          pointBackgroundColor:'rgb(11,30,30)',
          showLine:true,
          label:t('chart.snow-mm'),
          yAxisID: 'y1',
          borderWidth: 1,
          backgroundColor:'rgb(75, 192, 192)'
        },
        {
          data:getChance,
          type:"line",
          fill: false,
          borderColor: 'rgb(239,95,194)',
          tension: 0.5,
          pointBackgroundColor:'rgb(11,30,30)',
          showLine:true,
          label:t('chart.chance'),
          yAxisID: 'y2'
        },
      ],
    }
    generatedChartSnowData.value = final;
    return true;
  }
  return false;
}
function close(){
  showChart.value=false;
}
function closeCookies(data){
  cookies.value=false;
}

async function loadCitiesJson() {
  const count = await db.cities.count();
  if (count > 0) return;

  const response = await fetch('src/cities.json');
  const cities = await response.json();

  await db.cities.bulkAdd(cities);
}
/*mounted*/
onMounted(async () => {
  loadCitiesJson()
  await callWeatherByIP();
  favorite.value = JSON.parse(localStorage.getItem('favorite')) || [];
  selectedItem.value=-1;
  isCookies()
});

</script>

<template>
  <div class="main" @click="clickAway()">
    <div v-if="loader">
      <Loader/>
    </div>
    <Transition name="fade">
      <div v-if="showChart">
          <Chart
              :tempData="generatedChartTempData"
              :windData="generatedChartWindData"
              :isCelsius="isCelsius"
              :rainData="generatedChartRainData"
              :snowData="generatedChartSnowData"
              :date="selectedForeCastDate"
              @closeModal="close()"
          />
      </div>
    </Transition>
    <div class="main-container search">
      <div>
        <div class="input-container">
          <input type="search"
                 :placeholder="t('enums.placeholder')"
                 v-model="searchValue"
                 @keyup.enter="handleArrowSearchAction()"
                 @keydown.down="handleKeyDown()"
                 @keydown.up="handleKeyUp()"
          />
          <BxSearchAlt2 class="small-icon"/>
        </div>
        <div class="search-menu" v-if="options.length">
          <p
              v-for="(e,i) in options"
              :ref="el => optionRefs[i] = el"
              :class="{ hover: i === selectedItem }"
              @click="(event)=>{event.stopPropagation(); selectOption(e)}"
          >
            {{e.name}}, {{e.state}}, {{e.country}}
          </p>
        </div>
      </div>
      <div class="action-container">
        <div class="btn-container">
          <AkStar  class="small-icon" v-if="!isFavorite || false" @click="saveCityData(weatherData?.location)"/>
          <AnFilledStar  class="small-icon" v-else @click="removeCityFromFavorite(weatherData?.location)"/>
        </div>
        <div class="btn-container">
          <p>°F</p>
          <label class="switch">
            <input type="checkbox" v-model="isCelsius" >
            <span class="slider round"></span>
          </label>
          <p>°C</p>
        </div>
      </div>
    </div>
    <div v-if="!Object.keys(serverError).length" class="content-container">
      <div class="block-container">
          <div class="main-container">
            <div class="base-container big">
              <div class="svg-container">
                <img :src="setWeatherIcon(weatherData)" />
                <h1 v-if="isCelsius">{{new Intl.NumberFormat(i18next.language).format(weatherData?.current?.temp_c)}} °C</h1>
                <h1 v-else>{{new Intl.NumberFormat(i18next.language).format(weatherData?.current?.temp_f)}} °F</h1>
              </div>
              <h3>{{prevSelected}}</h3>
              <h3>{{Helper.countryNameTranslate(weatherData)}}</h3>
              <h4>{{ t(`weather.${weatherData?.current?.condition?.code}.day`) }}</h4>
              <h5>{{ t(`weather.${weatherData?.current?.condition?.code}.advise`)}}</h5>
            </div>
            <div class="card-container">
              <div class="card clickable"  v-for="e in weatherData?.forecast?.forecastday">
                <div class="svg-container " @click="generateChartData(e.date, e.hour)">
                  <h4>{{dateRendering(e.date)}}</h4>
                  <img :src="t(`weather.${e?.day?.condition?.code}.icon-day`) "/>
                  <h1 v-if="isCelsius">{{ new Intl.NumberFormat(i18next.language).format(e.day.avgtemp_c) }} °C</h1>
                  <h1 v-else>{{ new Intl.NumberFormat(i18next.language).format(e.day.avgtemp_f) }} °F</h1>
                  <h5>{{ t(`weather.${e.day.condition?.code}.day`) }}</h5>
                </div>
              </div>
            </div>
        </div>
        <div class="main-container">
          <div class="card-container fit">
            <div class="card">
              <div class="svg-container">
                <h4>{{t('enums.flike')}}</h4>
                <img src="/weather-icons/animated/clear-day.svg"/>
                <h3 v-if="isCelsius">{{ new Intl.NumberFormat(i18next.language).format(weatherData?.current?.feelslike_c) }} °C</h3>
                <h3 v-else>{{ new Intl.NumberFormat(i18next.language).format(weatherData?.current?.feelslike_f)}} °F</h3>
              </div>
            </div>
            <div class="card">
              <div class="svg-container">
                <h4>UV</h4>
                <img src="/weather-icons/animated/clear-day.svg"/>
                <h3>{{ new Intl.NumberFormat(i18next.language).format(weatherData?.current?.uv) }}</h3>
              </div>
            </div>
            <div class="card">
              <div class="svg-container">
                <h4>{{t('enums.cloud')}}</h4>
                <img src="/weather-icons/animated/cloudy.svg"/>
                <h3>{{ weatherData?.current?.cloud }} %</h3>
              </div>
            </div>
            <div class="card">
              <div class="svg-container">
                <h4>{{t('enums.percip')}}</h4>
                <img src="/weather-icons/animated/rainy-3.svg"/>
                <h3 v-if="isCelsius">{{weatherData?.current?.precip_mm}} mm</h3>
                <h3 v-else>{{weatherData?.current?.precip_in}} in</h3>

              </div>
            </div>
            <div class="card">
              <div class="svg-container">
                <h4>{{t('enums.wind')}}</h4>
                <img src="/weather-icons/animated/wind.svg"/>
                <h3 v-if="isCelsius">{{weatherData?.current?.wind_kph }} km/h</h3>
                <h3 v-else>{{weatherData?.current?.wind_mph }} m/h</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-container">
        <div class="main-container half">
            <h2>{{ t('enums.favorite') }}</h2>
            <div class="card-container fit">
              <div class="card clickable" v-for="e in favorite" @click="(event)=>{event.stopPropagation(); selectFavorite(e)}">
                  <h4>{{e.name}}</h4>
              </div>
            </div>
        </div>
        <div class="main-container half">
          <h2>{{t('enums.cities-near',{city:weatherData?.location?.name || ''})}}</h2>
          <div class="card-container fit">
            <div class="card clickable" v-for="e in nearestCities" @click="(event)=>{event.stopPropagation(); selectOption(e)}">
              <h4>{{e.name}}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="cookies">
      <Cookie @close="(data)=>setCookie(data)"/>
    </div>
    <div v-if="Object.keys(serverError).length > 0">
      <Error :error="serverError"/>
    </div>
    <Footer/>
  </div>
</template>
