import { MAP_TILE_SIZE, SPRITESHEET_COLUMNS } from "../js_modules/consts/consts.js";


/**
 * 
 * @param {number} tileIndex 
 * @returns [x, y] coords of the sprite in sprite sheet
 */

export function getSpriteSheetXYbyIndex(tileIndex) {
  return [
    -(tileIndex % SPRITESHEET_COLUMNS) * MAP_TILE_SIZE,
    -Math.floor(tileIndex / SPRITESHEET_COLUMNS) * MAP_TILE_SIZE,
  ];
}


export function spriteSheetXYtoStyleString(spriteOffsetX, spriteOffsetY) {
  return `${spriteOffsetX}px ${spriteOffsetY}px`;
}

export function convertRowColumnToXY(row, column) {
  return [column*MAP_TILE_SIZE, row*MAP_TILE_SIZE]
}