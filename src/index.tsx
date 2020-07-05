import "react-hot-loader";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from "./components/App";
import "./index.css";
import store from "./store";

var mountNode = document.getElementById("app");

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  mountNode
);

// @ts-expect-error
if (module.hot) {
  module.hot.accept();
}
