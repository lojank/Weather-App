import "./CurrentWeather.css";

function CurrentWeather(props: any) {
  // function that capitalizes a sentence 
  // used for capitalizing description of weather from OpenWeather API
  function capitalize(sentence: string): string {
    for (let i = 0; i < sentence.length; i++) {
      if (i === 0 || sentence[i - 1] === " ") {
        sentence =
          sentence.slice(0, i) +
          sentence[i].toUpperCase() +
          sentence.slice(i + 1);
      }
    }
    return sentence;
  }

  // displays current weather
  return (
    <div className="weather-main">
      <div className="weather-icon-div">
        <img
          className="weather-icon"
          src={`https://openweathermap.org/img/wn/${props.data.weather[0].icon}@2x.png`}
          alt="weather-icon"
        />
        <span className="weather-description">
          {capitalize(props.data.weather[0].description)}
        </span>
      </div>
      <div className="weather-main-temp-div">
        <span className="weather-main-temp">
          {props.convert_temp(props.data.main.temp)}°C
        </span>
      </div>
    </div>
  );
}

export default CurrentWeather;
