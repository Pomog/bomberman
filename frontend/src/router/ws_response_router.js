import { mainView } from "../app.js";
import { Player } from "../js_modules/models/playersModel.js";
import { playerActioner } from "../js_modules/player_actions/actionModel.js";
import { GAME_VIEW, WAITING_VIEW } from "../js_modules/consts/consts.js";
import { createNewMessageC } from "../components/chatC.js";
import { RegisterScreenView } from "../views/registerScreenView.js";
import { gameBoxModel } from "../views/gameBoxView.js";

function oneMessage(message) {
  return new VElement({
      tag: 'span',
      attrs: { class: "chatmessage" },
      content: message,
  });
}
export const wsResponseRouter = {
  usersInRoom(payload) {
    if (!mainView.isInRegisterState()) {
      console.error("illegal attempt to register, main view is not in register state");

    }
    if (!isSuccessPayload(payload)) {
      console.error("registerNewPlayer error: " + payload.data);
      if (payload.data === 'duplicate user name') {
        mainView.showError('user with this name already exists');
        mainView.chatModel.stop();
        mainView.delCurrentPlayer();
      }
      return
    }

    const players = [];
    payload.data.forEach(user => {
      if (user.playerName === mainView.currentPlayer.name) {
        mainView.currentPlayer.number = user.playerNumber;
        players.push(mainView.currentPlayer);
      } else {
        players.push(new Player(user.playerName, user.playerNumber));
      }
    });
    if(mainView.solo){
      mainView.addPlayers(mainView.currentPlayer)
      mainView.chatModel.requestServer("startGame", "");
    }else{
      mainView.showScreen[WAITING_VIEW](...players);
    }
  },

  registerNewPlayer(payload) {
    if (!isSuccessPayload(payload)) {
      console.error("Error in registerNewPlayer handler:", payload.data);
      return
    }

    let user = payload.data;
    if (user.playerName !== mainView.currentPlayer.name) {
      mainView.addPlayers(new Player(user.playerName, user.playerNumber))
    }
  },

  startGame(payload) {
    if (!isSuccessPayload(payload)) {
      console.error("Could not get random Game map from server:", payload.data);
      return;
    }
    let gameMapString = payload.data;
    console.log("Game map--", gameMapString);
    mainView.showScreen[GAME_VIEW](gameMapString);
  },

  userQuitChat(payload) {
    if (!isSuccessPayload(payload)) {
      console.error("Error in userQuitChat handler:", payload.data);
      return
    }
    const user = payload.data;
    Object.values(mainView.PlayerList.players).forEach((player) => {
      if (player.name === user.playerName) {
        mainView.delPlayers(player)
      } else if (player.number > user.playerNumber) {
        player.number--;
      }
    });
    
  },

  inputChatMessage(payload) {
    if (!isSuccessPayload(payload)) {
      console.error("Error in inputChatMessage handler:", payload.data);
      return
    }
    const mess = payload.data;

    let formatedDate = mess.dateCreate.slice(11, 19)

    const newMessage = createNewMessageC(formatedDate, mess.userName, mess.content);
    mainView.chatModel.chatMessageArea.addChild(newMessage);
    newMessage.$elem.scrollIntoView();
  },

  sendMessageToChat(payload) {
    //
  },

  playerAction(payload) {
    if (!isSuccessPayload(payload)) {
      console.error("Error in playerAction handler:", payload.data);
      return
    }
    playerActioner[payload.data.action.type].handle(payload.data)
  },
};

function isSuccessPayload(payload) {
  if (payload.result !== "success") {
    return false
  }
  return true
}
