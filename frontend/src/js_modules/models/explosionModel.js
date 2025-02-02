import { VElement } from "../../../../framework/VElement.js";
import { mainView } from "../../app.js";
import { SPRITE_POS, SPRITE_SHEET_URL, MAP_TILE_SIZE, EXPLOSION_Z_INDEX, EXPLOSION_CENTER, EXPLOSION_LEFT, EXPLOSION_RIGHT, EXPLOSION_UP, EXPLOSION_DOWN, EXPLOSION_LASTING_TIMER, EXPLOSION_EDGES } from "../consts/consts.js";
import { PLAYER_POSITION_CURRENT } from "../consts/playerActionTypes.js";


function setExplosionStyle(x, y) {
  return {
    left: `${x}px`,
    top: `${y}px`,
    ["z-index"]: `${EXPLOSION_Z_INDEX}`,
    ["background-image"]: `url(${SPRITE_SHEET_URL})`,
    width: `${MAP_TILE_SIZE}px`,
    height: `${MAP_TILE_SIZE}px`,
  }
}
function setExplosionPicture(direction) {
  const [spriteOffsetX, spriteOffsetY] = SPRITE_POS[direction];
  const spriteSheetPosition = `${spriteOffsetX}px ${spriteOffsetY}px`
  return {
    ["background-position"]: `${spriteSheetPosition}`,
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
class ExplosionModel {
  constructor(row, column, power) {
    this.row = row;
    this.column = column;
    if (mainView.baseMap) { mainView.gameMap.baseMap[row][column].onFire = true }; // for central block
    this.blocks = {
      [EXPLOSION_LEFT]: [],
      [EXPLOSION_RIGHT]: [],
      [EXPLOSION_UP]: [],
      [EXPLOSION_DOWN]: [],
    };
    // check left side of center
    for (let i = 1; i <= power; i++) {
      const block = { row: this.row, column: this.column - i };
      const tile = mainView.gameMap?.getTileToDestroy(block);
      if (!tile) {
        this.blocks[EXPLOSION_LEFT].push(block);
        continue; // it was passable tile
      }
      if (tile.destroyable) {
        block.tile = tile;
        this.blocks[EXPLOSION_LEFT].push(block);
      }
      break; // tile was not passable
    }
    // check right side of center
    for (let i = 1; i <= power; i++) {
      const block = { row: this.row, column: this.column + i };
      const tile = mainView.gameMap?.getTileToDestroy(block);
      if (!tile) {
        this.blocks[EXPLOSION_RIGHT].push(block);
        continue;
      }
      if (tile.destroyable) {
        console.log("new expl model, right: ", tile, tile.destroyable)
        block.tile = tile;
        this.blocks[EXPLOSION_RIGHT].push(block);
      }
      console.log("new expl model, right2: ", tile, tile.destroyable)
      break;
    }
    // check up side of center
    for (let i = 1; i <= power; i++) {
      const block = { row: this.row - i, column: this.column };
      const tile = mainView.gameMap?.getTileToDestroy(block);
      if (!tile) { // false is grass block
        this.blocks[EXPLOSION_UP].push(block);

        continue;
      }
      if (tile.destroyable) {
        block.tile = tile;
        this.blocks[EXPLOSION_UP].push(block);
      }
      break;
    }
    // check down side of center
    for (let i = 1; i <= power; i++) {
      const block = { row: this.row + i, column: this.column };
      const tile = mainView.gameMap?.getTileToDestroy(block);
      // if player is on tile, dead
      if (!tile) {
        this.blocks[EXPLOSION_DOWN].push(block);

        continue;
      }
      if (tile.destroyable) {
        block.tile = tile;
        this.blocks[EXPLOSION_DOWN].push(block);
      }
      break;
    }
  }

  toString() {
    if (Object.keys(this).length === 0) return '';
    let blstr = 'blocks:\n';
    for (const direct in this.blocks) {
      blstr += direct + ': ';
      for (const block of this.blocks[direct]) {
        blstr += `
                row: ${block.row}
                column: ${block.column}
                tile: ${block.tile}`
      }
      blstr += '\n';
    }
    return `
      row: ${this.row}
      column: ${this.column} 
      ${blstr}
      `;
  }
}

export class Explosion {
  constructor({ row, column, power }) {

    this.model = new ExplosionModel(row, column, power)
    this.x = this.model.column * MAP_TILE_SIZE
    this.y = this.model.row * MAP_TILE_SIZE
    this.z = EXPLOSION_Z_INDEX;
    console.log("new explosion: " + this.model)
    this.affectedPlayers = [];
    //this.sprite = "src/assets/images/spritesheets/spritesheet.png";
    this.vElements = []
    // center of explosion
    this.vElements.push(new VElement({
      tag: "div",
      attrs: {
        class: 'explosion',
      },
      style: setExplosionStyle(this.x, this.y),
    }).setStyle(setExplosionPicture(EXPLOSION_CENTER))
    );
    const centerBlock = { row: row, column: column }
    this.checkPlayerInExplosion(centerBlock); // check if player is in the center of explosion
    for (const [direction, blocks] of Object.entries(this.model.blocks)) {
      this.addBeam(direction, blocks); // in here checks if player is in other beams of explosion
    }
    this.renderExplosion();
    setTimeout(this.delEsplosion, EXPLOSION_LASTING_TIMER); // set timer for bomb to explose after placing
  }
  checkPlayerInExplosion(block) {
    const currentPlayerRowsColumns = mainView.currentPlayer.model.getBlocksOn[PLAYER_POSITION_CURRENT]();
    // get the blocks that player is standing on
    currentPlayerRowsColumns.forEach((rowColumn) => {
      if (rowColumn.column == block.column && rowColumn.row == block.row) {
        mainView.currentPlayer.die();
        this.killed = true;
        console.log("player dead")
      }
    });
  }
  addBeam = (direction, blocks) => {
    if (blocks.length === 0) {
      return
    }
    for (let i = 0; i < blocks.length - 1; i++) { // for the explosion inner fire
      if (!this.killed) { this.checkPlayerInExplosion(blocks[i]); }
      const x = blocks[i].column * MAP_TILE_SIZE;
      const y = blocks[i].row * MAP_TILE_SIZE;
      this.vElements.push(new VElement({
        tag: "div",
        attrs: {
          class: 'explosion',
        },
        style: setExplosionStyle(x, y),
      }).setStyle(setExplosionPicture(direction))
      );
    }
    // for the explosion edges
    if (!this.killed) { this.checkPlayerInExplosion(blocks[blocks.length - 1]); }

    const x = blocks[blocks.length - 1].column * MAP_TILE_SIZE;
    const y = blocks[blocks.length - 1].row * MAP_TILE_SIZE;
    this.vElements.push(new VElement({
      tag: "div",
      attrs: {
        class: 'explosion',
      },
      style: setExplosionStyle(x, y),
    }).setStyle(setExplosionPicture(EXPLOSION_EDGES[direction]))
    );
    // if the last one is destroyable tile, destroy it
    blocks[blocks.length - 1].tile?.destroy();
  }

  // have the explosion remove blocks
  renderExplosion = () => {
    for (const vElement of this.vElements) { mainView.gameMap?.vElement.addChild(vElement) }
  }
  delOnFire = () => {
    if (mainView.gameMap) { // check it here because when the player dies, the gameMap is set to null
      mainView.gameMap.baseMap[this.model.row][this.model.column].onFire = false; // for central tile
      for (const blocks of Object.values(this.model.blocks)) {
        blocks.forEach(tile => {
          mainView.gameMap.baseMap[tile.row][tile.column].onFire = false;
        })
      }
    }
  }
  delEsplosion = () => {
    for (const vElement of this.vElements) {
      mainView.gameMap?.vElement.delChild(vElement.vId);
    }

    this.delOnFire();
  }
}
