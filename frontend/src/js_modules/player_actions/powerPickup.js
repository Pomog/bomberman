import { mainView } from "../../app.js";
import { WS_REQUEST_TYPE_PLAYER_ACTION } from "../consts/consts.js";
import { PowerPickup } from "./actionModel.js";
import { endEvent } from "./eventModel.js";

export function powerPickupSender(event) {
  const playerAction = new PowerPickup(event.mapCoords);
  mainView.chatModel.socket.request(WS_REQUEST_TYPE_PLAYER_ACTION, playerAction);
  endEvent(event);
}


// this is for after the websocket response
/**
 * 
 * @param {string} playerName name of the current player
 * @param {number} position new number of player's lives
 * 
 */

export function powerPickupHandler(playerName, mapCoords) {
  mainView.gameMap.removePowerUp(mapCoords); // in draw, it will render the newly set x and y position into the VElement
}
