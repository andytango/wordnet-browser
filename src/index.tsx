import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import { initDb } from "./db";

initDb();

var mountNode = document.getElementById("app");

ReactDOM.render(<App />, mountNode);
