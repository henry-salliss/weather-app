import { KEY } from "./config";
import { API_URL } from "./config";
import { ICON } from "./config";
import { KELVIN_TO_CELSIUS } from "./config";
console.log("works");
// Get html elements
const weatherContainer = document.querySelector(".data");

const weatherHTML = function (data) {
  const src = "http://openweathermap.org/img/wn/01d.png";
  return `
        <span class="date">8th April</span>

        <i class='owf owf-${data.weather[0].id} owf-10x'></i>

        <div class="main-details">
          <span class="temp">${KELVIN_TO_CELSIUS(data.main.temp).toFixed(
            1
          )}</span>
          <span class="desc">${data.weather[0].description}</span>
          <span class="city">${data.name}</span>
          <span class="country">${data.sys.country}</span>
        </div>
        <div class="more-detail">
          <span class="windSpeed"><i class="fas fa-wind"></i> ${data.wind.speed.toFixed(
            1
          )}</span>
          <span class="rain"> <i class="fas fa-umbrella"></i> 12%</span>
          <span class="sun"><i class="fas fa-sun"></i> 81%</span>
        </div>
  `;
};

const getWeather = async function (location) {
  try {
    // AJAX call
    const response = await fetch(`${API_URL}${location}&appid=${KEY}`);
    const data = await response.json();
    const html = weatherHTML(data);
    weatherContainer.insertAdjacentHTML("afterbegin", html);
  } catch (err) {
    throw err;
  }
};

getWeather("madrid");
