import "./WeatherInfo.css";

// displays additional weather information
function WeatherInfo(props: any) {
  return (
    <div className="info-main-div">
      <div className="info-div">
        <span className="info">Feels like</span>
        <span className="info">
          {props.convert_temp(props.data.main.feels_like)}°C
        </span>
      </div>
      <div className="info-div">
        <span className="info">High</span>
        <span className="info">
          {props.convert_temp(props.data.main.temp_max)}°C
        </span>
      </div>
      <div className="info-div">
        <span className="info">Low</span>
        <span className="info">
          {props.convert_temp(props.data.main.temp_min)}°C
        </span>
      </div>
      <div className="info-div">
        <span className="info">Wind</span>
        <span className="info">
          {Math.round(props.data.wind.speed * 3.6)} km/h
        </span>
      </div>
    </div>
  );
}

export default WeatherInfo;
