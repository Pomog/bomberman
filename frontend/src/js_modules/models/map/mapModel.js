import { VElement } from "../../../../../framework/VElement.js";
import { BACKEND_TILE_TYPE_CODES, MAP_COLUMNS, MAP_ROWS, MAP_TILE_SIZE } from "../../consts/consts.js";
import { Tile, tileTranslator } from "./tileModel.js";

export class GameMap {
  /**
   *
   * @param {number[][]} tileMap
   */
  constructor(tileMap) {
    // outer circle is just blocks
    this.columns = MAP_COLUMNS;
    this.rows = MAP_ROWS;
    this.tileSize = MAP_TILE_SIZE; // depends on sprite sheet ig
    //this.tileMap = tileMap;
    this.baseMap = []
    //this.explosionMap = []
    this.createMap(tileMap)
    this.vElement = new VElement({
      // here we add all the tiles of the game as VElement children
      tag: "div",
      attrs: { id: "gamescreen" },
      children: [
      ],
    });
    this.renderMap();
  }
  createMap(tileMap) {
    this.destroyableTiles = 0;
    for (let row = 0; row < this.rows; row++) {
      this.baseMap[row] = [];
      //this.explosionMap[row] = []
      for (let column = 0; column < this.columns; column++) {
        const tileCode = tileMap[row * this.columns + column]; // number of the tile to get from spritesheet
        const tileInitialObj = this.getMapTileInitial(tileCode);
        const x = column * this.tileSize;
        const y = row * this.tileSize;
        const tile = tileTranslator[tileInitialObj.TileIndex](x, y, ...tileInitialObj.IntitialSpritePos);
        this.baseMap[row][column] = tile;
        if (tile.destroyable) {
          this.destroyableTiles++;
        }
        //this.explosionMap[row][column] = 0 // to add explosion later
      }
    }
  }
  getMapTileInitial(tileCode) {
    return BACKEND_TILE_TYPE_CODES[tileCode];
  }
  renderMap() {
    for (const row of this.baseMap) {
      for (const tile of row) {
        this.vElement.addChild(tile.vElement);
      }
    }
  }
  getTilesOnWay(tilesToCheck) {
    const powerups = [];
    for (const tile of tilesToCheck) {
      const mapTile = this.baseMap[tile.row][tile.column]
      if (!mapTile.passable) {
        return false;
      } else {
        if (mapTile.powerup || mapTile.onFire) {
          powerups.push({ mapCoords: { row: tile.row, column: tile.column }, mapTile })
        }
      }
    }
    return powerups;
  }
  /**
   * 
   * @param {*} tilesToCheck 
   * @returns {Tile}
   */
  getTileToDestroy(tilesToCheck) {
    const tile = this.baseMap[tilesToCheck.row][tilesToCheck.column];
    tile.onFire = true;
    if (tile.passable) {
      return false;
    } else {
      return tile;
    }
  }
  removePowerUp({ row, column }) {
    this.baseMap[row][column].removePowerUp?.();
  }
  addTile() {

  }
}
