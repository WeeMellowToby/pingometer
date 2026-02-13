import { save, state } from "../utils/state.js";
var apikey = "";

async function getAPIkey() {
    const response = await fetch(window.location.href + "weatherKey");
    const data = await response.json();
    apikey = data.key;
    getWeather(state.weatherID);
}
function SetWeatherStation() {
    const weatherInput = document.getElementById("weatherStation").value.trim();
    state.weatherID = weatherInput;
    save();
    getWeather(state.weatherID);
}
async function getWeather(stationID) {
    if (apikey == "" || stationID == null) {
        return;
    }
    let url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationID}&format=json&units=m&apiKey=${apikey}`;
    let response = await fetch(url);
    let data = await response.json();
    let weather = data.observations[0].metric;
    const weatherDiv = document.getElementById("weather");
    weatherDiv.innerHTML = `Temperature: ${weather.temp}C Wind Speeds: ${weather.windSpeed}km/h Wind Gusts: ${weather.windGust}km/h`;
}
getAPIkey();
const interval = setInterval(() => {
    getWeather(state.weatherID);
}, 60000);
window.SetWeatherStation = SetWeatherStation;