namespace("carBingo.CarBingo", {}, () => {
  let options = { 
    "icons": { "AIRPLANE": { "icon": "fa-solid fa-plane" }, "AMBULANCE": { "icon": "fa-solid fa-truck-medical" }, "BICYCLE": { "icon": "fa-solid fa-bicycle" }, "BRIDGE": { "icon": "fa-solid fa-bridge" }, "BUS": { "icon": "fa-solid fa-bus" }, "CAT": { "icon": "fa-solid fa-cat" }, "CHURCH": { "icon": "fa-solid fa-church" }, "COW": { "icon": "fa-solid fa-cow" }, "DOG": { "icon": "fa-solid fa-dog" }, "FLAG POLE": { "icon": "fa-solid fa-flag-usa" }, "GASOLINE PUMP": { "icon": "fa-solid fa-gas-pump" }, "HILL": { "icon": "fa-solid fa-mound" }, "HORSE": { "icon": "fa-solid fa-horse" }, "MOTOR HOME": { "icon": "fa-solid fa-caravan" }, "MOTORCYCLE": { "icon": "fa-solid fa-motorcycle" }, "MOVING TRUCK": { "icon": "fa-solid fa-truck-moving" }, "POST OFFICE": { "icon": "fa-solid fa-envelopes-bulk" }, "SATELLITE DISH": { "icon": "fa-solid fa-satellite-dish" }, "SCHOOL": { "icon": "fa-solid fa-school" }, "TRACTOR": { "icon": "fa-solid fa-tractor" }, "TRAFFIC LIGHT": { "icon": "fa-solid fa-traffic-light" }, "TRAIN": { "icon": "fa-solid fa-train" }, "TRAVEL TRAILER": { "icon": "fa-solid fa-trailer" }, "TREE GROVE": { "icon": "fa-solid fa-tree" }, "TRUCK": { "icon": "fa-solid fa-truck-front" }, "VAN": { "icon": "fa-solid fa-van-shuttle" } }, 
    "svg": {
      "70 SPEED LIMIT": {}, 
      "AIRPORT": {}, 
      "DO NOT ENTER": {}, 
      "HIGHWAY MARKER": {}, 
      "NO LEFT TURN": {}, 
      "NO PARKING": {}, 
      "REST AREA": {}, 
      "ROAD WORK": {}, 
      "S CURVE": {}, 
      "YEILD SIGN": {} 
    },
    "other": { 
      "BARN": {}, 
      "BILLBOARD": {}, 
      "COLA SIGN": {}, 
      "FARM HOUSE": {}, 
      "FIRE HYDRANT": {}, 
      "FIRE TRUCK": {}, 
      "GATE": {}, 
      "HAYSTACK": {}, 
      "HOUSE POST": {}, 
      "LAKE": {}, 
      "OVERPASS": {}, 
      "POLICE CAR": {}, 
      "POLICEMAN": {}, 
      "POST LAMP": {}, 
      "POWER LINE": {}, 
      "RIVER": {}, 
      "SERVICE STATION": {}, 
      "SILO": {}, 
      "SPEED SIGN": {}, 
      "SPORTS CAR": {}, 
      "TANK TRUCK": {}, 
      "TOW TRUCK": {}, 
      "TRAIN GATE": {}, 
      "WAGON": {}, 
      "WATER TOWER": {}, 
    } 
  };
  // todo private
  return class extends React.Component {
    constructor(props) {
      super(props);
      // todo this.state = ?
    }
    render() {
      return <div className="d-flex justify-content-center align-items-center w-100 h-100">
        { /* todo - render body */}
      </div>;
    }
  }
});
