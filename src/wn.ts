import { Dispatch } from "react";
import { formatSql } from "./db";
import { DbActionType } from "./dbMiddleware";

export enum ResultType {
  EXACT,
  STEM,
  WILDCARD,
}

export interface SearchResultWord {
  type: ResultType;
  wordid: number;
  lemma: string;
}

export async function performSearch(dispatch: Dispatch<any>, query: string) {
  dispatch({
    type: "SEARCH",
    meta: {
      kind: DbActionType.EXEC,
      sql: formatSql`
      SELECT min(type) AS type, wordid, lemma
      FROM (
        SELECT 0 as type, wordid, lemma
        FROM words
        WHERE lemma LIKE ${query}
        UNION
        SELECT 1 as type, wordid, lemma
        FROM words
        WHERE lemma LIKE ${query + "%"}
        UNION
        SELECT 2 as type, wordid, lemma
        FROM words
        WHERE lemma LIKE ${"%" + query + "%"}
      ) t
      GROUP BY wordid, lemma
      ORDER BY type
      LIMIT 1000`,
    },
  });
}
