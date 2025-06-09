import axios from "axios";
import API_KEY from "./key.js";
import Helper from "./Helper.js";
export class ServiceClient{
    static getCurrentWeather(searchValue){
        return axios.get(`http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${searchValue}`).then((response)=>{
            return response.data
        })
    }
    static getForecast(searchValue){
        return axios.get(`http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${searchValue}&days=3`).then((response)=>{
            return response.data
        })
    }
    static getWeatherByIP(){
        return axios.get(`http://api.weatherapi.com/v1/ip.json?key=${API_KEY}&q=auto:ip`).then((response)=>{
            return this.getForecast([Helper.removeAccents(response?.data?.city), response?.data?.country_code]);
        })
    }
    static getSearchAPI(searchValue){
        return axios.get(`http://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${searchValue}`).then((response)=>{
            return response.data;
        })
    }
    static getTranslateSearch(searchValue){
        return axios.get(`https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=en&q=${searchValue}`).then((response)=>{
            return response.data[0];
        }).catch (()=>{
            return [searchValue];
        });
    }

}
export default ServiceClient
