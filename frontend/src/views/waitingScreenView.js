import { createWaitingScreenC, createPlayerC, createWaitingListC } from "../components/welcomeScreenComponents/waitingScreenC.js"
import { createWaitingTimerC, createWaitingTimer10secC, createWaitingTimer20secC } from "../components/welcomeScreenComponents/waitingScreenC.js";
import { mainView } from "../app.js";
import { START_IN, WAIT_FOR_PLAYERS } from "../js_modules/consts/consts.js";

//this object contains components that could be used in other components
export class WaitingScreenView {
    constructor(...players) {
        this.waitingListC = createWaitingListC();
        this.waitingTimer20secC = createWaitingTimer20secC();
        this.waitingTimer10secC = createWaitingTimer10secC();
        this.WaitingTimerC = createWaitingTimerC(this.waitingTimer20secC);
        this.waitingScreenC = createWaitingScreenC(this.waitingListC, this.WaitingTimerC);

        for (const player of players) {
            this.waitingListC.addChild(createPlayerC(player.name, player.number));
        }
        //TODO >=1 for test, should be >1
        if (players.length > 1 && players.length < 4) {
            this.countdown20sec(WAIT_FOR_PLAYERS);
        }
        if (players.length === 4) {
            this.startTimer10sec();
        }
    }

    get vElement() {
        return this.waitingScreenC
    }

    showError = (text) => {
    }

    hideError = () => {
    }

    /**
     * 
     * @param {Player} player 
     */
    addPlayers(...players) {
        for (const player of players) {
            this.waitingListC.addChild(createPlayerC(player.name, player.number));
        }
        if (mainView.PlayerList.length > 1 && mainView.PlayerList.length < 4) {
            if (this.timeoutID) {
                clearTimeout(this.timeoutID);
            }
            setTimeout(this.countdown20sec, 0, WAIT_FOR_PLAYERS);

        }
        if (mainView.PlayerList.length === 4) {
            if (this.timeoutID) {
                clearTimeout(this.timeoutID);
            }
            setTimeout(this.startTimer10sec(), 0);
        }

    }

    delPlayers(...players) {
        const oldChildren = this.waitingListC.children;
        let newChildren = [];

        const isInPlayersList = function (playerNumber) {
            for (const player of players) {
                if (player.number == playerNumber) {
                    return true;
                }
            }
            return false;
        }
        for (const child of oldChildren) {
            let number = child.attrs.id.substring(2)
            if (!isInPlayersList(number)) {
                newChildren.push(child);
            }
        }
        this.waitingListC.children = newChildren;
    }

    countdown10sec = (waiting10sec) => {
        if (waiting10sec > 0) {
            waiting10sec--;
            this.waitingTimer10secC.content = waiting10sec;
            if (waiting10sec === 0) {
                mainView.chatModel.requestServer("startGame", "");
            } else {
                this.timeoutID = setTimeout(this.countdown10sec, 1000, waiting10sec);
            }
        }

    }

    countdown20sec = (waiting20sec) => {
        if (waiting20sec > 0) {
            waiting20sec--;
            this.waitingTimer20secC.content = waiting20sec;
            if (waiting20sec === 0) {
                this.startTimer10sec();
                return;
            }
            this.timeoutID = setTimeout(this.countdown20sec, 1000, waiting20sec); // Schedule the next iteration after 1 second
        }
    }

    startTimer10sec() {
        mainView.chatModel.socket.request("readyToStart")
        this.WaitingTimerC.content = "Game starts in...";
        this.WaitingTimerC.delChild(0);
        this.WaitingTimerC.addChild(this.waitingTimer10secC);
        this.countdown10sec(START_IN);
    }
    stopCountdowns() {
        clearTimeout(this.timeoutID)
    }
}