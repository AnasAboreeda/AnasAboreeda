if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const Mustache = require('mustache');
const fs = require('fs');
const fetch = require('node-fetch');
const MUSTACHE_MAIN_DIR = './main.mustache';

/**
 * Calculate the difference in whole years since a given date.
 * It uses ~365.25 days/year to account (somewhat) for leap years.
 *
 * @param {string} since - A date string (e.g., '01/09/2004').
 * @returns {string} - Number of years (whole number) as a string.
 */
function getYearsDiff(since) {
  const now = new Date();
  const start = new Date(since);
  const diff = now.getTime() - start.getTime(); // milliseconds

  const years = diff / (1000 * 60 * 60 * 24 * 365.25);
  return years.toFixed(0); // No decimals, e.g., "19"
}

/**
 * Same as above, but stops accumulating years after a specified cutoff date.
 *
 * @param {string} since  - Start date (e.g., '01/01/2019').
 * @param {string} cutoff - Cutoff date (e.g., '04/01/2024').
 * @returns {string} - Number of years (whole number) as a string.
 */
function getYearsDiffWithCutoff(since, cutoff) {
  const start = new Date(since);
  const end = new Date(cutoff);
  const now = new Date();

  // If current date is past cutoff, freeze at cutoff; otherwise use now
  const actualEnd = now > end ? end : now;

  const diff = actualEnd.getTime() - start.getTime();
  const years = diff / (1000 * 60 * 60 * 24 * 365.25);

  return years.toFixed(0); // No decimals
}

let DATA = {
  name: 'Anas Aboreeda',
  date: new Date().toLocaleDateString('en-NL', {
    year: 'numeric',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'Europe/Amsterdam',
  }),
  // Example: unlimited accumulation
  total_exp: getYearsDiff('01/09/2004'),
  prof_exp: getYearsDiff('01/03/2014'),

  // Example: capping lead experience at a specific date
  lead_exp: getYearsDiffWithCutoff('01/01/2019', '04/01/2024'),
};

async function setWeatherInformation() {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=amsterdam&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`
    );
    if (!response.ok) {
      throw new Error(`Weather API responded with status: ${response.status}`);
    }
    const weatherData = await response.json();

    DATA.weatherData = weatherData;
    DATA.city_temperature = Math.round(weatherData.main.temp);
    DATA.temp_min = Math.round(weatherData.main.temp_min);
    DATA.temp_max = Math.round(weatherData.main.temp_max);
    DATA.feels_like = Math.round(weatherData.main.feels_like);
    DATA.humidity = Math.round(weatherData.main.humidity);

    const currentWeather = weatherData.weather[0];
    DATA.city_name = weatherData.name;
    DATA.city_weather = `${currentWeather.main} - ${currentWeather.description}`;
    DATA.city_weather_icon = currentWeather.icon;

    DATA.sun_rise = new Date(weatherData.sys.sunrise * 1000).toLocaleString('en-NL', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Amsterdam',
    });
    DATA.sun_set = new Date(weatherData.sys.sunset * 1000).toLocaleString('en-NL', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Amsterdam',
    });
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
  }
}

function generateReadMe() {
  fs.readFile(MUSTACHE_MAIN_DIR, 'utf-8', (err, template) => {
    if (err) throw err;
    const output = Mustache.render(template, DATA);
    fs.writeFileSync('README.md', output);
  });
}

async function action() {
  await setWeatherInformation();
  console.log('Data:', JSON.stringify(DATA, null, 2));
  generateReadMe();
}

action();
