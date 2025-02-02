import { mainView } from "../../app.js";
import { WS_REQUEST_TYPE_PLAYER_ACTION } from "../consts/consts.js";
import { PLAYER_MOVE, PLAYER_MOVE_DOWN, PLAYER_MOVE_LEFT, PLAYER_MOVE_RIGHT, PLAYER_MOVE_UP } from "../consts/playerActionTypes.js";
import { PlayerMove } from "./actionModel.js";
// import { mainView } from "../test/test.js";

// this will send the ws request with the next position of the current player
/**
 * 
 * @param {string} currentAction the action of the player, ex 'moveLeft' or 'moveRight'
*/
export function movePlayer(currentAction) {
  if (mainView.currentPlayer[currentAction]()) {
    const newPosition = mainView.currentPlayer.position;
    const newFrame = loopThreeFrames(mainView.currentPlayer);
    const spriteInfo = [currentAction, newFrame];
    const playerAction = new PlayerMove(newPosition, spriteInfo);
    mainView.chatModel.socket.request(WS_REQUEST_TYPE_PLAYER_ACTION, playerAction); // send request to ws with playerAction
  }
}

// this is for after the websocket response
/**
 * 
 * @param {string} playerName name of the current player
 * @param {[number, number]} position new [x, y] position of player
 * @param {[string, number]} spriteInfo new spriteInfo aka direction of player and currentFrame of players animation
 * 
*/
export function movementHandler(playerName, position, spriteInfo) {
  mainView.PlayerList.players[playerName].position = position; // in draw, it will render the newly set x and y position into the VElement
  mainView.PlayerList.players[playerName].spriteInfo = spriteInfo;
}

let now = new Date().getTime();
function loopThreeFrames(currentPlayer) {
  const later = new Date().getTime();
  if (later - now > 200) {
    if (currentPlayer.currentFrame < 2) {
      currentPlayer.currentFrame++;
    } else {
      currentPlayer.currentFrame = 0;
    }
    now = later
  }
  
  return currentPlayer.currentFrame;
}