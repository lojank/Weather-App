import "./Error.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

// displays error messaages
function Error(props: any) {
  return props.errorMsg !== "" ? (
    <span className="error">{props.errorMsg}</span>
  ) : props.data.name === "" ? (
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
