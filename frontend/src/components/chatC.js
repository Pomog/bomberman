
import { VElement } from "../../../framework/VElement.js";
import { mainView } from "../app.js";
import { CHAT_MESSAGE_FORM_INPUT_NAME } from "../js_modules/consts/consts.js";

export function createChatMessageArea() {
  return new VElement({
    tag: 'div',
    attrs: { id: 'chatmessagearea' },
    style: { overflow: "auto" },
    children: [
      // chat messages here, new messages as addChild
      new VElement({
        tag: 'div',
        attrs: { class: 'chatmessage', id: 'ChatStatusConnected' },
        content: "Connected to chat...",
      })
    ]
  });
}

export function createNewMessageC(date, userName, content) {
  return new VElement({
    tag: "p",
    content: date + ` ${userName}: ` + ` ${content}`
  });
}

export function createChatC(sendMessage) {
  return new VElement({
    tag: "div",
    attrs: { id: "chat" },
    children: [
      // chatheader
      new VElement({
        tag: 'p',
        attrs: { id: 'chatheader' },
        content: 'Chat'
      }),
      //ChatMessageArea(), will be added in chatModel.js
      // chat form
      new VElement({
        tag: "form",
        attrs: { id: "chatform" },
        children: [
          new VElement({
            tag: "input",
            attrs: { type: "text", id: "chattextarea", name: CHAT_MESSAGE_FORM_INPUT_NAME, autocomplete: "off", placeholder: 'Type here...' },
          }),
          new VElement({
            tag: "input",
            attrs: { type: "Submit", id: 'sendmessagebutton', class: 'material-symbols-outlined', value: 'send' },
          }),
        ],
        '@submit.prevent': (velem, event) => {

          const chatMessage = event.target[CHAT_MESSAGE_FORM_INPUT_NAME].value
          sendMessage(chatMessage)
          event.target[CHAT_MESSAGE_FORM_INPUT_NAME].value = "";
          if (mainView.gameMap) { event.target[CHAT_MESSAGE_FORM_INPUT_NAME].blur(); }
          // send message to backend via 'ws.request()'
          // in ws_response_router, add the new message into the chatMessageArea VElement with addChild() method

        }
      }),
    ],
  });
}