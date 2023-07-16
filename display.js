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
        this.state = "started";
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
