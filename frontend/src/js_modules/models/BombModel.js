import { VElement } from "../../../../framework/VElement.js";
import { mainView } from "../../app.js";
import { getSpriteSheetXYbyIndex, spriteSheetXYtoStyleString } from "../../utils/spriteSheetCalc.js";
import { BOMB_EXPLOSION_TIMER, BOMB_Z_INDEX, SPRITE_POS, BOMB, SPRITE_SHEET_URL, MAP_TILE_SIZE } from "../consts/consts.js";
import { Explosion } from "./explosionModel.js";

function setBombStyle(x, y) {
    const [spriteOffsetX, spriteOffsetY] = SPRITE_POS[BOMB];
    const spriteSheetPosition = spriteSheetXYtoStyleString(spriteOffsetX, spriteOffsetY);
    return {
        left: `${x}px`,
        top: `${y}px`,
        ["z-index"]: `${BOMB_Z_INDEX}`,
        ["background-image"]: `url(${SPRITE_SHEET_URL})`,
        ["background-position"]: `${spriteSheetPosition}`,
        width: `${MAP_TILE_SIZE}px`,
        height: `${MAP_TILE_SIZE}px`,
    }
}

/**bomb's position on the game map
 * 
 * @property row - current row on the map grid
 * @property column - current column on the map grid
 * @property power - indicate size of expolde
 * @property getBlocksOn - an object containing functions that return blocks on the diriction of the player's movment
 * @property changePosition - an object containing functions that change the position of the player (row or columns) depending on the direction of movment
 */
class BombModel {
    constructor(row, column, power) {
        this.row = row;
        this.column = column;
        this._power = power;
    }
    
    set power(p) {
        if (p >= 1) {
            this._power = p
        }
    }
    get power() {
        return this._power;
    }

    toString() {
        if (Object.keys(this).length === 0) return '';
        return `
      row: ${this.row}
      column: ${this.column} 
      power: ${this.power}
      `;
    }

}

export class Bomb {
  constructor({ row, column, power }) {
    this.model = new BombModel(row, column, power);
    this.x = this.model.column * MAP_TILE_SIZE;
    this.y = this.model.row * MAP_TILE_SIZE;
    this.z = BOMB_Z_INDEX;
    this.sprite = BOMB;
    this.hasExploded = false; // if true, remove bomb (set to true after exploding)
    //this.sprite = "src/assets/images/spritesheets/spritesheet.png";
    this.vElement = new VElement({
      tag: "div",
      attrs: {
        class: "bomb",
      },
      style: setBombStyle(this.x, this.y),
    });
    this.renderBomb();
    this.setBombSprite()
    this.intervalID = setInterval(this.setBombSprite.bind(this), 500);

    setTimeout(this.explode, BOMB_EXPLOSION_TIMER); // set timer for bomb to explose after placing
    
  }
  renderBomb() {
    mainView.gameMap.vElement.addChild(this.vElement);
  }

  explode = () => {
    clearInterval(this.intervalID);
    this.hasExploded = true;
    mainView.vElement.delChild(this.vElement.vId); // removes bomb element
    const explosion = new Explosion(this.model);
    //console.log(explosion.model.blocks)
    
  };
  setBombSprite() {
    const [spriteOffsetX, spriteOffsetY] = getSpriteSheetXYbyIndex(this.sprite);
    const spriteSheetPosition = spriteSheetXYtoStyleString(
      spriteOffsetX,
      spriteOffsetY
    );
    this.vElement.setStyle({"background-position": spriteSheetPosition})
    if (this.sprite == 44) {
        this.sprite = BOMB
    } else {
        this.sprite++;
    }
  }
}



