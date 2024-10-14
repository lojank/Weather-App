import "./WeatherLocation.css";

// new Date object to display current time
const date = new Date();

// displays location and time
function WeatherLocation(props: any) {
  return (
    <div>
      <div className="weather-location-div">
        <span className="weather-location">
          {props.data.name}, {props.data.sys.country}
        </span>
      </div>
    </div>
  );
}

export default WeatherLocation;