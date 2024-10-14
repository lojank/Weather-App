import "./Error.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

// displays error messages
function Error(props: any) {
  // First check if errorMsg exists, then check if props.data exists and props.data.name is valid
  return props.errorMsg ? (
    <span className="error">{props.errorMsg}</span>
  ) : !props.data ? (
    <div>
      <span className="error">
        Loading <FontAwesomeIcon icon={faSpinner} spin />
      </span>
    </div>
  ) : (
    <></>
  );
}

export default Error;
