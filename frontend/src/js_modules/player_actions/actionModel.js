import { throttle } from "../../utils/throttler.js"
import { BOMB_PLACEMENT_DELAY, PLAYER_RESPAWN_TIME } from "../consts/consts.js"
import { PLAYER_DIE, PLAYER_MOVE, PLAYER_PLACE_BOMB, PLAYER_RESPAWN, POWER_IS_PICKED } from "../consts/playerActionTypes.js"
import { bombPlace, bombPlaceHandler } from "./bombPlace.js"
import { dyingHandler, playerDieSender, playerRespawnHandler, playerRespawnSender } from "./playerDyingRespawn.js"
import { movePlayer, movementHandler } from "./playerMovement.js"
import { powerPickupHandler, powerPickupSender } from "./powerPickup.js"

class PlayerAction {
    constructor(type) {
        this.type = type
    }
}

export class PlayerMove extends PlayerAction {
    constructor(coords, spriteInfo) {
        super(PLAYER_MOVE)
        this.coords = coords
        this.spriteInfo = spriteInfo
    }
}

export class PowerPickup extends PlayerAction {
    constructor(coords) {
        super(POWER_IS_PICKED)
        this.coords = coords
    }
}

export class PlaceBomb extends PlayerAction {
    constructor(coords) {
        super(PLAYER_PLACE_BOMB);
        this.coords = coords;
    }
}

export class PlayerDie extends PlayerAction {
    constructor(lives) {
        super(PLAYER_DIE);
        this.lives = lives;
    }
}
// export class PlayerRespawn extends PlayerAction {
//     constructor(coords) {
//         super(PLAYER_RESPAWN);
//         this.coords = coords;
//     }
// } use PlayerMove instead

export const playerActioner = {
    [PLAYER_MOVE]: {
        send: throttle(movePlayer, 17),
        handle: (data) => movementHandler(data.playerName, data.action.coords, data.action.spriteInfo)
    },
    [PLAYER_PLACE_BOMB]: {
        send: throttle(bombPlace, 100),
        handle: (data) => bombPlaceHandler(data.action.coords)
    },
    [PLAYER_DIE]: {
        send: throttle(playerDieSender, PLAYER_RESPAWN_TIME/2),
        handle: (data) => dyingHandler(data.playerName, data.action.lives)
    },
    [PLAYER_RESPAWN]: {
        send: throttle(playerRespawnSender, 25),
        handle: (data) => playerRespawnHandler(data.playerName, data.action.coords)
    },
    [POWER_IS_PICKED]: {
        send: throttle(powerPickupSender, 25),
        handle: (data) => powerPickupHandler(data.playerName, data.action.coords)
    },
}