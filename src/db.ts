import { isNil, call } from "ramda";
// @ts-ignore
import sqlData from "./data/sqlite-wordnet.sqlite";
import { isBoolean, isNumber, isString } from "./helpers";

export type DbExec = (sql: string) => Promise<DbResponse>;

export interface DbResponse {
  error?: string;
  results?: DbResult[];
}

export interface DbResult {
  columns: string[];
  values: [][];
}

let dbInstance = null as DbExec | null;
let isDbInitialising = false;
let onInitialised = [] as ((dbExec: DbExec) => void)[];

export function getDbInstance(): Promise<DbExec> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (isDbInitialising) {
    return new Promise(enqueueDbInitCallback);
  }

  return initDb();
}

function enqueueDbInitCallback(res: (dbExec: DbExec) => void) {
  onInitialised.push((dbExec) => res(dbExec));
}

async function initDb(): Promise<DbExec> {
  isDbInitialising = true;
  const worker = initWorker();
  await loadSqliteFile(worker);
  console.log("[DB] Loaded file");
  isDbInitialising = false;
  const newInstance = createDbInterface(worker);
  dbInstance = newInstance;
  onInitialised.forEach((fn) => fn(newInstance));
  onInitialised = [];
  return dbInstance;
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
  console.debug("[DB]", e.data);
}

function handleWorkerError(e: ErrorEvent) {
  console.error("[DB]", e.error);
}

type SqliteFile = ArrayBuffer;

async function loadSqliteFile(worker: DbWorker) {
  const t0 = performance.now();
  const res = await fetch(sqlData);
  const sqlFile: SqliteFile = await res.arrayBuffer();
  console.info(`[DB] Database downloaded in ${getMsElapsedSince(t0)}`);

  console.info(`Database size: ${(sqlFile.byteLength / 1e6).toPrecision(4)}MB`);
  const t1 = performance.now();
  await openDb(worker, sqlFile);
  console.info(`[DB] Database loaded in ${getMsElapsedSince(t1)}`);
}

function openDb(worker: DbWorker, sqlFile: SqliteFile) {
  return performWorkerAction(worker, "open", { buffer: sqlFile });
}

function createDbInterface(worker: DbWorker) {
  return async (sql: string) => {
    console.debug("[DB] Performing query", sql);
    const { error, results } = await performWorkerAction(worker, "exec", {
      sql,
    });
    return { error, results };
  };
}

export function formatSql(strs: TemplateStringsArray, ...exprs: any[]) {
  let out: string[] = [];
  const n1 = strs.length;
  const n2 = exprs.length;

  for (let i = 0; i < n1; i++) {
    out.push(strs[i]);

    if (i < n2) {
      out.push(escapeSql(exprs[i]));
    }
  }

  return out.join("");
}

function escapeSql(ob: string | number): string {
  if (isString(ob)) {
    return `'${ob.replace(`'`, `''`)}'`;
  }

  if (isNumber(ob)) {
    return ob.toString();
  }

  if (isNil(ob)) {
    return "NULL";
  }

  if (isBoolean(ob)) {
    return ob ? "TRUE" : "FALSE";
  }

  throw new Error(`Could serialize sql: ${ob}`);
}

function performWorkerAction(
  worker: DbWorker,
  action: string,
  payload = {}
): Promise<DbResponse> {
  const id = getNewMessageId();
  return new Promise((resolve) => {
    const t0 = performance.now();
    worker.postMessage({ id, action, ...payload });

    const handleResponse = (event: MessageEvent) => {
      if (event.data.id === id) {
        console.info(`[DB] Query execution: ${getMsElapsedSince(t0)}`);
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

function getMsElapsedSince(since: number) {
  return formatTimeMs(performance.now() - since);
}

function formatTimeMs(ms: number) {
  return `${Math.round(ms)}ms`;
}
