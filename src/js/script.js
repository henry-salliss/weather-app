import { KEY } from "./config";
import { API_URL } from "./config";
import { ICON } from "./config";
import { KELVIN_TO_CELSIUS } from "./config";
// Get html elements
const weatherContainer = document.querySelector(".data");
const input = document.querySelector("#searchInp");
const searchBtn = document.querySelector("#search");

// get current location
const getLocation = function () {
  navigator.geolocation.getCurrentPosition(function (position) {
    const { latitude, longitude } = position.coords;
    return latitude, longitude;
  });
};
getLocation();

// Make search work
searchBtn.addEventListener("click", function (e) {
  e.preventDefault();
  getWeather(input.value);
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") getWeather(input.value);
});
// Make load spinner
const renderSpinner = function () {
  const spinnerHTML = `
        <div class="spinner">
          <i class="fas fa-spinner"></i>
        </div>
  `;
  weatherContainer.innerHTML = "";
  weatherContainer.insertAdjacentHTML("afterbegin", spinnerHTML);
};

// Get date
const getDate = function (date) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const day = date.getDate();
  const month = date.getMonth();
  return `${day} / ${months[month]}`;
};

const weatherHTML = function (data) {
  console.log(data.coord);
  return `
      <div class='weatherData'>
        <p class="date">${getDate(new Date())}</p>
        <br>
        <i class='owf owf-${data.weather[0].id} owf-5x'></i>
        <br>
        <div class="main-details">
          <p class="temp">${KELVIN_TO_CELSIUS(data.main.temp).toFixed(1)}°C</p>
          <p class="desc">${data.weather[0].description}</p>
          <p class="city">${data.name}</p>
          <p class="country">${data.sys.country}</p>
        </div>
        <div class="more-detail">
          <p class="windSpeed"><i class="fas fa-wind"></i> ${data.wind.speed.toFixed(
            1
          )}mph</p>
          <p class="rain"> <i class="fas fa-umbrella"></i> 12%</p>
          <p class="sun"><i class="fas fa-sun"></i> 81%</p>
        </div>
      </div>
  `;
};

const getWeather = async function (location) {
  try {
    renderSpinner();
    // AJAX call

    const response = await fetch(`${API_URL}${location}&appid=${KEY}`);
    const data = await response.json();
    const html = weatherHTML(data);
    weatherContainer.innerHTML = "";
    weatherContainer.insertAdjacentHTML("afterbegin", html);
  } catch (err) {
    throw err;
  }
};
