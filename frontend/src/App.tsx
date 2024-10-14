import { useEffect, useState } from "react";
import "./App.css";
import CurrentWeather from "./components/CurrentWeather";
import WeatherInfo from "./components/WeatherInfo";
import WeatherLocation from "./components/WeatherLocation";
import Error from "./components/Error";
import Sidebar from "./components/Sidebar"; // Import Sidebar

function App() {
  const [lat, setLat] = useState<number>();
  const [long, setLong] = useState<number>();
  const [forceLocationUpdate, setForceLocationUpdate] = useState<number>(0); // Force update

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

  const [data, setData] = useState<WeatherData | null>(null); // Start with null
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isNight, setIsNight] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<{ city: string; country: string }[]>([]);

  // Fetch the user's coordinates
  const getCurrentLocationWeather = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          setLat(position.coords.latitude);
          setLong(position.coords.longitude);
          setForceLocationUpdate((prev) => prev + 1); // Trigger location update
        },
        function (error) {
          setErrorMsg("Error getting location: " + error.message);
        }
      );
    } else {
      setErrorMsg("Geolocation API is not supported.");
    }
  };

  const searchWeather = (city: string, country: string) => {
    fetch(`http://127.0.0.1:5000/weather?city=${city}&country=${country}`)
      .then((res) => {
        if (!res.ok) {
          alert("Failed to fetch weather data");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setData(data);

          const newSearchEntry = { city, country };
          setRecentSearches((prev) => {
            const updatedSearches = prev.filter(
              (location) => location.city !== city || location.country !== country
            );
            updatedSearches.unshift(newSearchEntry);
            return updatedSearches.slice(0, 8);
          });
        }
      })
      .catch((error) => {
        alert("Error fetching weather data: " + error.message);
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    getCurrentLocationWeather();
    const currentHour = new Date().getHours();
    setIsNight(currentHour >= 20 || currentHour < 6);
  }, []);

  useEffect(() => {
    if (lat && long) {
      fetch(`http://127.0.0.1:5000/weather?lat=${lat}&lon=${long}`)
        .then((res) => {
          if (!res.ok) {
            alert("Failed to fetch weather data");
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data) {
            setData(data);
          }
        })
        .catch((error) => {
          alert("Error fetching weather data: " + error.message);
          console.error("Error fetching data:", error);
        });
    }
  }, [lat, long, forceLocationUpdate]); // Refetch whenever location changes or forceLocationUpdate triggers

  function kelvin_to_celsius(k: number): number {
    return Math.round(k - 273.15);
  }

  const weatherClassName = isNight ? "weather-body-night" : "weather-body";

  return (
    <div className="App">
      <Sidebar
        getCurrentLocationWeather={getCurrentLocationWeather}
        searchWeather={searchWeather}
        recentSearches={recentSearches}
        isNight={isNight}
      />

      {errorMsg !== "" || !data ? (
        <div className="weather-body">
          <Error data={data} errorMsg={errorMsg} />
        </div>
      ) : (
        <div className={weatherClassName}>
          <WeatherLocation data={data} />
          <CurrentWeather data={data} convert_temp={kelvin_to_celsius} />
          <WeatherInfo data={data} convert_temp={kelvin_to_celsius} />
        </div>
      )}
    </div>
  );
}

export default App;
