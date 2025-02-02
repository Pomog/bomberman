import { animate } from "../animation/animate.js";
import { mainView } from "../app.js";
import { createGameBoxC } from "../components/gameScreenComponents/gameBoxC.js";
import { GAME_TIME } from "../js_modules/consts/consts.js";
import { listenPlayerActions } from "../js_modules/player_actions/keypresses.js";

//this object contains components that could be used in other components
export class gameBoxModel {
    constructor(gameMap, playerList) {

        this.gameBoxC = createGameBoxC(gameMap.vElement, playerList);

        requestAnimationFrame(animate);
        listenPlayerActions();
        // this.startTimer(GAME_TIME);
    }

    get vElement() {
        return this.gameBoxC;
    }

    startTimer(timer) {
        if (timer > 0) {
            timer--;
            this.waitingTimer10secC.content = timer;
            if (timer === 0) {
                mainView.chatModel.requestServer("startGame", "");
            } else {
                this.timeoutID = setTimeout(this.countdown10sec, 1000, timer);
            }
        }
    }

    stopCountdowns() {
        clearTimeout(this.timeoutID)
    }
}