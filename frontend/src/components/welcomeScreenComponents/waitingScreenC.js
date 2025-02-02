import { VElement } from "../../../../framework/VElement.js";
import { reactives } from "../../../../framework/functions.js";

const yes = () => { console.log("yeeee") }


reactives.push(yes)

export function createPlayerC(playerName, playerNumber) {
  return new VElement({
    tag: 'p',
    attrs: { id: `pl${playerNumber}` },
    content: `${playerNumber} -- ${playerName}`,
  });
}
export function createWaitingListC() {
  return new VElement({
    tag: 'span',
    content: `People ready: `,
    attrs: { class: 'welcometext', },
  });
}

export function createWaitingTimerC(waitingTimerXsecC) {
  return new VElement({
    tag: 'span',
    content: 'Waiting...',
    attrs: { class: 'welcometext', },
    children: [
      waitingTimerXsecC,
    ],
  });
}

export function createWaitingTimer20secC() {
  return new VElement({
    tag: 'span',
    //content: '20 seconds', // Should be automatically replaced if design.js file is attached correctly
    attrs: { id: 'waiting20sec' },
  });
}

export function createWaitingTimer10secC() {
  return new VElement({
    tag: 'span',
    content: '10', // Should be automatically replaced if design.js file is attached correctly
    attrs: { id: 'waiting10sec' },
  });
}



// export function createWaitingScreen10secC(t10seccountdownC) {
//   return new VElement({
//     tag: "div",
//     attrs: { id: 'countdowntostart', class: 'welcomescreens' },
//     children: [
//       createWaitingTimer10secC(t10seccountdownC),
//     ]
//   });
// }

export function createWaitingScreenC(waitingListC, waitingTimerC) {
  return new VElement({
    tag: "div",
    attrs: { id: 'waiting', class: 'welcomescreens' },
    children: [
      waitingListC,
      waitingTimerC,
    ]
  });
}

// mustkass, commit e8e04b214a03dcf5892785f0b3b7de8f506ee303

/* function createWaitingTimerC(waitingTimer20secC) {
  return new VElement({
    tag: 'span',
    content: 'Waiting...',
    attrs: { class: 'welcometext', },
    children: [
      waitingTimer20secC,
    ],
  });
}

function createWaitingTimer10secC(t10seccountdownC) {
  return new VElement({
    tag: 'span',
    content: 'Game starts in...',
    attrs: { class: 'welcometext', },
    children: [
      t10seccountdownC,
    ],
  });
}



*/