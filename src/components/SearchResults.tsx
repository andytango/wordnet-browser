import { map } from "ramda";
import { default as React } from "react";
import { SearchResultWord, SearchWord } from "../hooks/searchWord";
import { SearchResult } from "./SearchResult";

export function SearchResults({
  hidden,
  searchWord,
}: {
  hidden: boolean;
  searchWord: SearchWord;
}) {
  const { loading, results } = searchWord;
  return !loading ? (
    <>
      <div
        className={`text-center font-bold my-6 min-w-full ${
          hidden ? "hidden" : ""
        }`}
      >
        {results.length} results found
      </div>
      <div className={`flex-1 min-w-full flex ${hidden ? "hidden" : ""}`}>
        <div className="mx-auto flex flex-wrap justify-center">
          {renderSearchResults(results)}
        </div>
      </div>
    </>
  ) : null;
}
const renderSearchResults = map(renderSearchResult);

function renderSearchResult(res: SearchResultWord) {
  return <SearchResult key={res.wordid} result={res} />;
}