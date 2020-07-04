import { default as React, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ResultType, SearchResultWord } from "../hooks/searchWord";
import { Routes } from "../routes";
import { selectSearchFromUrl } from "../selectors/location";

export function SearchResult({ result }: { result: SearchResultWord }) {
  const { type, lemma, wordid } = result;
  const search = useSelector(selectSearchFromUrl);
  const dispatch = useDispatch();

  const handleClick = useCallback(
    () =>
      dispatch({ type: Routes.WORD, payload: { wordid }, query: { search } }),
    [dispatch, wordid]
  );

  return (
    <a
      className={`m-1 md:m-2 p-2 md:p-3 rounded-md text-gray-200 cursor-pointer ${getBgClass(
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
