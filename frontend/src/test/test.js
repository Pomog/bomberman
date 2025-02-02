
import { mainView } from "../app.js";
import { tileTranslator } from "../js_modules/models/map/tileModel.js";
import { Player } from "../js_modules/models/playersModel.js";


export function testTileTranslator() {
    console.log(tileTranslator[45](0, 0, 0, 0))
}

//export const juice = new Player("juice", 1);

export function testGameBox() {
    
    mainView.showScreen[GAME_VIEW]();
    juice.renderPlayer(mainView.currentViewModel);
}
