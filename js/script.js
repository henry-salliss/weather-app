console.log("works");
import { KEY } from "./config";
import { API_URL } from "./config";

const getWeather = async function () {
  const response = await fetch(`${API_URL}${KEY}`);
  console.log(response);
  console.log("hello");
};

getWeather();
