import { mainView } from "../app.js";
import { actionSender, eventSender } from "../js_modules/player_actions/actionSender.js";
import { currentAction } from "../js_modules/player_actions/keypresses.js";
import { currentEvent } from "../js_modules/player_actions/eventModel.js";

const frameDuration = 1000 / 60; // Duration of each frame in milliseconds for 60 FPS
let lastFrameTime = 0;
let accumulator = 0;

export function animate(timestamp) {
  let deltaTime = timestamp - lastFrameTime;
  lastFrameTime = timestamp;
  accumulator += deltaTime;
  // Update game state at fixed intervals
  while (accumulator >= frameDuration) {
    update();
    accumulator -= frameDuration;
  }

  draw();
  requestAnimationFrame(animate);
}

function update() {
    // update player position based on key press or events
    updatePlayerPosition();
}

function updatePlayerPosition() {
    if (currentEvent) {
        eventSender(currentEvent);
        return;
    }
    if (currentAction) {
        actionSender(currentAction);
    }
}

function draw() {
  drawPlayerPositions();
}

function drawPlayerPositions() {
    Object.keys(mainView.PlayerList.players).forEach((player) => {
        mainView.PlayerList.players[player].setVPosition();
        mainView.PlayerList.players[player].setVAnimation();
    });
}
