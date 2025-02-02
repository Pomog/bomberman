import { VElement } from "../../../../framework/VElement.js"
import { mainView } from "../../app.js"
import { creatLiveIcon, createNumberOfLives, createShowBombPUP, createShowFlamePUP, createShowSpeedPUP } from "../../components/gameScreenComponents/gameBoxComponents/gameInfoPanelC.js";
import { convertRowColumnToXY } from "../../utils/spriteSheetCalc.js";
import { SPRITE_SHEET_URL, PLAYER_VIEW, MAP_TILE_SIZE, PLAYER_START_POSITIONS, PLAYER_Z_INDEX, PLAYER_MOVEMENT_SPEED, BOMB_EXPLOSION_TIMER, BOMBPUP, FIREPUP, SPEEDPUP, PLAYER_RESPAWN_TIME, GAME_OVER_VIEW } from "../consts/consts.js"
import { PLAYER_DIE, PLAYER_MOVE_DOWN, PLAYER_MOVE_LEFT, PLAYER_MOVE_RIGHT, PLAYER_MOVE_UP, PLAYER_PLACE_BOMB, PLAYER_POSITION_CURRENT, PLAYER_RESPAWN, POWER_IS_PICKED } from "../consts/playerActionTypes.js";
import { ActiveEvent, currentEvent, endEvent } from "../player_actions/eventModel.js";
import { currentAction, stopListenPlayerActions } from "../player_actions/keypresses.js";

const OFFSET_IGNORED = 12;

function setPlayerStyleAttrs() {
  return {
    ["z-index"]: `${PLAYER_Z_INDEX}`,
    ["background-image"]: `url(${SPRITE_SHEET_URL})`,
    width: `${MAP_TILE_SIZE}px`,
    height: `${MAP_TILE_SIZE}px`
  }
}

/**player's position on the game map
 * 
 * @property row - current row on the map grid
 * @property column - current column on the map grid
 * @property offsetX - offset from the feft edge of the current column
 * @property offsetY - offset from the top edge of the current row
 * @property getBlocksOn - an object containing functions that return blocks on the diriction of the player's movment
 * @property changePosition - an object containing functions that change the position of the player (row or columns) depending on the direction of movment
 */
class PlayerModel {
  constructor(row, column) {
    this.row = row;
    this.column = column;
    this.offsetY = 0;
    this.offsetX = 0;
  }

  set offset([x, y]) {
    this.offsetX = x
    this.offsetY = y
  }
  get offset() {
    return [this.offsetX, this.offsetY]
  }

  toString() {
    if (Object.keys(this).length === 0) return '';
    return `
    row: ${this.row}
    column: ${this.column} 
    offsetX: ${this.offsetX}
    offsetY: ${this.offsetY}
    `;
  }

  // returns array: [{row, columns}]
  getBlocksOn = {
    [PLAYER_MOVE_LEFT]: () => {
      const blocks = [];
      if (this.offsetY > 0) {
        blocks.push({ row: this.row, column: this.column - 1 }, { row: this.row + 1, column: this.column - 1 })
      } else {
        blocks.push({ row: this.row, column: this.column - 1 })
      }
      return blocks;
    },
    [PLAYER_MOVE_RIGHT]: () => {
      const blocks = [];
      if (this.offsetY > 0) {
        blocks.push({ row: this.row, column: this.column + 1 }, { row: this.row + 1, column: this.column + 1 })
      } else {
        blocks.push({ row: this.row, column: this.column + 1 })
      }
      return blocks;
    },
    [PLAYER_MOVE_UP]: () => {
      const blocks = [];
      if (this.offsetX > 0) {
        blocks.push({ row: this.row - 1, column: this.column }, { row: this.row - 1, column: this.column + 1 })
      } else {
        blocks.push({ row: this.row - 1, column: this.column })
      }
      return blocks;
    },
    [PLAYER_MOVE_DOWN]: () => {
      const blocks = [];
      if (this.offsetX > 0) {
        blocks.push({ row: this.row + 1, column: this.column }, { row: this.row + 1, column: this.column + 1 })
      } else {
        blocks.push({ row: this.row + 1, column: this.column })
      }
      return blocks;
    },
    [PLAYER_POSITION_CURRENT]: () => {
      const blocks = [];
      // checks current block and the next block
      if (this.offsetX > 0) {
        blocks.push(
          { row: this.row, column: this.column },
          { row: this.row, column: this.column + 1 }
        );
      } else if (this.offsetY > 0) {
        blocks.push(
          { row: this.row, column: this.column },
          { row: this.row + 1, column: this.column }
        );
      } else {
        blocks.push({ row: this.row, column: this.column });
      }
      return blocks;
    }
  }

  changePosition = {
    [PLAYER_MOVE_LEFT]: () => { this.column--; },
    [PLAYER_MOVE_RIGHT]: () => { this.column++; },
    [PLAYER_MOVE_UP]: () => { this.row--; },
    [PLAYER_MOVE_DOWN]: () => { this.row++; },
  }
}

export class Player { // add all player properties here, for example image, movements etc
  constructor(name, number) {
    this.name = name;
    this.stats = new PlayerStats(); // for lives in the vElement
    this.dead = false
    this.direction = "moveDown";
    this.currentFrame = 0; // max three frames

    this.vElement = new VElement({
      tag: "div",
      attrs: {
        class: 'player',
      },
      style: setPlayerStyleAttrs(),
    })

    if (number) {
      this.number = number;
    }
  }
  set position([x, y]) {
    this.x = x
    this.y = y
  }
  get position() {
    return [this.x, this.y]
  }
  set spriteInfo([direction, currentFrame]) {
    if (arguments) {
      this.direction = direction;
      this.currentFrame = currentFrame;
    }
  }
  get spriteInfo() {
    return [this.direction, this.currentFrame]
  }
  moveOn() {
    [this.x, this.y] = convertRowColumnToXY(this.model.row, this.model.column);
    this.x += this.model.offsetX;
    this.y += this.model.offsetY;
  }
  setVPosition() {
    this.vElement.setStyle({ transform: `translate(${this.x}px, ${this.y}px)` });
  }
  setVAnimation() {
    if (!PLAYER_VIEW[this.direction]) {
      console.error(`Invalid direction: ${this.direction}`);
      return;
    }
    if (this.currentFrame < 0 || this.currentFrame >= PLAYER_VIEW[this.direction].length) {
      console.error(`Invalid frame index: ${this.currentFrame}`);
      return;
    }
    const [spriteOffsetX, spriteOffsetY] = PLAYER_VIEW[this.direction][this.currentFrame];
    const spriteSheetPosition = `${spriteOffsetX}px ${spriteOffsetY}px`;
    this.vElement.setStyle({ "background-position": spriteSheetPosition });
  }
  set number(number) {
    this._number = number;
    const { row, column } = PLAYER_START_POSITIONS[number - 1];
    this.model = new PlayerModel(row, column);
    [this.x, this.y] = convertRowColumnToXY(this.model.row, this.model.column);
    this.setVPosition();
  }
  get number() {
    return this._number;
  }
  renderPlayer(gameBoxM) {
    gameBoxM.vElement.addChild(this.vElement)
  }
  getLives() {
    return this.stats.lives;
  }
  setLives(lives) {
    this.stats.lives = lives;
  }
  die() {
    this.dead = true;
    this.stats.loseLife();
    new ActiveEvent(PLAYER_DIE);
    console.log("die() set event:", currentEvent);
    if (this.stats.lives == 0) {
      stopListenPlayerActions();
      setTimeout(() => {
        mainView.showScreen[GAME_OVER_VIEW]();
        endEvent(currentEvent);
      }
        , PLAYER_RESPAWN_TIME);
      return;
    }
    const { row, column } = this._number ? PLAYER_START_POSITIONS[this._number - 1] : PLAYER_START_POSITIONS[0];
    //todo: try to handle respawn if the start position is onFire
    setTimeout(() => {
      this.respawn(row, column);
    }
      , PLAYER_RESPAWN_TIME);

  }
  respawn(row, column) {
    this.model = new PlayerModel(row, column);
    const [x, y] = convertRowColumnToXY(row, column)
    this.position = [x, y] // add websocket stuff later
    new ActiveEvent(PLAYER_RESPAWN);
    console.log("respawn() set event:", currentEvent);

  }
  adjustByX() {
    const oldModel = {
      offsetX: this.model.offsetX,
      column: this.model.column
    };
    if (this.model.offsetX <= OFFSET_IGNORED) {
      this.model.offsetX = 0;
    } else if (this.model.offsetX >= MAP_TILE_SIZE - OFFSET_IGNORED) {
      this.model.offsetX = 0;
      this.model.column++;
    }
    return oldModel
  }
  adjustByY() {
    const oldModel = {
      offsetY: this.model.offsetY,
      row: this.model.row
    };
    if (this.model.offsetY <= OFFSET_IGNORED) {
      this.model.offsetY = 0;
    } else if (this.model.offsetY >= MAP_TILE_SIZE - OFFSET_IGNORED) {
      this.model.offsetY = 0;
      this.model.row++;
    }
    return oldModel
  }

  checkTilesOnWay(direction) {
    // because of the map's structure there will be never more than one tile with a powerUp. 
    // If there are 2 tiles on the player way it means that 1 of them is solid. 
    // So if getTilesOnWay returns not false value it means tiles arary contains omnly 1 element. But let it be.
    const tiles = mainView.gameMap?.getTilesOnWay(this.model.getBlocksOn[direction]());
    if (!tiles) { return false; }
    for (let tile of tiles) {
      if (tile.mapTile.onFire) {
        mainView.currentPlayer.die()
        return
      }
      if (tile.mapTile.powerup != null) {//!=null or undefined
        this.stats[tile.mapTile.powerup]();
        new ActiveEvent(POWER_IS_PICKED, tile.mapCoords);

        //tile.removePowerUp(); // will be removed in the event handler
      }
    }
    return true; // if we want to send the stats changes to the server, it has to return object with changed stats properties
  }

  [PLAYER_MOVE_DOWN] = () => {
    this.direction = currentAction;

    let oldModel = this.adjustByX();

    if (this.model.offsetY == 0 && !this.checkTilesOnWay(PLAYER_MOVE_DOWN)) {
      Object.assign(this.model, oldModel);
      return false;
    }

    let shiftY = this.stats.moveSpeed;
    this.model.offsetY += shiftY;

    if (this.model.offsetY >= MAP_TILE_SIZE) {
      this.model.index = this.model.changePosition[PLAYER_MOVE_DOWN]();
      if (!this.checkTilesOnWay(PLAYER_MOVE_DOWN)) {
        shiftY -= this.model.offsetY - MAP_TILE_SIZE
        this.model.offsetY = 0;
      } else {
        this.model.offsetY -= MAP_TILE_SIZE;
      }
    }
    this.moveOn();
    return true;
  }
  [PLAYER_MOVE_UP] = () => {
    this.direction = currentAction;

    let oldModel = this.adjustByX();

    if (this.model.offsetY == 0 && !this.checkTilesOnWay(PLAYER_MOVE_UP)) {
      Object.assign(this.model, oldModel);
      return false;
    }

    let shiftY = -this.stats.moveSpeed;
    this.model.offsetY += shiftY;

    if (this.model.offsetY < 0) {
      if (!this.checkTilesOnWay(PLAYER_MOVE_UP)) {
        shiftY -= this.model.offsetY
        this.model.offsetY = 0;
      } else {
        this.model.index = this.model.changePosition[PLAYER_MOVE_UP]();
        this.model.offsetY += MAP_TILE_SIZE;
      }
    }

    this.moveOn();
    return true;
  }
  [PLAYER_MOVE_LEFT] = () => {
    this.direction = currentAction;

    let oldModel = this.adjustByY();

    if (this.model.offsetX == 0 && !this.checkTilesOnWay(PLAYER_MOVE_LEFT)) {
      Object.assign(this.model, oldModel);
      return false;
    }

    let shiftX = - this.stats.moveSpeed;
    this.model.offsetX += shiftX;

    if (this.model.offsetX < 0) {
      if (!this.checkTilesOnWay(PLAYER_MOVE_LEFT)) {
        shiftX -= this.model.offsetX
        this.model.offsetX = 0;
      } else {
        this.model.index = this.model.changePosition[PLAYER_MOVE_LEFT]();
        this.model.offsetX += MAP_TILE_SIZE;
      }
    }

    this.moveOn();
    return true;
  }
  [PLAYER_MOVE_RIGHT] = () => {
    this.direction = currentAction;

    let oldModel = this.adjustByY();

    if (this.model.offsetX == 0 && !this.checkTilesOnWay(PLAYER_MOVE_RIGHT)) {
      Object.assign(this.model, oldModel);
      return false;
    }
    let shiftX = this.stats.moveSpeed;
    this.model.offsetX += shiftX;

    if (this.model.offsetX >= MAP_TILE_SIZE) {
      this.model.index = this.model.changePosition[PLAYER_MOVE_RIGHT]();
      if (!this.checkTilesOnWay(PLAYER_MOVE_RIGHT)) {
        shiftX -= this.model.offsetX - MAP_TILE_SIZE
        this.model.offsetX = 0;
      } else {
        this.model.offsetX -= MAP_TILE_SIZE;
      }
    }

    this.moveOn();
    return true;
  }

  [PLAYER_PLACE_BOMB] = () => {
    if (this.stats.bombAmount <= 0) { return false; }
    this.stats.bombAmount--;
    setTimeout(() => { this.stats.bombAmount++ }, BOMB_EXPLOSION_TIMER);
    let { row, column } = this.model;
    const power = this.stats.fireTiles;
    if (this.model.offsetX > MAP_TILE_SIZE / 2) {
      column++;
    }
    if (this.model.offsetY > MAP_TILE_SIZE / 2) {
      row++;
    }
    return { row, column, power };
  }
}
class PlayerStats {
  constructor() {
    this._lives = 3;
    // potentially those stats could be display on the status bar - 
    // to do this we need to add setters which will change the statsBar and after the player moves, send to server these stats along with the position 
    this._bombAmount = 1; // the amount of bombs
    this._fireTiles = 1; // the lenght of explosion in tiles
    this._moveSpeed = PLAYER_MOVEMENT_SPEED; // for powerup
    this.vNumberOfLives = createNumberOfLives(this._lives);
    this.vPlayerStatsBar = new VElement({
      tag: "span",
      attrs: { class: "userGameStatus" },
      //content: `${this.lives} x`,
      children: [
        // Avatar (hero + color) + nickname + status icon: "In game" OR "Died but online (can write in chat)" OR "Offline"
        // If in game => <3 <3 <3 + Lives
        this.vNumberOfLives,
        creatLiveIcon(),
      ],
    });
    this.vShowBombPUP = createShowBombPUP(`Bombs: ${this.bombAmount}`);
    this.vShowFlamePUP = createShowFlamePUP(`Flame: ${this.fireTiles}`);
    this.vShowSpeedPUP = createShowSpeedPUP(`Speed: ${this.moveSpeed}`);
  }
  toString() {
    return `
  lives: ${this._lives}
  bombAmount: ${this.bombAmount}
  fireTiles: ${this.fireTiles}
  moveSpeed: ${this.moveSpeed}`
  }
  get lives() { return this._lives }
  set lives(lives) {
    this._lives = lives;
    if (this._lives != 0) {
      this.vNumberOfLives.content = `${this._lives}`;
    } else {
      this.vNumberOfLives.content = `died`;
    }
  }
  get bombAmount() { return this._bombAmount }
  get fireTiles() { return this._fireTiles }
  get moveSpeed() { return this._moveSpeed }
  set bombAmount(bombAmount) {
    this._bombAmount = bombAmount;
    this.vShowBombPUP.content = `Bombs: ${this._bombAmount}`;
  }
  set fireTiles(fireTiles) {
    this._fireTiles = fireTiles;
    this.vShowFlamePUP.content = `Flame: ${this._fireTiles}`;
  }
  set moveSpeed(moveSpeed) {
    this._moveSpeed = moveSpeed;
    this.vShowSpeedPUP.content = `Speed: ${this._moveSpeed}`;
  }
  loseLife() {
    this._lives--
  }
  [BOMBPUP] = () => {
    this.bombAmount++;
  }
  [FIREPUP] = () => {
    this.fireTiles++;
  }
  [SPEEDPUP] = () => {
    this.moveSpeed += 1;
  }
}