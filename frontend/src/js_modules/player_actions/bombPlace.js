import { mainView } from "../../app.js";
import { BOMB, BOMB_PLACEMENT_DELAY, SPRITE_POS, WS_REQUEST_TYPE_PLAYER_ACTION } from "../consts/consts.js";
import { PLAYER_PLACE_BOMB } from "../consts/playerActionTypes.js";
import { Bomb } from "../models/BombModel.js";
import { PlaceBomb } from "./actionModel.js";
import { activeAction } from "./keypresses.js";


export function bombPlace(currentAction) {
    const bombInitData = mainView.currentPlayer[PLAYER_PLACE_BOMB]();
    if (bombInitData) {
        const playerAction = new PlaceBomb(bombInitData);
        mainView.chatModel.socket.request(WS_REQUEST_TYPE_PLAYER_ACTION, playerAction)
    }
    activeAction.endAction(currentAction);
}


export function bombPlaceHandler(bombInitData) {
    // const [xSprite, ySprite] = SPRITE_POS[BOMB];
    //const [x, y] = bombInitData
    const bomb = new Bomb(bombInitData);
    // mainView.gameMap.vElement.addChild(bomb.vElement);
}