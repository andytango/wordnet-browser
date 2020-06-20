import { default as React, useCallback } from "react";
import { ResultType, SearchResultWord } from "../db/search";
import { useDispatch } from "react-redux";
import { WordActionType } from "../reducers/word";
import { DbActionType } from "../dbMiddleware";
import wordSensesQuery from "../db/wordSenses";

export function SearchResult({ result }: { result: SearchResultWord }) {
  const { type, lemma, wordid } = result;
  const dispatch = useDispatch();

  const handleClick = useCallback(
    () =>
      dispatch({
        type: WordActionType.SELECT,
        word: { lemma, wordid },
        meta: {
          kind: DbActionType.EXEC,
          sql: wordSensesQuery(wordid),
        },
      }),
    [dispatch]
  );

  return (
    <a
      className={`m-2 p-3 rounded-md text-gray-200 cursor-pointer ${getBgClass(
        type
      )}`}
      onClick={handleClick}
    >
      {lemma}
    </a>
  );
}

function getBgClass(type: ResultType) {
  switch (type) {
    case ResultType.EXACT:
      return "bg-red-900";
    case ResultType.STEM:
      return "bg-gray-600";
    case ResultType.WILDCARD:
      return "bg-gray-500";
    default:
      throw new Error(`Unexpected result type ${type}`);
  }
}
