import {t} from "i18next";

class ChartHelper{
    static windData(hour, isCelsius){
        if(hour.length){
            let finalLocalTime=[];
            let getWind=[];

            hour.map(e=>{
                finalLocalTime.push(e.time.split(" ")[1]);
                getWind.push(isCelsius ? e.wind_kph : e.wind.mph);
            })

            return {
                labels: finalLocalTime,
                datasets: [{
                    data: getWind,
                    fill: true,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    pointBackgroundColor: 'rgb(11,30,30)',
                    showLine: true,
                }],
            };
        }
        return [];
    }
    static rainData(hour, isCelsius){
        if(hour.length){
            let finalLocalTime=[];
            let getRain=[];
            let getChance=[];

            hour.map(e=>{
                finalLocalTime.push(e.time.split(" ")[1]);
                getRain.push(isCelsius ? e.precip_mm : e.precip_in);
                getChance.push(e.chance_of_rain);
            })

            return {
                labels: finalLocalTime,
                datasets: [
                    {
                        data: getRain,
                        type: "bar",
                        fill: true,
                        tension: 0.1,
                        pointBackgroundColor: 'rgb(11,30,30)',
                        showLine: true,
                        label: isCelsius ? t('chart.rain-mm') : t('chart.rain-in'),
                        yAxisID: 'y1',
                        borderWidth: 1,
                        backgroundColor: 'rgb(75, 192, 192)'
                    },
                    {
                        data: getChance,
                        type: "line",
                        fill: false,
                        borderColor: 'rgb(239,95,194)',
                        tension: 0.5,
                        pointBackgroundColor: 'rgb(11,30,30)',
                        showLine: true,
                        label: t('chart.chance'),
                        yAxisID: 'y2'
                    },

                ],
            };
        }
        return [];
    }
    static snowData(hour){
        if(hour.length){
            let finalLocalTime=[];
            let getSnow=[];
            let getChance=[];

            hour.map(e=>{
                finalLocalTime.push(e.time.split(" ")[1]);
                getSnow.push(e.snow_cm);
                getChance.push(e.chance_of_snow);
            })

            return {
                labels: finalLocalTime,
                datasets: [
                    {
                        data: getSnow,
                        type: "bar",
                        fill: true,
                        tension: 0.1,
                        pointBackgroundColor: 'rgb(11,30,30)',
                        showLine: true,
                        label: t('chart.snow-mm'),
                        yAxisID: 'y1',
                        borderWidth: 1,
                        backgroundColor: 'rgb(75, 192, 192)'
                    },
                    {
                        data: getChance,
                        type: "line",
                        fill: false,
                        borderColor: 'rgb(239,95,194)',
                        tension: 0.5,
                        pointBackgroundColor: 'rgb(11,30,30)',
                        showLine: true,
                        label: t('chart.chance'),
                        yAxisID: 'y2'
                    },
                ],
            };
        }
        return [];
    }

}

export default ChartHelper