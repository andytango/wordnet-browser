import { useCallback, useState, useEffect } from "react";
import { formatSql } from "../db";
import { makeDbQuery } from "./db";
import { useSelector, useDispatch } from "react-redux";
import { selectSearchFromUrl } from "../selectors/location";
import { Dispatch } from "redux";
import { dispatch } from "d3";
import { Routes } from "../routes";

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

const initialState = { timeout: -1 };

type QueryState = typeof initialState;

type SetQueryState = React.Dispatch<React.SetStateAction<QueryState>>;

export function useSearchWord() {
  const [queryState, setQueryState] = useState(initialState);
  const [{ loading, results }, execQuery] = useWordSearchQuery();
  const query = useSelector(selectSearchFromUrl);
  const dispatch = useDispatch();

  const handleChange = useCallback(
    (e) => {
      const { timeout } = queryState;
      const newQuery = e.target.value;

      if (newQuery !== query) {
        handleQueryChange(
          timeout,
          setQueryState,
          dispatch,
          e,
          execQuery,
          newQuery
        );
      }
    },
    [query, queryState, setQueryState]
  );

  useEffect(() => {
    if (query) {
      setQueryState({ timeout: setTimeout(() => execQuery(query), 400) });
    }
  }, []);

  return { query, loading, results, handleChange };
}

function handleQueryChange(
  timeout: number,
  setQueryState: SetQueryState,
  dispatch: Dispatch,
  e: any,
  execQuery: (...args: any[]) => void,
  newQuery: any
) {
  clearTimeout(timeout);
  dispatch({ type: Routes.ROOT, query: { search: newQuery } });

  if (newQuery) {
    setQueryState({ timeout: setTimeout(() => execQuery(newQuery), 400) });
  } else {
    setQueryState({ timeout: -1 });
  }
}
