/* eslint-env es2022 */

let buzzControllers = document.body.querySelectorAll("buzz-controller");
for (let [i, controller] of Object.entries(buzzControllers)) {
  controller.index = i;
}

let game = {
  state: "stopped",
  answers: new Map(),

  handleEvent({ data }) {
    let { type, buzzController, buzzButton } = data;
    switch (type) {
      case "start":
        for (let controller of buzzControllers) {
          controller.reset();
          controller.buttons.blue.classList.add("lit");
          controller.buttons.orange.classList.add("lit");
          controller.buttons.green.classList.add("lit");
          controller.buttons.yellow.classList.add("lit");
        }
        this.state = "started";
        this.answers.clear();
        break;
      case "buttondown":
        if (this.state == "started" && buzzButton != 0 && !this.answers.has(buzzController)) {
          buzzControllers[buzzController].buttons.blue.classList.remove("lit");
          buzzControllers[buzzController].buttons.orange.classList.remove("lit");
          buzzControllers[buzzController].buttons.green.classList.remove("lit");
          buzzControllers[buzzController].buttons.yellow.classList.remove("lit");
          this.answers.set(Number(buzzController), buzzButton);
          if (this.answers.size == buzzControllers.length) {
            broadcastChannel.postMessage({
              type: "multi-answers",
              answers: this.answers,
            });
          }
        }
        break;
      case "stop":
        for (let controller of buzzControllers) {
          let answer = this.answers.get(Number(controller.index));
          if (answer) {
            controller.buttons[answer].classList.add("lit");
          }
        }
        break;
      case "score":
        buzzControllers[buzzController].score = data.value;
        break;
    }
  }
};

let broadcastChannel = new BroadcastChannel("games");
broadcastChannel.addEventListener("message", game);
