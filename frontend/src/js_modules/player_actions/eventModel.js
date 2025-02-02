import { PLAYER_DIE, PLAYER_RESPAWN } from "../consts/playerActionTypes.js";


export let currentEvent = null;
export class ActiveEvent {
    constructor(type, mapCoords) {
        this.type = type;
        if (this.type === PLAYER_DIE || this.type === PLAYER_RESPAWN) {
            this.stopAction = true;
        } else {
            this.stopAction = false;
        }
        this.mapCoords = mapCoords;
        currentEvent = this;
    }
};

export function endEvent(event) {
    event.stopAction = false;
    if (currentEvent === event) {
        currentEvent = null;
    }
}
