/* eslint-env es2022 */

class BuzzController extends HTMLElement {
  static buttonColours = ["red", "yellow", "green", "orange", "blue"];

  connectedCallback() {
    this.appendChild(document.getElementById("buzz-controller-template").content.cloneNode(true));
    this.buttons = {};
    for (let [i, colour] of Object.entries(BuzzController.buttonColours)) {
      this.buttons[i] = this.querySelector("." + colour);
      this.buttons[colour] = this.querySelector("." + colour);
    }
    this.scoreDiv = this.querySelector(".score");

    this.scoreSize = document.body.appendChild(document.createElement("div"));
    this.scoreSize.classList.add("scoresize");

    let updating = false;
    let update = () => {
      this.scoreDiv.textContent = parseInt(this.scoreSize.clientWidth, 10) - 1000;
      if (updating) {
        requestAnimationFrame(update);
      }
    };

    this.scoreSize.addEventListener("transitionstart", () => {
      updating = true;
      update();
    });
    this.scoreSize.addEventListener("transitionend", () => {
      updating = false;
    });
  }

  get index() {
    return this._index;
  }

  set index(value) {
    this._index = value;
    this.emoji = Array.from(localStorage.emoji)[value];
    this.scoreDiv.textContent = this.score = JSON.parse(localStorage.score)[value];
  }

  get emoji() {
    return this.buttons.red.textContent;
  }

  set emoji(emoji) {
    this.buttons.red.textContent = emoji;
  }

  get score() {
    return parseInt(this.scoreSize.style.width, 10) - 1000;
  }

  set score(value) {
    this.scoreSize.style.width = (1000 + value) + "px";
  }

  light(button) {
    this.buttons.red.classList.add("outline");
  }

  reset(button) {
    this.buttons.red.classList.remove("outline");
  }
}
customElements.define("buzz-controller", BuzzController);
