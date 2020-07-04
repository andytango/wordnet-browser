import { useCallback, useState } from "react";
import { formatSql } from "../db";
import { makeDbQuery } from "./db";

export enum ResultType {
  EXACT,
  STEM,
  WILDCARD,
}

interface Word {
  lemma: string;
  wordid: number;
}

export interface SearchResultWord extends Word {
  type: ResultType;
}

export type SearchWord = ReturnType<typeof useSearchWord>;

type SetQueryState = React.Dispatch<
  React.SetStateAction<{
    query: string;
    timeout: number;
  }>
>;

const useWordSearchQuery = makeDbQuery<SearchResultWord>(
  (query: string) => formatSql`
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
  LIMIT 1000`
);
const initialState = { query: "", timeout: -1 };

export function useSearchWord() {
  const [queryState, setQueryState] = useState(initialState);
  const [{ loading, results }, execQuery] = useWordSearchQuery();
  const { query } = queryState;

  const handleChange = useCallback(
    (e) => {
      const { query, timeout } = queryState;
      const newQuery = e.target.value;

      if (newQuery !== query) {
        handleQueryChange(timeout, setQueryState, e, execQuery, newQuery);
      }
    },
    [queryState, setQueryState]
  );

  return { query, loading, results, handleChange };
}

function handleQueryChange(
  timeout: number,
  setQueryState: SetQueryState,
  e: any,
  execQuery: (...args: any[]) => void,
  newQuery: any
) {
  clearTimeout(timeout);

  if (newQuery) {
    setQueryState({
      query: e.target.value,
      timeout: setTimeout(() => execQuery(newQuery), 400),
    });
  } else {
    setQueryState({ query: e.target.value, timeout: -1 });
  }
}
