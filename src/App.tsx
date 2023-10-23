import { useEffect, useState } from "react";
import "./App.css";
import CurrentWeather from "./components/CurrentWeather";
import WeatherInfo from "./components/WeatherInfo";
import WeatherLocation from "./components/WeatherLocation";
import Error from "./components/Error";

function App() {
  const [lat, setLat] = useState<number>();
  const [long, setLong] = useState<number>();

  interface WeatherData {
    name: string;
    cod: number;
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

  const [data, setData] = useState<WeatherData>({
    name: "",
    cod: 0,
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

  const [errorMsg, setErrorMsg] = useState("");

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

  useEffect(() => {
    if (lat && long) {
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=3289764f272a524f9cf22f194959aa13`
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

  function kelvin_to_celcius(k: number): number {
    return Math.round(k - 273.15);
  }

  return errorMsg !== "" || data.name === "" ? (
    <div className="weather-body">
      <Error data={data} errorMsg={errorMsg} />
    </div>
  ) : (
    <div className="weather-body">
      <WeatherLocation data={data} />
      <CurrentWeather data={data} convert_temp={kelvin_to_celcius} />
      <WeatherInfo data={data} convert_temp={kelvin_to_celcius} />
    </div>
  );
}

export default App;
