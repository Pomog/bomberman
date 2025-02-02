import { VElement } from "../../../../framework/VElement.js";
import { PLAYER_NAME_FORM_INPUT } from "../../js_modules/consts/consts.js";

export function createErrorMessageC() {
    return new VElement({
        tag: 'div',
        attrs: { id: 'error', class: 'errormessage hide' },
    });
}
export function createRegisterScreenC(registerPlayer, registerSoloPlayer, errorMessageC) {
    return new VElement({
        tag: 'div',
        attrs: { id: 'welcome', class: 'welcomescreens' },
        children: [
            new VElement({ tag: 'p', attrs: { id: "welcometothegame" }, content: 'Welcome to the game!' }),
            new VElement({ tag: 'span', attrs: { class: "welcometext" }, content: 'Choose your nickname:' }),
            errorMessageC,
            createFormElement(registerPlayer, registerSoloPlayer)
        ]
    });
}

function limitCharacters(event, maxLength) {
    const inputText = event.target.value;
    if (inputText.length > maxLength) {
        event.target.value = inputText.slice(0, maxLength);
    }
}

function createFormElement(registerPlayer, registerSoloPlayer) {
    return new VElement({
        tag: "form",
        attrs: { id: "chooseName" },
        children: createFormChildren(registerPlayer, registerSoloPlayer),
        "@submit.prevent": (velem, event) => {
            const playerName = event.target[PLAYER_NAME_FORM_INPUT].value;

            registerPlayer(playerName)
        },
    });
}

function createFormChildren(registerPlayer, registerSoloPlayer) {
    return [
        new VElement({
            tag: 'input',
            attrs: { required: "", type: 'text', autofocus: "", id: 'chooseusername', autocomplete: "off", name: PLAYER_NAME_FORM_INPUT },
            "@input": (velem, event) => {
                limitCharacters(event, 15) // Limits the number of nickname symbols to 15
            },
        }),
        
        new VElement({
            tag: 'input',
            attrs: { type: 'button', class: "startgame", value: 'Start' },
            "@click": (velem, event) => {
                const playerName = event.target.form[PLAYER_NAME_FORM_INPUT].value;

                registerPlayer(playerName)
            },
        }),
        new VElement({
            tag: 'input',
            attrs: { type: 'button', id: "trainingbutton", value: 'Training mode' },
            "@click": (velem, event) => {
                const playerName = event.target.form[PLAYER_NAME_FORM_INPUT].value;

                registerSoloPlayer(playerName)
            },
        }),
    ];
}
