import { default as React } from "react";
import { ResultType, SearchResultWord } from "../wn";

export function SearchResult({ result }: { result: SearchResultWord }) {
  const bgClass = getBgClass(result.type);
  return (
    <div className={`m-2 p-3 rounded-md text-gray-200 ${bgClass}`}>
      {result.lemma}
    </div>
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
