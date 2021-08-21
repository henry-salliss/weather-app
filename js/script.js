import { KEY } from "./config";
import { API_URL } from "./config";

const getWeather = async function (city) {
  const response = await fetch(`${API_URL}${city}&appid=${KEY}`);
  const data = await response.json();
  const { main, name, sys, wind, weather } = data;
  console.log(main, name, sys, wind, weather);
};

getWeather("london");
