/* eslint-env es2022 */

let gamepadController = new (class {
  gamepads = [
    "054c-1000-Namtai Buzz",
    "054c-0002-Logitech Logitech Buzz(tm) Controller V1",
  ];

  started = false;
  buttonStates = new Map();

  constructor() {
    window.addEventListener("gamepadconnected", this);
  }

  handleEvent({ gamepad }) {
    let gamepadIndex = this.gamepads.indexOf(gamepad.id);

    let gamepadDiv = document.createElement("div");
    gamepadDiv.classList.add("gamepad");

    for (let index = 0; index < gamepad.buttons.length; index++) {
      let button = gamepad.buttons[index];
      let buttonDiv = document.createElement("div");
      buttonDiv.className = "button";
      buttonDiv.textContent = index;
      gamepadDiv.appendChild(buttonDiv);

      this.buttonStates.set(button, {
        pressed: button.pressed,
        div: buttonDiv,
        gamepad,
        index,
        buzzController: gamepadIndex * 4 + Math.floor(index / 5),
        buzzButton: index % 5,
      });
    }

    let displayDiv = document.getElementById("display");
    if (gamepadIndex == 1) {
      displayDiv.appendChild(gamepadDiv);
    } else {
      displayDiv.insertBefore(gamepadDiv, displayDiv.lastElementChild);
    }

    if (!this.started) {
      window.requestAnimationFrame(() => this.updateButtons());
      this.started = true;
    }
  }

  updateButtons() {
    for (let [button, state] of this.buttonStates) {
      if (button.pressed != state.pressed) {
        state.pressed = button.pressed;
        if (button.pressed) {
          window.dispatchEvent(new CustomEvent("buttondown", { detail: state }));
          broadcastChannel.postMessage({
            type: "buttondown",
            buzzController: state.buzzController,
            buzzButton: state.buzzButton,
          });
        } else {
          window.dispatchEvent(new CustomEvent("buttonup", { detail: state }));
          broadcastChannel.postMessage({
            type: "buttonup",
            buzzController: state.buzzController,
            buzzButton: state.buzzButton,
          });
        }
      }
    }
    window.requestAnimationFrame(() => this.updateButtons());
  }
});

class ControlBuzzController extends BuzzController {
  connectedCallback() {
    super.connectedCallback();

    this.scoreInput = this.querySelector(".score");

    this.addEventListener("mousedown", event => {
      let index = Object.values(this.buttons).indexOf(event.target);
      if (index >= 0) {
        this.onButtonDown(index);
        broadcastChannel.postMessage({
          type: "buttondown",
          buzzController: this.index,
          buzzButton: index,
        });
      }
    });

    this.addEventListener("mouseup", event => {
      let index = Object.values(this.buttons).indexOf(event.target);
      if (index >= 0) {
        this.onButtonUp(index);
        broadcastChannel.postMessage({
          type: "buttonup",
          buzzController: this.index,
          buzzButton: index,
        });
      }
    });

    this.querySelector(".scoreadjust").addEventListener("click", event => {
      this.score += parseInt(event.target.textContent, 10);
    });
  }

  get index() {
    return this._index;
  }

  set index(value) {
    this._index = value;
    this.buttons[0].textContent = Array.from(localStorage.emoji)[value];
    this.scoreInput.value = JSON.parse(localStorage.score)[value];
  }

  get score() {
    return parseInt(this.scoreInput.value, 10);
  }

  set score(value) {
    this.scoreInput.value = value;
    broadcastChannel.postMessage({ type: "score", buzzController: this.index, value });
    let scores = JSON.parse(localStorage.score);
    scores[this.index] = value;
    localStorage.score = JSON.stringify(scores);
  }

  onButtonDown(button) {
    this.buttons[button].classList.add("lit");
  }

  onButtonUp(button) {
    this.buttons[button].classList.remove("lit");
  }
}
customElements.define("control-buzz-controller", ControlBuzzController);

let controllersDiv = document.getElementById("controllers");
let buzzControllers = controllersDiv.querySelectorAll("control-buzz-controller");
for (let [i, controller] of Object.entries(buzzControllers)) {
  controller.index = i;
}

let answeringController;
let multiAnswers;
let startButton = document.getElementById("start");
let yesButton = document.getElementById("yes");
let noButton = document.getElementById("no");

let broadcastChannel = new BroadcastChannel("games");
broadcastChannel.addEventListener("message", function({ data }) {
  if (data.type == "answer") {
    answeringController = data.buzzController;
    yesButton.disabled = false;
    noButton.disabled = false;
    return;
  }
  if (data.type == "multi-answers") {
    multiAnswers = data.answers;
    for (let b of document.querySelectorAll("#multi button")) {
      b.disabled = false;
    }
  }
  console.log(data);
});

window.addEventListener("buttondown", function({ detail }) {
  detail.div.classList.add("pressed");
  buzzControllers[detail.buzzController].onButtonDown(detail.buzzButton);
});

window.addEventListener("buttonup", function({ detail }) {
  detail.div.classList.remove("pressed");
  buzzControllers[detail.buzzController].onButtonUp(detail.buzzButton);
});

startButton.addEventListener("click", function() {
  broadcastChannel.postMessage({ type: "start" });
  yesButton.disabled = true;
  noButton.disabled = true;
});

yesButton.addEventListener("click", function() {
  buzzControllers[answeringController].score += 50;
  yesButton.disabled = true;
  noButton.disabled = true;
  broadcastChannel.postMessage({ type: "start" });
});

noButton.addEventListener("click", function() {
  buzzControllers[answeringController].score -= 10;
  yesButton.disabled = true;
  noButton.disabled = true;
  broadcastChannel.postMessage({ type: "block", buzzController: answeringController });
});

for (let b of document.querySelectorAll("#multi button")) {
  b.addEventListener("click", event => {
    if (multiAnswers) {
      let value = event.target.id.substring(6);
      for (let [buzzController, answer] of multiAnswers) {
        if (answer == value) {
          buzzControllers[buzzController].score += 50;
        }
      }
      for (let b of document.querySelectorAll("#multi button")) {
        b.disabled = true;
      }
      multiAnswers = false;
      broadcastChannel.postMessage({ type: "stop" });
      setTimeout(() => broadcastChannel.postMessage({ type: "start" }), 5000);
    }
  });
}
