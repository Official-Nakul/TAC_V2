/**
 * Weather Notification Utility - UPDATED VERSION
 * Fetches weather data from OpenWeatherMap API and formats it as notifications
 */

// OpenWeatherMap API configuration
const WEATHER_API_KEY =
  import.meta.env.VITE_WEATHER_API_KEY || "YOUR_API_KEY_HERE";
const WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5";

/**
 * Fetches current weather data for a specific location
 * @param {string} city - City name (e.g., "London")
 * @param {string} units - Units of measurement (metric, imperial, standard)
 * @returns {Promise<Object>} Weather data
 */
export const fetchCurrentWeather = async (
  city = "gandhinagar",
  units = "metric"
) => {
  try {
    const response = await fetch(
      `${WEATHER_API_BASE_URL}/weather?q=${city}&units=${units}&appid=${WEATHER_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    // Add the units to the response object for reference in formatting functions
    data.units = units;
    return data;
  } catch (error) {
    console.error("Failed to fetch current weather:", error);
    throw error;
  }
};

/**
 * Fetches hourly forecast for a specific location
 * @param {string} city - City name (e.g., "London")
 * @param {string} units - Units of measurement (metric, imperial, standard)
 * @returns {Promise<Object>} Forecast data
 */
export const fetchHourlyForecast = async (
  city = "London",
  units = "metric"
) => {
  try {
    const response = await fetch(
      `${WEATHER_API_BASE_URL}/forecast?q=${city}&units=${units}&appid=${WEATHER_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    // Add the units to the response object for reference in formatting functions
    data.units = units;
    return data;
  } catch (error) {
    console.error("Failed to fetch hourly forecast:", error);
    throw error;
  }
};

/**
 * Formats weather data as a notification object
 * @param {Object} weatherData - Weather data from API
 * @param {string} type - Notification type ("weather" or "forecast")
 * @returns {Object} Formatted notification
 */
export const formatWeatherNotification = (weatherData, type = "weather") => {
  if (!weatherData) return null;

  const isCurrentWeather = type === "weather";
  const temp = isCurrentWeather
    ? Math.round(weatherData.main.temp)
    : Math.round(weatherData.main.temp);
  const description = isCurrentWeather
    ? weatherData.weather[0].description
    : weatherData.weather[0].description;
  const icon = weatherData.weather[0].icon;
  const city = isCurrentWeather
    ? weatherData.name
    : weatherData.city?.name || "Unknown";

  const tempUnit = weatherData.units === "imperial" ? "°F" : "°C";

  return {
    id: Date.now(),
    title: isCurrentWeather
      ? `Current Weather in ${city}`
      : `Weather Update for ${city}`,
    description: `${
      description.charAt(0).toUpperCase() + description.slice(1)
    }. Temperature: ${temp}${tempUnit}`,
    timestamp: new Date().toLocaleTimeString(),
    read: false,
    type: "weather",
    icon: `https://openweathermap.org/img/wn/${icon}@2x.png`,
  };
};

/**
 * Creates a weather alert notification based on conditions
 * @param {Object} weatherData - Weather data from API
 * @returns {Object|null} Alert notification or null if no alert needed
 */
export const createWeatherAlert = (weatherData) => {
  if (!weatherData || !weatherData.main || !weatherData.weather) return null;

  // Check for extreme temperatures
  const temp = weatherData.main.temp;
  const tempUnit = weatherData.units === "imperial" ? "°F" : "°C";

  // Check for extreme weather conditions
  const weatherId = weatherData.weather[0].id;
  const city = weatherData.name || "your area";

  // Extreme weather conditions based on weather codes
  // https://openweathermap.org/weather-conditions
  if (weatherId >= 200 && weatherId < 300) {
    // Thunderstorm
    return createAlertNotification(
      `Thunderstorm Alert for ${city}`,
      `Thunderstorm conditions detected. Take necessary precautions.`,
      "weather-alert"
    );
  } else if (weatherId >= 500 && weatherId < 600 && weatherId >= 502) {
    // Heavy rain
    return createAlertNotification(
      `Heavy Rain Alert for ${city}`,
      `Heavy rain expected. Potential for flooding.`,
      "weather-alert"
    );
  } else if (weatherId >= 600 && weatherId < 700 && weatherId >= 602) {
    // Heavy snow
    return createAlertNotification(
      `Heavy Snow Alert for ${city}`,
      `Heavy snow expected. Travel may be difficult.`,
      "weather-alert"
    );
  } else if (weatherId >= 900 && weatherId < 903) {
    // Extreme conditions
    return createAlertNotification(
      `Extreme Weather Alert for ${city}`,
      `Extreme weather conditions detected. Stay safe.`,
      "weather-alert"
    );
  }

  // Temperature-based alerts
  if (temp > 35 && tempUnit === "°C") {
    return createAlertNotification(
      `Heat Alert for ${city}`,
      `Extreme heat detected. Current temperature: ${temp}${tempUnit}. Stay hydrated.`,
      "weather-alert"
    );
  } else if (temp < 0 && tempUnit === "°C") {
    return createAlertNotification(
      `Freezing Alert for ${city}`,
      `Freezing temperatures detected. Current temperature: ${temp}${tempUnit}. Bundle up.`,
      "weather-alert"
    );
  }

  return null;
};

/**
 * Helper function to create alert notifications
 */
const createAlertNotification = (title, description, type) => {
  return {
    id: Date.now(),
    title,
    description,
    timestamp: new Date().toLocaleTimeString(),
    read: false,
    type,
    priority: "high",
  };
};

/**
 * Sets up hourly weather notifications
 * @param {Function} addNotification - Function to add a notification to the state
 * @param {string} city - City to get weather for
 * @param {string} units - Units of measurement
 * @param {number} intervalMinutes - Minutes between notifications (default: 60)
 * @returns {Object} Object with start and stop functions
 */
export const setupHourlyWeatherNotifications = (
  addNotification,
  city = "London",
  units = "metric",
  intervalMinutes = 60
) => {
  let intervalId = null;

  const fetchAndNotify = async () => {
    try {
      // Validate city input
      if (!city || city.trim() === "") {
        throw new Error("Invalid city name");
      }

      // Fetch current weather
      const weatherData = await fetchCurrentWeather(city, units);

      // Create regular weather notification
      const notification = formatWeatherNotification(weatherData, "weather");
      if (notification) {
        addNotification(notification);
      }

      // Check for weather alerts
      const alertNotification = createWeatherAlert(weatherData);
      if (alertNotification) {
        addNotification(alertNotification);
      }
    } catch (error) {
      console.error("Error in weather notification system:", error);
      // Create error notification
      const errorNotification = {
        id: Date.now(),
        title: "Weather Service Error",
        description:
          error.message ||
          "Unable to fetch weather updates. Please try again later.",
        timestamp: new Date().toLocaleTimeString(),
        read: false,
        type: "system",
      };
      addNotification(errorNotification);
    }
  };

  return {
    start: () => {
      // Fetch immediately on start
      fetchAndNotify();

      // Convert minutes to milliseconds for interval
      const intervalMs = intervalMinutes * 60 * 1000;

      // Set up interval (default: 3600000 ms = 1 hour)
      intervalId = setInterval(fetchAndNotify, intervalMs);
      return intervalId;
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
};
