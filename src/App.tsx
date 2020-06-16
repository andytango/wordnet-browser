import * as React from "react";
import sqlData from "./data/sqlite-wordnet.sqlite";

let worker = new Worker("../node_modules/sql.js/dist/worker.sql-wasm-debug.js");

worker.addEventListener("message", ({ data }) => {
  console.debug(`[WORKER] ${JSON.stringify(data)}`);
});

window
  .fetch(sqlData)
  .then((res) => res.arrayBuffer())
  .then((sqlFile) => {
    console.info(`Database size: ${sqlFile.byteLength}`);
    const t1 = performance.now();
    
    worker.postMessage({
      id: 1,
      action: "open",
      buffer: sqlFile,
    });

    const handleResponse = ({ data: { id } }) => {
      if (id === 1) {
        console.info(`Database loaded in ${performance.now() - t1}ms`);
        worker.removeEventListener("message", handleResponse);
        worker.postMessage({
          id: 2,
          action: "exec",
          sql: `select * from words limit 10`,
        });
      }
    };

    worker.addEventListener("message", handleResponse);
  });

worker.onerror = (e) => console.log("Worker error: ", e);

function App() {
  return <>Hello world</>;
}

export default App;
