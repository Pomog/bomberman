import { VElement } from "../../../../../framework/VElement.js";
import { mainView } from "../../../app.js";
import { REGISTER_VIEW } from "../../../js_modules/consts/consts.js";

function youDied(playerList) {
    return new VElement({
        tag: "span",
        attrs: { id: "youdied" },
        content: "You died",
    });
}
function helperdiv(playerList) {
    return new VElement({
        tag: "span",
        attrs: { id: "helpdivyoudied" },
        content: "You died",
    });
}
export function GameOverScreen(playerList) {
    return new VElement({
        tag: "div",
        attrs: { id: "gameover" },
        children: [
            helperdiv(),
            youDied(),
        ],
        "@click": (velem, event) => {
            mainView.showScreen[REGISTER_VIEW]();
        },
    });
}
function youWon(playerList) {
    return new VElement({
        tag: "span",
        attrs: { id: "youwon" },
        content: "You Won!",
    });
}
function helperdivWon(playerList) {
    return new VElement({
        tag: "span",
        attrs: { id: "helpdivyouwon" },
        content: "You Won!",
    });
}

export function YouWonScreen(playerList) {
    return new VElement({
        tag: "div",
        attrs: { id: "youwonthegame" },
        children: [helperdivWon(), youWon()],
        "@click": (velem, event) => {
            mainView.showScreen[REGISTER_VIEW]();
        },
    });
}
