// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html";
import "./chat_socket";

import { ChatProps } from "./Chat";
import { CustomHooks } from "./app.types";
import { LiveSocket } from "phoenix_live_view";
// Establish Phoenix Socket and LiveView configuration.
import { Socket } from "phoenix";
import footerText from "./footerText";
import mount from "./mount";
import topbar from "../vendor/topbar";

// create the hooks object.
let Hooks = {} as CustomHooks;

// create the Chat hook.
Hooks.Chat = {
  mounted() {
    this.handleEvent("client.add-message", ({ messages }) => {
      mount(this.el.id, this.getProps(messages));
    });

    this.unmountComponent = mount(this.el.id, this.getProps());
  },

  destroyed() {
    if (!this.unmountComponent) {
      console.error("Greeter unmountComponent not set");
      return;
    }

    this.unmountComponent();
  },

  addMessage(message: string) {
    this.pushEventTo(this.el, "add-message", { message });
  },

  getProps(messages: string[]): ChatProps {
    return {
      messages: messages,
      addMessage: this.addMessage.bind(this),
    };
  },
};

let csrfToken = document
  .querySelector("meta[name='csrf-token']")
  ?.getAttribute("content");
let liveSocket = new LiveSocket("/live", Socket, {
  params: { _csrf_token: csrfToken },

  // add the hooks object to the LiveSocket configuration.
  hooks: Hooks,
});

const footer = document.getElementById("footer");

if (footer !== null) {
  footer.innerHTML = footerText();
}

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" });
window.addEventListener("phx:page-loading-start", (_info) => topbar.show(300));
window.addEventListener("phx:page-loading-stop", (_info) => topbar.hide());

// connect if there are any LiveViews on the page
liveSocket.connect();

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()

window.liveSocket = liveSocket;

declare global {
  interface Window {
    liveSocket: LiveSocket;
  }
}
