<script setup>
import {Chart, registerables} from "chart.js";
import {ref} from "vue";
import {BarChart, LineChart, } from 'vue-chart-3';
import { AnOutlinedCloseSquare } from '@kalimahapps/vue-icons';
import {useTranslation} from "i18next-vue";

const {t}=useTranslation("translation", {keyPrefix:"chart"})
const props = defineProps(["tempData", "isCelsius", "windData", "rainData", "snowData", "date"])
const chartRef = ref();
const options=ref({
  responsive: true,
  plugins: {
    legend: {
      display:false,
    },
    title: {
      display: true,
      text: props.isCelsius ? t('tempC'): t('tempF'),
      padding: {
        top: 10,
        bottom: 10
      },
      font: {
        size: 18,
      }
    },
  },
    scales:{
      x: {
        title:{
          display:true,
          text:t('t'),
        },
        ticks: {
          color: 'black',
        },
        grid: {
          color: 'rgba(0,0,0,0.25)',
        },
        border: {
          color: '#ff6600',
        }
      },
      y: {
        title:{
          display:true,
          text:props.isCelsius ? t('tempC'): t('tempF')
        },
        ticks: {
          color: 'black',
        },
        grid: {
          color: 'rgba(0,0,0,0.25)',
        },
        border: {
          color: '#3366ff',
        }
      }
    }
});

const windOptions=ref({
  responsive: true,
  plugins: {
    legend: {
      display:false,
    },
    title: {
      display: true,
      text: props.isCelsius ? t('wind-kph'): t('wind-mph'),
      padding: {
        top: 10,
        bottom: 10
      },
      font: {
        size: 18,
      }
    },
  },
    scales:{
      x: {
        title:{
          display:true,
          text:t('t'),
        },
        ticks: {
          color: 'black',
        },
        grid: {
          color: 'rgba(0,0,0,0.25)',
        },
        border: {
          color: '#ff6600',
        }
      },
      y: {
        title:{
          display:true,
          text:props.isCelsius ? t('wind-kph'): t('wind-mph'),
        },
        ticks: {
          color: 'black',
        },
        grid: {
          color: 'rgba(0,0,0,0.25)',
        },
        border: {
          color: '#3366ff',
        }
      }
    }
});
const rainOptions=ref({
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text:props.isCelsius ? t('rain-mm'): t('rain-in'),
      padding: {
        top: 10,
        bottom: 5
      },
      font: {
        size: 18,
      }
    },
  },
    scales:{
      x: {
        title:{
          display:true,
          text:t('t'),
        },
        ticks: {
          color: 'black',
        },
        grid: {
          color: 'rgba(0,0,0,0.25)',
        },
        border: {
          color: '#ff6600',
        }
      },
      y1: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: props.isCelsius ? t('rain-mm'): t('rain-in'),
        }
      },
      y2: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: t('chance')
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
});
const snowOptions=ref({
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: t('snow-mm'),
      padding: {
        top: 10,
        bottom: 5
      },
      font: {
        size: 18,
      }
    },
  },
    scales:{
      x: {
        title:{
          display:true,
          text:t('t'),
        },
        ticks: {
          color: 'black',
        },
        grid: {
          color: 'rgba(0,0,0,0.25)',
        },
        border: {
          color: '#ff6600',
        }
      },
      y1: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: t('snow-mm')
        }
      },
      y2: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: t('chance')
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
});


const config = {
  type: 'line',
  data: props.data,
};
Chart.register(...registerables);
</script>

<template>
  <div class="popup" @click="$emit('closeModal')">
    <div class="popup-content" @click="(e)=>e.stopPropagation()">
      <div class="popup-header">
        <h1>{{ t('forecast') }}: {{ props.date }}</h1>
        <AnOutlinedCloseSquare class="small-icon red" @click="$emit('closeModal')"/>
      </div>
      <div class="charts">
        <div class="chart">
          <LineChart :chart-data="props.tempData" :options="options" width="550"/>
        </div>
        <div class="chart">
          <LineChart :chart-data="props.windData" :options="windOptions" width="550"/>
        </div>
        <div class="chart">
          <LineChart :chart-data="props.rainData" :options="rainOptions" width="550"/>
        </div>
        <div class="chart">
          <LineChart :chart-data="props.snowData" :options="snowOptions" width="550"/>
        </div>

      </div>
    </div>
  </div>

</template>