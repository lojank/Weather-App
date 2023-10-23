import "./WeatherLocation.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";

// refresh page when reload is clicked
function refresh(): void {
  window.location.reload();
}
// new Date object to display current time
const date = new Date();

// displays location and time
function WeatherLocation(props: any) {
  return (
    <div>
      <div className="weather-location-div">
        <span className="weather-location">
          Weather in {props.data.name}, {props.data.sys.country}
        </span>
        <span className="weather-time">
          As of {date.toLocaleTimeString()}{" "}
          <FontAwesomeIcon onClick={refresh} icon={faArrowsRotate} />
        </span>
      </div>
    </div>
  );
}

export default WeatherLocation;
