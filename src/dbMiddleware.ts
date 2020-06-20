import { pathEq } from "ramda";
import { Dispatch } from "react";
import { Action, MiddlewareAPI } from "redux";
import { DbExec, DbResult, initDb } from "./db";

export function dbMiddleware({ dispatch }: MiddlewareAPI) {
  const dbClient = {} as { dbExec?: DbExec };

  initDb().then((dbExec: DbExec) => {
    dbClient.dbExec = dbExec;
  });

  return (next: Dispatch<any>) => (action: Action) => {
    if (isDbExecAction(action)) {
      performDbExec(dbClient, action, dispatch);
    }

    return next(action);
  };
}

export enum DbActionType {
  EXEC = "DB_EXEC",
  RESULT = "DB_RESULT",
  ERRPR = "DB_ERROR",
}

const isDbExecAction = pathEq(["meta", "kind"], DbActionType.EXEC) as (
  a: Action
) => a is DbExecAction;

export interface DbExecAction extends Action {
  meta: {
    sql: string;
    kind: DbActionType.EXEC;
  };
}

export interface DbResultMeta extends DbResult {
  sql: string;
  kind: DbActionType;
}

export interface DbResultAction extends Action {
  meta: DbResultMeta;
}

function performDbExec(
  { dbExec }: { dbExec?: DbExec },
  action: DbExecAction,
  dispatch: Dispatch<Action>
) {
  const { sql } = action.meta;

  if (dbExec) {
    dbExec(sql).then((result: DbResult) => {
      dispatch({
        type: action.type,
        meta: { sql, kind: DbActionType.RESULT, ...result },
      } as DbResultAction);
    });
  }
}

export const isDbResultAction = pathEq(["meta", "kind"], DbActionType.RESULT) as (
  a: Action
) => a is DbResultAction;