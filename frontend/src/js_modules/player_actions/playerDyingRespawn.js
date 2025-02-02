import { mainView } from "../../app.js";
import { WS_REQUEST_TYPE_PLAYER_ACTION, YOU_WIN_VIEW } from "../consts/consts.js";
import { PlayerDie, PlayerMove } from "./actionModel.js";
import { endEvent } from "./eventModel.js";

export function playerDieSender() {
  
  const newLives = mainView.currentPlayer.getLives();
  const playerAction = new PlayerDie(newLives);
  mainView.chatModel.socket.request(WS_REQUEST_TYPE_PLAYER_ACTION, playerAction);
}
export function playerRespawnSender(event) {
  const newPosition = mainView.currentPlayer.position;
  //console.log(`PlayerRespawn:`, event);
  const playerAction = new PlayerMove(newPosition);
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
export function playerRespawnHandler(playerName, position) {
  mainView.PlayerList.players[playerName].position = position; // in draw, it will render the newly set x and y position into the VElement
}
export function dyingHandler(playerName, lives) {
  const player =  mainView.PlayerList.players[playerName];
  player?.setLives(lives); // in draw, it will render the newly set x and y position into the VElement
  if (lives < 1) {
    mainView.gameMap.vElement.delChild(
      player?.vElement.vId
    );
    delete mainView.delPlayers(player);
  }
  if ( !mainView.solo && Object.keys(mainView.PlayerList.players).length == 1) { // check win condition
    if (mainView.PlayerList.players[mainView.currentPlayer.name]) {
      mainView.showScreen[YOU_WIN_VIEW]();
    }
  }
}
