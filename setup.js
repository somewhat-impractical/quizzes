/* eslint-env es2022 */

const ALL_EMOJI = Array.from(
  "🐀🐁🐂🐄🐅🐆🐇🐈🐉🐊🐋🐌🐍🐎🐏🐐🐑🐒🐓🐕🐖🐘" +
  "🐙🐛🐝🐞🐟🐠🐢🐤🐦🐩🐪🐫🐬🐳🐿🦀🦂🦃🦆🦇🦈🦉" +
  "🦋🦎🦐🦑🦒🦕🦖🦗🦘🦙🦚🦛🦜🦞🦢🦥🦦🦩🦫🦬"
);

class BuzzController extends HTMLElement {
  static buttonColours = ["red", "yellow", "green", "orange", "blue"];

  connectedCallback() {
    let div = this.appendChild(document.createElement("div"));
    div.classList.add("roundbutton", "red");

    for (let i = 4; i >= 1; i--) {
      div = this.appendChild(document.createElement("div"));
      div.classList.add("squarebutton", BuzzController.buttonColours[i]);
    }

    this.buttonDivs = [
      this.children[0],
      this.children[4],
      this.children[3],
      this.children[2],
      this.children[1],
    ];

    this.addEventListener("mousedown", function(event) {
      let index = this.buttonDivs.indexOf(event.target);
      if (index >= 0) {
        this.onButtonDown(index);
      }
    });

    this.addEventListener("mouseup", function(event) {
      let index = this.buttonDivs.indexOf(event.target);
      if (index >= 0) {
        this.onButtonUp(index);
      }
    });
  }

  get index() {
    return this._index;
  }

  set index(value) {
    this._index = value;
    if (localStorage.emoji) {
      this.emoji = Array.from(localStorage.emoji)[value];
      this._emojiIndex = ALL_EMOJI.indexOf(this.emoji);
    } else {
      this._emojiIndex = Math.floor(Math.random() * ALL_EMOJI.length);
      this.emoji = ALL_EMOJI[this._emojiIndex];
    }
  }

  get emoji() {
    return this.buttonDivs[0].textContent;
  }

  set emoji(value) {
    this.buttonDivs[0].textContent = value;
  }

  onButtonDown(button) {
    this.buttonDivs[button].classList.add("lit");
    if (button == 4) {
      if (--this._emojiIndex == -1) {
        this._emojiIndex += ALL_EMOJI.length;
      }
      this.emoji = ALL_EMOJI[this._emojiIndex];
    } else if (button == 1) {
      if (++this._emojiIndex == ALL_EMOJI.length) {
        this._emojiIndex -= ALL_EMOJI.length;
      }
      this.emoji = ALL_EMOJI[this._emojiIndex];
    }
  }

  onButtonUp(button) {
    this.buttonDivs[button].classList.remove("lit");
  }
}
customElements.define("buzz-controller", BuzzController);

let controllersDiv = document.getElementById("controllers");
let buzzControllers = controllersDiv.querySelectorAll("buzz-controller");
for (let [i, controller] of Object.entries(buzzControllers)) {
  controller.index = i;
}

let broadcastChannel = new BroadcastChannel("games");
broadcastChannel.addEventListener("message", function({ data }) {
  let { type, buzzController, buzzButton } = data;
  switch (type) {
    case "buttondown":
      controllersDiv.children[buzzController].onButtonDown(buzzButton);
      break;
    case "buttonup":
      controllersDiv.children[buzzController].onButtonUp(buzzButton);
      break;
    case "start":
      localStorage.emoji = Array.from(controllersDiv.children, bc => bc.emoji).join("");
      break;
  }
});

// class FFFController extends BuzzController {
//   order = new Set();

//   connectedCallback() {
//     this.orderDivs = [];
//     for (let i = 0; i < 4; i++) {
//       let div = this.appendChild(document.createElement("div"));
//       div.classList.add("squarebutton");
//       this.orderDivs.push(div);
//     }
//   }

//   onButtonDown(button) {
//     let index = this.buttons.indexOf(button);
//     if (index == 0) {
//       return;
//     }
//     this.order.add(index);
//     let answer = [...this.order.values()];
//     for (let i = 0; i < answer.length; i++) {
//       this.orderDivs[i].classList.add(Controller.buttonColours[answer[i]], "lithidden");
//     }
//     if (answer.length == 4) {
//       console.log(`controller ${this.id} set order ${[...this.order.values()]}`);
//     }
//   }

//   onButtonUp(button) {
//   }
// }
// customElements.define("fff-controller", FFFController);

// function reveal() {
//   let answer = [3, 1, 2, 4];
//   for (let controller of document.querySelectorAll("fff-controller")) {
//     let buttons = controller.querySelectorAll(".squarebutton");
//     for (let i = 0; i < 4; i++) {
//       buttons[i].classList.remove("lithidden");
//       buttons[i].classList.add([...controller.order][i] == answer[i] ? "lit" : "outline");
//     }
//   }
// }
