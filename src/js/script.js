import { KEY } from "./config";
import { API_URL } from "./config";
import { GEO_API_URL } from "./config";
import { KELVIN_TO_CELSIUS } from "./config";
import { KELVIN_TO_FAHRENHEIT } from "./config";
// Get html elements
const weatherContainer = document.querySelector(".data");
const input = document.querySelector("#searchInp");
const searchBtn = document.querySelector("#search");
// create html and get date

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

// create html
const weatherHTML = function (data) {
  return `
      <section class='weatherData'>
      <div class='weatherHeader'>
      <p class="location">${data.name}, ${data.sys.country}</p>
      <p class='actions'><i class="fas fa-star star"></i><i class="far fa-window-close delete"></i></p>
      </div>
        
        <br>
        <i class='owf owf-${data.weather[0].id} owf-5x'></i>
        <br>
        <div class="main-details">
        <p class="date">${getDate(new Date())}</p>
          <p class="temp">${KELVIN_TO_CELSIUS(data.main.temp).toFixed(
            1
          )}°C or ${KELVIN_TO_FAHRENHEIT(data.main.temp).toFixed(1)}°F</p>
          <p class="desc">${data.weather[0].description}</p>
        </div>
        <div class="more-detail">
          <p class="windSpeed"><i class="fas fa-wind"></i> ${data.wind.speed.toFixed(
            1
          )}mph</p>
          <p class="sunrise">
          <i class="fas fa-sun"></i>
          ${convertFromUnix(data.sys.sunrise)}am
        </p>
          <p class="sunset"><i class="fas fa-moon"></i> ${convertFromUnix(
            data.sys.sunset
          )}pm</p>
        </div>
      </section>
  `;
};

// get current location

const getLocation = async function () {
  navigator.geolocation.getCurrentPosition(function (position) {
    const { latitude, longitude } = position.coords;

    geolocationData(latitude, longitude);
  });
};

getLocation();

// get local weather first

const geolocationData = async function (lat, lng) {
  try {
    renderSpinner();
    const response = await fetch(
      `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${KEY}`
    );
    const data = await response.json();
    const html = weatherHTML(data);
    weatherContainer.innerHTML = "";
    weatherContainer.insertAdjacentHTML("afterbegin", html);
  } catch (err) {
    throw err;
  }
};

// Make search work

searchBtn.addEventListener("click", function (e) {
  e.preventDefault();
  getWeather(input.value);
  saveToFavourites(input.value);
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    getWeather(input.value);
    saveToFavourites(input.value);
  }
});

// Make load spinner

const renderSpinner = function () {
  const spinnerHTML = `
        <div class="spinner">
          <i class="fas fa-spinner"></i>
        </div>
  `;
  // weatherContainer.innerHTML = "";
  weatherContainer.insertAdjacentHTML("afterbegin", spinnerHTML);
};
const favourites = [];

// save to local storage

const saveToFavourites = async function (location) {
  try {
    // current
    const current = {
      location: "",
      icon: "",
      temperature: "",
      description: "",
      windSpeed: "",
      sunrise: "",
      sunset: "",
      favourite: "",
    };
    const response = await fetch(`${API_URL}${location}&appid=${KEY}`);
    const data = await response.json();
    // store in current object
    current.location = data.name + "," + data.sys.country;
    current.icon = data.weather[0].id;
    current.temperature =
      KELVIN_TO_CELSIUS(data.main.temp).toFixed(1) +
      " or " +
      KELVIN_TO_FAHRENHEIT(data.main.temp).toFixed(1);
    current.description = data.weather[0].description;
    current.windSpeed = data.wind.speed.toFixed(1);
    current.sunrise = convertFromUnix(data.sys.sunrise);
    current.sunset = convertFromUnix(data.sys.sunset);
    console.log(current);
    favourites.push(current);
    console.log(favourites);

    // make favourite button work
    weatherContainer.addEventListener("click", function (e) {
      if (!e.target.classList.contains("star")) return;
      current.favourite = true;
      console.log(favourites);
      localStorage.setItem("favourites", JSON.stringify(favourites));
    });
  } catch (err) {
    throw err;
  }
};

// load data from requested location

const getWeather = async function (location) {
  try {
    renderSpinner();
    // AJAX call
    const spinner = document.querySelector(".spinner");
    const response = await fetch(`${API_URL}${location}&appid=${KEY}`);
    const data = await response.json();

    // add to page
    const html = weatherHTML(data);
    // weatherContainer.innerHTML = "";
    spinner.style.display = "none";
    weatherContainer.insertAdjacentHTML("afterbegin", html);
  } catch (err) {
    setTimeout(() => {
      renderError();
    }, 2000);

    throw err;
  }
};

const convertFromUnix = function (unix) {
  const newTime = new Date(unix * 1000);
  const newHours = newTime.getHours();
  let newMinutes = newTime.getMinutes();
  newMinutes < 10 ? (newMinutes = "0" + newMinutes) : newMinutes;

  return newHours + ":" + newMinutes;
};

const renderError = function () {
  const html = `
      <div class="error-container">
        <i class="fas fa-exclamation-circle"></i>
        <p class="err-message">Error: Please make valid search.</p>
      </div>
  `;

  weatherContainer.innerHTML = "";
  weatherContainer.insertAdjacentHTML("beforebegin", html);
};

// Make delete button work
weatherContainer.addEventListener("click", function (e) {
  console.log(e.target);
  if (!e.target.classList.contains("delete")) return;
  const container = e.target.closest("section");
  container.classList.add("hide");
});
