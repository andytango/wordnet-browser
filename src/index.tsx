import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import { initDb } from "./db";
import "./index.css";


initDb()

var mountNode = document.getElementById("app");

ReactDOM.render(<App />, mountNode);
