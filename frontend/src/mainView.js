import { VElement } from "../../framework/VElement.js";
import { createHeaderC } from "./components/headerC.js";
import { ChatModel } from "./js_modules/models/ws/chatModel.js";
import { gameBoxModel } from "./views/gameBoxView.js";
import { GameMap } from "./js_modules/models/map/mapModel.js";
import { Player } from "./js_modules/models/playersModel.js";
import { RegisterScreenView } from "./views/registerScreenView.js";
import { WaitingScreenView } from "./views/waitingScreenView.js";
import { GAME_OVER_VIEW, GAME_VIEW, REGISTER_VIEW, WAITING_VIEW, YOU_WIN_VIEW } from "./js_modules/consts/consts.js";
import { GameOverScreen, YouWonScreen } from "./components/gameScreenComponents/gameBoxComponents/gameOverC.js";

export class MainView {
    constructor() {
        this.HeaderC = createHeaderC();
        this.chatModel = new ChatModel;
        this.currentViewModel = new RegisterScreenView;
        this.currentViewChildIndex = 1;
        this.solo = false;
        this.vElement = new VElement({
            tag: 'div',
            attrs: { id: "main" },
            children: [
                this.HeaderC, this.currentViewModel.vElement
                // HeaderC, gameBoxC
                // can put chatC into this component as well so view changes don't affect the chat element
            ],
        });

        this._newPlayerList();
    }

    _newPlayerList() { this.PlayerList = { players: {}, length: 0 } }

    isInRegisterState() {
        if (this.currentViewModel instanceof RegisterScreenView) {
            return true;
        }
        return false;
    }

    showScreen = {
        [WAITING_VIEW]: (...players) => {
            for (const player of players) {
                this.PlayerList.players[player.name] = player
                this.PlayerList.length = Object.keys(this.PlayerList.players).length
            }
            this._showNewView(new WaitingScreenView(...players));
            this.vElement.addChild(this.chatModel.vElement);
        },
        [GAME_VIEW]: (gameMapString) => {
            this.gameMap = new GameMap(gameMapString)
            this._showNewView(new gameBoxModel(this.gameMap, this.PlayerList.players));
            this.renderPlayers()
        },
        [GAME_OVER_VIEW]: () => {
            this._newPlayerList();
            this.gameMap = null;
            this.currentViewModel.vElement.addChild(GameOverScreen())
        },
        [YOU_WIN_VIEW]: () => {
            this._newPlayerList();
            this.gameMap = null;
            this.currentViewModel.vElement.addChild(YouWonScreen())
        },
        [REGISTER_VIEW]: () => {
            this.chatModel.stop(1000);
            this.chatModel.clearChatArea();
            this.vElement.delChild(this.chatModel.vElement.vId);
            this._showNewView(new RegisterScreenView);
        }
    }
    _showNewView(newView) {
        this.vElement.replaceChild(this.currentViewChildIndex, newView.vElement);
        this.currentViewModel = newView;

    }

    renderPlayers = () => {
        Object.values(this.PlayerList.players).forEach(player => {
            player.renderPlayer(this.gameMap)
        })
        //TODO next row is for test
        //Object.values(this.PlayerList.players)[0].renderPlayer(this.gameMap);

    }

    showError = (text) => {
        this.currentViewModel.showError(text);
    }

    hideError = () => {
        this.currentViewModel.hideError();
    }

    createCurrentPlayer = (playerName) => {
        this.currentPlayer = new Player(playerName);
    }

    delCurrentPlayer = () => {
        this.currentPlayer = undefined;
    }
    addPlayers(...players) {
        for (const player of players) {
            console.log(player)
            this.PlayerList.players[player.name] = player
            this.PlayerList.length++;
        }
        console.log("main this.addPlayers players", this.PlayerList.length)
        if (this.currentViewModel instanceof WaitingScreenView) {
            this.currentViewModel.addPlayers(...players);
        }
        //return players
    }
    delPlayers(...players) {
        for (const player of players) {
            if (this.currentViewModel instanceof gameBoxModel) {
              this.gameMap.vElement.delChild(
                this.PlayerList.players[player.name].vElement.vId
              );
              delete this.PlayerList.players[player.name];
              this.PlayerList.length--;
              if (!this.solo && Object.keys(this.PlayerList.players).length == 1) {
                // check win condition
                if (this.PlayerList.players[this.currentPlayer.name]) {
                  this.showScreen[YOU_WIN_VIEW]();
                }
              }
              return
            }
            delete this.PlayerList.players[player.name]
            this.PlayerList.length--;
            
        }
        if (this.currentViewModel instanceof WaitingScreenView) {
            this.currentViewModel.delPlayers(...players);
            if (this.PlayerList.length == 1) {
              // stop countdown if length of players is 1
              this.currentViewModel.stopCountdowns();
            }
            if (this.PlayerList.length > 0)
              this.showScreen[WAITING_VIEW](
                // prevents game starting if one player is left after others leave
                ...Object.values(this.PlayerList.players)
              );
        }
    }
}