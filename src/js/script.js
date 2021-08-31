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
  // if (data.name === undefined) renderError('invalid')
  allShownData.push(data.name.toLowerCase());
  const html = `
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
    console.log(e);
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

const getWeather = async function (location) {
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
    const newItem = Array.from(weatherContainer.children).slice(-1);
    newItem[0].scrollIntoView({ behaviour: "smooth" });
    // console.log(newItem[0]);
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

  // weatherContainer.innerHTML = "";
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
  if (
    !e.target.classList.contains("delErr") ||
    e.target.closest("div" === container)
  )
    return;
  if (e.target.classList.contains("delErr")) {
    const errContainer = e.target.closest("div");
    remove(errContainer);
  }
  if (e.target.closest("div") === container) {
    const err = e.target.children[1];
    remove(err);
  }
});

// save to local storage

// const favourites = [];

// const saveToFavourites = async function (location) {
//   try {
//     // current
//     const current = {
//       location: "",
//       icon: "",
//       temperature: "",
//       description: "",
//       windSpeed: "",
//       sunrise: "",
//       sunset: "",
//       favourite: "",
//     };
//     const response = await fetch(`${API_URL}${location}&appid=${KEY}`);
//     const data = await response.json();
//     // store in current object
//     current.location = data.name + "," + data.sys.country;
//     current.icon = data.weather[0].id;
//     current.temperature =
//       KELVIN_TO_CELSIUS(data.main.temp).toFixed(1) +
//       " or " +
//       KELVIN_TO_FAHRENHEIT(data.main.temp).toFixed(1);
//     current.description = data.weather[0].description;
//     current.windSpeed = data.wind.speed.toFixed(1);
//     current.sunrise = convertFromUnix(data.sys.sunrise);
//     current.sunset = convertFromUnix(data.sys.sunset);

//     // make favourite button work
//     weatherContainer.addEventListener("click", function (e) {
//       if (!e.target.classList.contains("star")) return;
//       current.favourite = true;
//       console.log(current.location);
//       localStorage.setItem("favourites", JSON.stringify(favourites));
//     });
//   } catch (err) {
//     throw err;
//   }
// };
