import { useEffect, useState } from "react";
import "./App.css";
import CurrentWeather from "./components/CurrentWeather";
import WeatherInfo from "./components/WeatherInfo";
import WeatherLocation from "./components/WeatherLocation";
import Error from "./components/Error";
import Sidebar from "./components/Sidebar";

function App() {
  const [lat, setLat] = useState<number>();
  const [long, setLong] = useState<number>();
  const [forceLocationUpdate, setForceLocationUpdate] = useState<number>(0);

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

  const [data, setData] = useState<WeatherData | null>(null);
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
          setForceLocationUpdate((prev) => prev + 1);
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
    const user_uuid = localStorage.getItem("user_uuid");
  
    fetch(`http://127.0.0.1:5000/weather?city=${city}&country=${country}&user_uuid=${user_uuid}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setErrorMsg(data.error); 
          setData(null);
        } else {
          setData(data);
          setErrorMsg("");  
          setRecentSearches((prev) => {
            const newSearchEntry = { city, country };
            const updatedSearches = prev.filter(
              (location) => location.city !== city || location.country !== country
            );
            updatedSearches.unshift(newSearchEntry);
            return updatedSearches.slice(-8);
          });
        }
      })
      .catch((error) => {
        setErrorMsg("Error fetching weather: " + error.message); 
        console.error("Error fetching weather:", error);
      });
  };

  const getSearchHistory = () => {
    const user_uuid = localStorage.getItem("user_uuid");

    fetch(`http://127.0.0.1:5000/search-history?user_uuid=${user_uuid}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setRecentSearches(data.searches);
      })
      .catch((error) => {
        console.error("Error fetching search history:", error);
      });
  };

  const getUUID = () => {
    const storedUUID = localStorage.getItem("user_uuid");
    if (!storedUUID) {
      fetch("http://127.0.0.1:5000/get-uuid", {
        method: "GET",
      })
        .then((res) => res.json())
        .then((data) => {
          localStorage.setItem("user_uuid", data.uuid);
        })
        .catch((error) => {
          console.error("Error getting UUID:", error);
        });
    }
  };

  useEffect(() => {
    getUUID(); 
    getSearchHistory();
    getCurrentLocationWeather();
    
    const currentHour = new Date().getHours();
    setIsNight(currentHour >= 20 || currentHour < 6);
  }, []);

  useEffect(() => {
    if (lat && long) {
      const user_uuid = localStorage.getItem("user_uuid");
  
      fetch(`http://127.0.0.1:5000/weather?lat=${lat}&lon=${long}&user_uuid=${user_uuid}`, {
        method: "GET",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setErrorMsg(data.error); 
            setData(null);
          } else {
            setData(data);
            setErrorMsg(""); 
          }
        })
        .catch((error) => {
          setErrorMsg("Error fetching weather data: " + error.message); 
          console.error("Error fetching data:", error);
        });
    }
  }, [lat, long, forceLocationUpdate]);

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
        setRecentSearches={setRecentSearches}
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
