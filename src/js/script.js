import { KEY } from "./config";
import { API_URL } from "./config";
import { GEO_API_URL } from "./config";
import { KELVIN_TO_CELSIUS } from "./config";
import { KELVIN_TO_FAHRENHEIT } from "./config";
// Get html elements
const container = document.querySelector(".container");
const inputContainer = document.querySelector(".user-input");
const weatherContainer = document.querySelector(".data");
const input = document.querySelector("#searchInp");
const searchBtn = document.querySelector("#search");
const showFavs = document.querySelector("#render");
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
const weatherHTML = function (data, fav) {
  let local = JSON.parse(localStorage.getItem("favourites"));
  // if (window.localStorage.favourites.length === 0) local = "";
  if (local === null) local = "";
  allShownData.push(data.name.toLowerCase());
  const html = `
    <section class='weatherData'>
      <div class='weatherHeader'>
      <p class="location">${data.name}, ${data.sys.country}</p>
      <p class='actions'><i class="fas fa-star star ${
        local.includes(data.name) ? "favourited" : " "
      }"></i><i class="far fa-window-close delete"></i></p>
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
  // html.scrollIntoView({ behaviour: 'smooth' });
  return html;
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
const allShownData = [];

const checkExists = function (input) {
  let exists;
  if (allShownData.includes(input)) {
    exists = true;
  } else {
    exists = false;
  }
  return exists ? renderError("Weather already displayed") : getWeather(input);
};
// Make search work
searchBtn.addEventListener("click", function (e) {
  e.preventDefault();
  // check if search exists
  checkExists(input.value);
  input.value = "";
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    checkExists(input.value);
    input.value = "";
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

// load data from requested location

const getWeather = async function (location, placement) {
  try {
    renderSpinner();
    // AJAX call
    const spinner = document.querySelector(".spinner");
    const response = await fetch(`${API_URL}${location}&appid=${KEY}`);
    const data = await response.json();
    spinner.style.display = "none";

    // add to page
    const html = weatherHTML(data);
    weatherContainer.insertAdjacentHTML("beforeend", html);

    // add smooth scrolling
    const newItem = Array.from(weatherContainer.children).slice(-1);
    newItem[0].scrollIntoView({ behaviour: "smooth" });
  } catch (err) {
    renderError("Please make valid search");
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

const renderError = function (msg) {
  const html = `
    <div class="error-container">
    <p class = 'errMessage'>
    <i class="fas fa-exclamation-circle"></i>
    <i class="fas fa-times delErr"></i>     
    </p>
    
    <p class="err-message">${msg}</p>
    </div>
    `;

  weatherContainer.classList.add("overlay");
  inputContainer.classList.add("overlay");
  weatherContainer.insertAdjacentHTML("beforebegin", html);
};

// Make delete button work on containers
weatherContainer.addEventListener("click", function (e) {
  if (!e.target.classList.contains("delete")) return;
  const container = e.target.closest("section");

  // remove from allShownData array
  const current = container.children[0].children[0].textContent
    .split(",")[0]
    .toLowerCase();
  const index = allShownData.indexOf(current);
  allShownData.splice(index, 1);

  // hide
  container.classList.add("hide");
  setTimeout(() => {
    container.remove();
  }, 500);
});

// Make delete button work on error message
const remove = (item) => {
  item.remove();
  weatherContainer.classList.remove("overlay");
  inputContainer.classList.remove("overlay");
};

container.addEventListener("click", function (e) {
  if (e.target.classList.contains("delErr")) {
    const errContainer = e.target.closest("div");
    remove(errContainer);
  }
  if (!e.target.closest("div").classList.contains("error-container")) {
    const errCont = document.querySelector(".error-container");
    if (errCont === null) return;
    remove(errCont);
  }
});

// favourites

let favourites = [];

weatherContainer.addEventListener("click", function (e) {
  if (!e.target.classList.contains("star")) return;
  if (!e.target.classList.contains("favourited")) {
    e.target.classList.add("favourited");
    favourites = JSON.parse(localStorage.getItem("favourites"));
    const favouritedItem = e.target.closest("div");
    const favItemName = Array.from(
      favouritedItem.children
    )[0].textContent.split(",")[0];
    if (favourites.includes(favItemName)) return;
    favourites.push(favItemName);
    console.log(favourites);
    localStorage.setItem("favourites", JSON.stringify(favourites));
    // save to local storage
    // const favouritesArr = JSON.parse(localStorage.getItem("favourites"));
    // console.log(favouritesArr);
    // if (favouritesArr === null) {
    //   const bothArr = favourites.concat(favouritesArr);
    //   const index = bothArr.lastIndexOf(favItemName);
    //   bothArr.splice(index, 1);
    //   console.log("hello");
    //   if (bothArr.includes(favItemName)) return;
    //   localStorage.setItem("favourites", JSON.stringify(bothArr));
    // } else {
    //   localStorage.setItem("favourites", JSON.stringify(favourites));
    // }
  } else if (e.target.classList.contains("favourited")) {
    e.target.classList.remove("favourited");
    const favouritesArr = JSON.parse(localStorage.getItem("favourites"));
    console.log(favouritesArr);
    const name = Array.from(
      e.target.closest("div").children
    )[0].textContent.split(",")[0];

    const index = favouritesArr.indexOf(name);
    console.log(index);
    favouritesArr.splice(index, 1);
    favourites.splice(index, 1);
    console.log(favouritesArr);
    localStorage.setItem("favourites", JSON.stringify(favouritesArr));
  }
});

// load fav data on click
showFavs.addEventListener("click", function (e) {
  const favsFromStorage = JSON.parse(localStorage.getItem("favourites"));
  favourites = favsFromStorage;
  console.log(favourites);
  if (favsFromStorage === null || favourites.length === 0) {
    const html = `
        <div class="error-container-one">
        <p class = 'errMessage'>
        <i class="fas fa-exclamation-circle"></i>
        <i class="fas fa-times delErr"></i>     
        </p>
        <p class="err-message">No favourites saved</p>
    </div>
        `;
    weatherContainer.insertAdjacentHTML("beforebegin", html);
    weatherContainer.classList.add("overlay");
    inputContainer.classList.add("overlay");
  }
  if (favsFromStorage === null) return;
  favsFromStorage.forEach((favourite) => {
    checkExists(favourite);
    allShownData.push(favourite);
  });
});
