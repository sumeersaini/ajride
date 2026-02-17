import { EventEmitter } from "events";

const rideEventBus = new EventEmitter();

// Optional: increase max listeners if you expect many concurrent rides
rideEventBus.setMaxListeners(100);

export default rideEventBus;