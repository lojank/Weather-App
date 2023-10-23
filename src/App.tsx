import { useEffect, useState } from "react";
import "./App.css";
import CurrentWeather from "./components/CurrentWeather";
import WeatherInfo from "./components/WeatherInfo";
import WeatherLocation from "./components/WeatherLocation";
import Error from "./components/Error";

function App() {
  // Define your API key from OpenWeatherMap API
  const YOUR_API_KEY = "";

  // Define state variables for latitude and longitude
  const [lat, setLat] = useState<number>();
  const [long, setLong] = useState<number>();

  // Define the structure of the weather data using an interface
  interface WeatherData {
    name: string;
    sys: {
      country: string;
    };
    wind: {
      speed: number;
    };
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
    };
    weather: {
      description: string;
      icon: string;
    }[];
  }

  // Initialize state for weather data and error messages
  const [data, setData] = useState<WeatherData>({
    name: "",
    sys: {
      country: "",
    },
    wind: {
      speed: 0,
    },
    main: {
      temp: 0,
      feels_like: 0,
      temp_min: 0,
      temp_max: 0,
    },
    weather: [
      {
        description: "",
        icon: "",
      },
    ],
  });

  const [errorMsg, setErrorMsg] = useState<string>("");

  // fetch the user's coordinates
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          setLat(position.coords.latitude);
          setLong(position.coords.longitude);
        },
        function (error) {
          if (error.code === error.PERMISSION_DENIED) {
            setErrorMsg("Please turn on location settings");
          } else {
            setErrorMsg("Error getting location: " + error.message);
          }
        }
      );
    } else {
      setErrorMsg(
        "Geolocation API is not supported. Please try another browser"
      );
    }
  }, []);

  // Use another useEffect to fetch weather data based on latitude and longitude
  useEffect(() => {
    if (lat && long) {
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${YOUR_API_KEY}`
      )
        .then((res) => res.json())
        .then((data) => {
          setData(data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [lat, long]);

  // Function to convert temperature from Kelvin to Celsius
  function kelvin_to_celsius(k: number): number {
    return Math.round(k - 273.15);
  }

  // Render different components based on error messages and weather data
  return errorMsg !== "" || data.name === "" ? (
    <div className="weather-body">
      <Error data={data} errorMsg={errorMsg} />
    </div>
  ) : (
    <div className="weather-body">
      <WeatherLocation data={data} />
      <CurrentWeather data={data} convert_temp={kelvin_to_celsius} />
      <WeatherInfo data={data} convert_temp={kelvin_to_celsius} />
    </div>
  );
}

export default App;
