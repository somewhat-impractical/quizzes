/* eslint-env es2022 */

let letter = document.getElementById("letter");

let updating = false;
let update = () => {
  letter.textContent = String.fromCharCode(65 + parseInt(letterSize.clientWidth, 10) % 26);
  if (updating) {
    requestAnimationFrame(update);
  }
};

let letterSize = document.getElementById("letterSize");
letterSize.addEventListener("transitionstart", () => {
  updating = true;
  update();
});
letterSize.addEventListener("transitionend", () => {
  updating = false;
});

function randomise() {
  letterSize.style.width = Math.floor(Math.random() * 130) + "px";
  game.state = "started";
}

/* eslint-env es2022 */

let buzzControllers = document.body.querySelectorAll("buzz-controller");
for (let [i, controller] of Object.entries(buzzControllers)) {
  controller.index = i;
}

let game = {
  state: "stopped",
  blocked: new Set(),

  handleEvent({ data }) {
    let { type, buzzController, buzzButton } = data;
    switch (type) {
      case "start":
        for (let controller of buzzControllers) {
          controller.reset();
        }
        this.blocked.clear();
        this.state = "spinning";
        randomise();
        break;
      case "buttondown":
        if (this.state == "started" && !this.blocked.has(buzzController) && buzzButton == 0) {
          buzzControllers[buzzController].light();
          this.state = "answer";
          broadcastChannel.postMessage({
            type: "answer",
            buzzController,
          });
        }
        break;
      case "block":
        this.blocked.add(buzzController);
        buzzControllers[buzzController].reset();
        this.state = "started";
        break;
      case "score":
        buzzControllers[buzzController].score = data.value;
        break;
    }
  }
};

let broadcastChannel = new BroadcastChannel("games");
broadcastChannel.addEventListener("message", game);
