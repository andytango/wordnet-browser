import sqlData from "./data/sqlite-wordnet.sqlite";

export function initDb() {
  const worker = initWorker();
  loadSqliteFile(worker);
}

type DbWorker = Worker;

function initWorker() {
  const worker = new Worker(
    "../node_modules/sql.js/dist/worker.sql-wasm-debug.js"
  ) as DbWorker;

  worker.addEventListener("message", handleworkerMessage);
  worker.addEventListener("error", handleWorkerError);

  return worker;
}

function handleworkerMessage(e: MessageEvent) {
  console.debug("[DB WORKER]", e.data);
}

function handleWorkerError(e: ErrorEvent) {
  console.error("[DB WORKER]", e.error);
}

type SqliteFile = ArrayBuffer;

async function loadSqliteFile(worker: DbWorker) {
  const t0 = performance.now();
  const res = await fetch(sqlData);
  const sqlFile: SqliteFile = await res.arrayBuffer();
  console.info(`Database downloaded in ${Math.round(performance.now() - t0)}ms`);

  console.info(`Database size: ${(sqlFile.byteLength / 1e6).toPrecision(4)}MB`);
  const t1 = performance.now();
  await openDb(worker, sqlFile);
  console.info(`Database loaded in ${Math.round(performance.now() - t1)}ms`);
}

function openDb(worker: DbWorker, sqlFile: SqliteFile) {
  return performWorkerAction(worker, "open", { buffer: sqlFile });
}

function performWorkerAction(worker: DbWorker, action: string, payload = {}) {
  const id = getNewMessageId();
  return new Promise((resolve) => {
    worker.postMessage({ id, action, ...payload });

    const handleResponse = (event: MessageEvent) => {
      if (event.data.id === id) {
        worker.removeEventListener("message", handleResponse);
        resolve(event.data);
      }
    };

    worker.addEventListener("message", handleResponse);
  });
}

let messageId = 0;

function getNewMessageId() {
  return messageId++;
}
