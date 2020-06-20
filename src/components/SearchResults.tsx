import { map } from "ramda";
import { default as React } from "react";
import { useSelector } from "react-redux";
import { SearchResult } from "./SearchResult";
import { SearchStateType } from "../reducers/search";
import {
  selectSearchResults,
  selectSearchState
} from "../selectors/search";
import { SearchResultWord } from "../db/search";
export function SearchResults() {
  const searchState = useSelector(selectSearchState);
  const searchResults = useSelector(selectSearchResults);

  return searchState === SearchStateType.COMPLETE ? (
    <>
      <div className="text-center font-bold mb-2 min-w-full">
        {searchResults.length} results found
      </div>
      <div className="flex-1 min-w-full flex">
        <div className="mx-auto flex flex-wrap justify-center">
          {renderSearchResults(searchResults)}
        </div>
      </div>
    </>
  ) : null;
}
const renderSearchResults = map(renderSearchResult);
function renderSearchResult(res: SearchResultWord) {
  return <SearchResult key={res.wordid} result={res} />;
}
