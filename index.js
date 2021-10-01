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
  console.log(process.env);
  await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=amsterdam&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`
  )
    .then((r) => r.json())
    .then((r) => {
      console.log(`r`, r);
      DATA.city_temperature = Math.round(r.main.temp);
      DATA.city_weather = r.weather[0].description;
      DATA.city_weather_icon = r.weather[0].icon;
      DATA.sun_rise = new Date(r.sys.sunrise * 1000).toLocaleString("en-NL", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Amsterdam",
      });
      DATA.sun_set = new Date(r.sys.sunset * 1000).toLocaleString("en-NL", {
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
