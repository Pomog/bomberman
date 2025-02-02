import { getSpriteSheetXYbyIndex } from "../../utils/spriteSheetCalc.js";
import { PLAYER_MOVE_DOWN, PLAYER_MOVE_LEFT, PLAYER_MOVE_RIGHT, PLAYER_MOVE_UP } from "../consts/playerActionTypes.js";

export const PLAYER_NAME_FORM_INPUT = "playerName",
  // main views
  REGISTER_VIEW = "registerView",
  WAITING_VIEW = "waitingView",
  GAME_VIEW = "gameView",
  GAME_OVER_VIEW = "gameOverView",
  YOU_WIN_VIEW = "youWinView",
  //
  CHAT_MESSAGE_FORM_INPUT_NAME = "chatMessage",
  WS_REQUEST_TYPE_PLAYER_ACTION = "playerAction",
  WS_REQUEST_TYPE_PLAYER_LOSE_LIFE = "loseLife",
  WAIT_FOR_PLAYERS = 20, 
  START_IN = 10,
  GAME_TIME = 3*60*1000,
  // map tiles
  MAP_TILE_SIZE = 32,
  SPRITESHEET_ROWS = 23,
  SPRITESHEET_COLUMNS = 14, // important value for calculating sprite positions
  // map size
  MAP_ROWS = 11,
  MAP_COLUMNS = 17,
  // z-indexes, used in class constructors
  EXPLOSION_Z_INDEX = 15, //for bomb explosion fire animation (player caught in the fire)
  BOMB_Z_INDEX = 5, //player places the bomb under themselves
  PLAYER_Z_INDEX = 10,
  // blocks
  SPRITE_SHEET_URL = "src/assets/images/spritesheets/spritesheet.png",
  GRASS = 6,
  SOLID = 45,
  DBLOCK = 46,
  BOMBPUP = 196,
  FIREPUP = 197,
  SPEEDPUP = 199,
  BOMB = 43,
  EXPLOSION_CENTER = 156,
  EXPLOSION_LEFT = 155,
  EXPLOSION_RIGHT = 157,
  EXPLOSION_UP = 142,
  EXPLOSION_DOWN = 170,
  EXPLOSION_EDGES = {
    [EXPLOSION_LEFT]: 154,
    [EXPLOSION_RIGHT]: 158,
    [EXPLOSION_UP]: 128,
    [EXPLOSION_DOWN]: 184,
  },
  SPRITE_POS = {
    [GRASS]: getSpriteSheetXYbyIndex(GRASS),
    [SOLID]: getSpriteSheetXYbyIndex(SOLID),
    [DBLOCK]: getSpriteSheetXYbyIndex(DBLOCK),
    [BOMBPUP]: getSpriteSheetXYbyIndex(BOMBPUP),
    [SPEEDPUP]: getSpriteSheetXYbyIndex(SPEEDPUP),
    [FIREPUP]: getSpriteSheetXYbyIndex(FIREPUP),
    [BOMB]: getSpriteSheetXYbyIndex(BOMB),
    [EXPLOSION_CENTER]: getSpriteSheetXYbyIndex(EXPLOSION_CENTER),
    [EXPLOSION_LEFT]: getSpriteSheetXYbyIndex(EXPLOSION_LEFT),
    [EXPLOSION_RIGHT]: getSpriteSheetXYbyIndex(EXPLOSION_RIGHT),
    [EXPLOSION_UP]: getSpriteSheetXYbyIndex(EXPLOSION_UP),
    [EXPLOSION_DOWN]: getSpriteSheetXYbyIndex(EXPLOSION_DOWN),
    [EXPLOSION_EDGES[EXPLOSION_LEFT]]: getSpriteSheetXYbyIndex([
      EXPLOSION_EDGES[EXPLOSION_LEFT],
    ]),
    [EXPLOSION_EDGES[EXPLOSION_RIGHT]]: getSpriteSheetXYbyIndex([
      EXPLOSION_EDGES[EXPLOSION_RIGHT],
    ]),
    [EXPLOSION_EDGES[EXPLOSION_UP]]: getSpriteSheetXYbyIndex([
      EXPLOSION_EDGES[EXPLOSION_UP],
    ]),
    [EXPLOSION_EDGES[EXPLOSION_DOWN]]: getSpriteSheetXYbyIndex([
      EXPLOSION_EDGES[EXPLOSION_DOWN],
    ]),
  },
  BACKEND_TILE_TYPE_CODES = {
    B: { TileIndex: SOLID, IntitialSpritePos: SPRITE_POS[SOLID] },
    G: { TileIndex: GRASS, IntitialSpritePos: SPRITE_POS[GRASS] },
    D: { TileIndex: DBLOCK, IntitialSpritePos: SPRITE_POS[DBLOCK] },
    O: { TileIndex: BOMBPUP, IntitialSpritePos: SPRITE_POS[DBLOCK] },
    F: { TileIndex: FIREPUP, IntitialSpritePos: SPRITE_POS[DBLOCK] },
    M: { TileIndex: SPEEDPUP, IntitialSpritePos: SPRITE_POS[DBLOCK] },
  },
  //player sprite animation
  PLAYER_VIEW = {
    [PLAYER_MOVE_UP]: [getSpriteSheetXYbyIndex(17),getSpriteSheetXYbyIndex(18),getSpriteSheetXYbyIndex(19)],
    [PLAYER_MOVE_DOWN]: [getSpriteSheetXYbyIndex(3),getSpriteSheetXYbyIndex(4),getSpriteSheetXYbyIndex(5)],
    [PLAYER_MOVE_LEFT]: [getSpriteSheetXYbyIndex(0),getSpriteSheetXYbyIndex(1),getSpriteSheetXYbyIndex(2)],
    [PLAYER_MOVE_RIGHT]: [getSpriteSheetXYbyIndex(14),getSpriteSheetXYbyIndex(15),getSpriteSheetXYbyIndex(16)],
  },
  // player start
  PLAYER_START_POSITIONS = [
    { row: 1, column: 1 },
    { row: 1, column: MAP_COLUMNS - 2 },
    { row: MAP_ROWS - 2, column: 1 },
    { row: MAP_ROWS - 2, column: MAP_COLUMNS - 2 },
  ],
  // player actions

  PLAYER_MOVEMENT_SPEED = 2,
  PLAYER_RESPAWN_TIME = 300,
  SEND_TO_WS_DELAY = 20, //delay to stop die-event,
  // bomb
  BOMB_EXPLOSION_TIMER = 3000, // time between placing bomb and explosion
  EXPLOSION_LASTING_TIMER = 2000, // explosion lasts
  BOMB_PLACEMENT_DELAY = 200;

