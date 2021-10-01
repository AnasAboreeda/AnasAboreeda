if (process.env.Environment !== "!prod") {
  require("dotenv").config();
}

const Mustache = require("mustache");
const fs = require("fs");
const fetch = require("node-fetch");
const MUSTACHE_MAIN_DIR = "./main.mustache";

let DATA = {
  name: "Anas Aboureada",
  date: new Date().toLocaleDateString("en-NL", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
    timeZone: "Europe/Amsterdam",
  }),
};

function generateReadMe() {
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync("README.md", output);
  });
}
async function setWeatherInformation() {
  await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=amsterdam&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`
  )
    .then((weather) => weather.json())
    .then((weatherData) => {
      console.log(`weather data`, weatherData);

      DATA.city_temperature = Math.round(weatherData.main.temp);
      DATA.temp_min = Math.round(weatherData.main.temp_min);
      DATA.temp_max = Math.round(weatherData.main.temp_max);
      DATA.feels_like = Math.round(weatherData.main.feels_like);
      DATA.humidity = Math.round(weatherData.main.humidity);

      const currentWeather = weatherData.weather[0];

      DATA.city_name = weatherData.name;
      DATA.city_weather = currentWeather.description;
      DATA.city_weather_icon = currentWeather.icon;

      DATA.sun_rise = new Date(weatherData.sys.sunrise * 1000).toLocaleString("en-NL", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Amsterdam",
      });
      DATA.sun_set = new Date(weatherData.sys.sunset * 1000).toLocaleString("en-NL", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Amsterdam",
      });
    });
}

async function action() {
  /**
   * Fetch Weather
   */
  await setWeatherInformation();

  /**
   * Generate README
   */
  await generateReadMe();
}

action();
