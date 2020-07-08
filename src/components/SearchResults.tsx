import { map, head } from "ramda";
import { default as React, useState, useEffect } from "react";
import { SearchResultWord, SearchWord } from "../hooks/searchWord";
import { SearchResult } from "./SearchResult";

export function SearchResults({ searchWord }: { searchWord: SearchWord }) {
  const { loading, results } = searchWord;
  const searchResults = head(results) || [];
  const [{ timeout, shouldShowLoading }, setLoadingTimeoutState] = useState({
    timeout: -1,
    shouldShowLoading: false,
  });

  useEffect(() => {
    clearTimeout(timeout);
    if (loading) {
      setLoadingTimeoutState({
        timeout: setTimeout(
          () =>
            setLoadingTimeoutState({
              timeout: -1,
              shouldShowLoading: true,
            }),
          200
        ),
        shouldShowLoading: false,
      });
    }

    if (shouldShowLoading) {
      setLoadingTimeoutState({ timeout: -1, shouldShowLoading: false });
    }
  }, [loading]);

  if (shouldShowLoading) {
    return (
      <div className="text-center font-bold my-6 min-w-full">
        Please wait...
      </div>
    );
  }

  return !loading && Array.isArray(searchResults) && searchResults.length ? (
    <>
      <div className="text-center font-bold my-6 min-w-full">
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
