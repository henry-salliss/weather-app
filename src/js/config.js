export const KEY = "b8922c8869fac17d45f1eb3a542ef3a1";
export const API_URL = "http://api.openweathermap.org/data/2.5/weather?q=";
export const ICON = "https://openweathermap.org/img/wn/";
export const KELVIN_TO_CELSIUS = function (temp) {
  const celcius = temp - 273.15;
  return celcius;
};