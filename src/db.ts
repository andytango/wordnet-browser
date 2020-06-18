import { isNil } from "ramda";
import sqlData from "./data/sqlite-wordnet.sqlite";
import { isBoolean, isNumber, isString } from "./helpers";

export interface DbResult {
  error?: string;
  results?: { columns: string[]; values: [][] }[];
}

export async function initDb() {
  const worker = initWorker();
  await loadSqliteFile(worker);
  console.log("loaded file");
  DbClient.sql = createDbInterface(worker).sql;
}

export function getDbClient() {
  return DbClient;
}

const DbClient = {
  sql: (strs: TemplateStringsArray, ...exprs: any[]) => {
    console.log("no-op");
    return Promise.resolve({} as DbResult);
  },
};

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
  console.info(`Database downloaded in ${getMsElapsedSince(t0)}`);

  console.info(`Database size: ${(sqlFile.byteLength / 1e6).toPrecision(4)}MB`);
  const t1 = performance.now();
  await openDb(worker, sqlFile);
  console.info(`Database loaded in ${getMsElapsedSince(t1)}`);
}

function openDb(worker: DbWorker, sqlFile: SqliteFile) {
  return performWorkerAction(worker, "open", { buffer: sqlFile });
}

function createDbInterface(worker: DbWorker) {
  console.log("createDbInterface");
  return {
    async sql(strs: TemplateStringsArray, ...exprs: any[]) {
      const sql = formatSql(strs, exprs);
      console.log("performing query", sql);
      const { error, results } = await performWorkerAction(worker, "exec", {
        sql,
      });
      return { error, results };
    },
  };
}

function formatSql(strs: TemplateStringsArray, exprs: any[]) {
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
): Promise<DbResult> {
  const id = getNewMessageId();
  return new Promise((resolve) => {
    const t0 = performance.now();
    worker.postMessage({ id, action, ...payload });

    const handleResponse = (event: MessageEvent) => {
      if (event.data.id === id) {
        console.debug(`[DB] Query execution: ${getMsElapsedSince(t0)}`);
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
