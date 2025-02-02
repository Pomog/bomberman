import {  PLAYER_MOVE, PLAYER_MOVE_DOWN, PLAYER_MOVE_LEFT, PLAYER_MOVE_RIGHT, PLAYER_MOVE_UP, PLAYER_PLACE_BOMB } from "../consts/playerActionTypes.js";
import { playerActioner } from "./actionModel.js";
// import { bombPlaceThrottle } from "./bombPlace.js";
// import { playerMovementThrottler } from "./playerMovement.js";

// convert actions to events
const actionConverter = {
  [PLAYER_MOVE_LEFT]: PLAYER_MOVE,
  [PLAYER_MOVE_RIGHT]: PLAYER_MOVE,
  [PLAYER_MOVE_UP]: PLAYER_MOVE,
  [PLAYER_MOVE_DOWN]: PLAYER_MOVE,
  [PLAYER_PLACE_BOMB]: PLAYER_PLACE_BOMB,
  getActionType(key) {
    return this[key]
  }
}

export function actionSender(currentAction) {
  const actionType = actionConverter.getActionType(currentAction);
  //console.log("send action : " + currentAction)
  playerActioner[actionType].send(currentAction);
}

export function eventSender(currentEvent) {
  //console.log("send evnet : " + currentEvent.type)
  playerActioner[currentEvent.type].send(currentEvent);
}
