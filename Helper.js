import i18next, {t} from "i18next";
import {countryToAlpha2} from "country-to-iso";

class Helper{
    static removeAccents(str) {
        if (typeof str !== 'string') return '';

        return str.replace(/[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g, match => {
            const map = {
                'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ö': 'o', 'ő': 'o',
                'ú': 'u', 'ü': 'u', 'ű': 'u',
                'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ö': 'O', 'Ő': 'O',
                'Ú': 'U', 'Ü': 'U', 'Ű': 'U'
            };
            return map[match] || match;
        });
    }
    static formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }
    static countryNameTranslate(query){
        if(query){
            let countryName=new Intl.DisplayNames([i18next.language], { type: "region" });
            let convertISO=countryToAlpha2(`${query.location.country}`);
            if(convertISO){
                return countryName.of(convertISO.toString());
            }else{
                return  t('enums.unknown');
            }
        }
    }
    static getCountryNameFromISO(ISO){
        if(ISO){
            let countryName=new Intl.DisplayNames([i18next.language], { type: "region" });
            return  countryName.of(ISO).toString();
        }
        return '';
    }
    static isPointInBounds(point, bounds) {
        const [sw, ne] = bounds;

        return (
            point.latitude >= sw.latitude &&
            point.latitude <= ne.latitude &&
            point.longitude >= sw.longitude &&
            point.longitude <= ne.longitude
        );
    }
    static convertTime12to24 = (time12h) => {
        const [time, modifier] = time12h.split(' ');

        let [hours, minutes] = time.split(':');

        if (hours === '12') {
            hours = '00';
        }

        if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }

        return `${hours}:${minutes}`;
    }
    static checkToday(date){
        let today =new Date();
        return this.formatDate(today) === date;
    }
    static getUserLanguage(){
        return i18next?.language?.slice(0, 2);
    }

    static similarity(s1, s2) {
        let longer = s1;
        let shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        const longerLength = longer.length;
        if (longerLength === 0) {
            return 1.0;
        }
        return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength);
    }

    static editDistance(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        const costs = [];
        for (var i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0)
                    costs[j] = j;
                else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue),
                                costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0)
                costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }
}

export default Helper;