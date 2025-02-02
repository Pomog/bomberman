import { createChatC, createChatMessageArea } from "../../../components/chatC.js"
import Socket from "./webSocketModel.js";

export class ChatModel {
    constructor() {
        this.chatC = createChatC(this.sendChatMessage);
        this.chatMessageArea = createChatMessageArea();
        this.chatC.addChild(this.chatMessageArea);
    }
    get vElement() { return this.chatC; }

    launch(playerName) {
        this.socket = new Socket(`joinGame?name=${playerName}`);
    }

    stop(code) {
        this.socket.closeWebsocket(code);
    }

    requestServer(type, payload) {
        this.socket.request(type, payload);
    }

    sendChatMessage = (text) => {
        this.socket.request("sendMessageToChat", { content: text, dateCreate: new Date() })
    }

    clearChatArea = () => {
        this.chatC.delChild(this.chatMessageArea.vId)
        this.chatMessageArea = createChatMessageArea();
        this.chatC.addChild(this.chatMessageArea);}
}