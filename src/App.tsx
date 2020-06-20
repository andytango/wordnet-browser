import { map, tap } from "ramda";
import { default as React, useCallback, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { SearchResult } from "./components/SearchResult";
import { SearchActionType, SearchStateType } from "./reducers/search";
import { performSearch, SearchResultWord } from "./wn";
import { selectSearchState, selectSearchTerm, selectSearchResults } from "./selectors/search";

function App() {
  const searchState = useSelector(selectSearchState);
  const searchTerm = useSelector(selectSearchTerm);
  const searchResults = useSelector(selectSearchResults);
  const dispatch = useDispatch();
  const handleChange = useCallback(
    (e) => dispatch({ type: SearchActionType.QUERY, query: e.target.value }),
    [dispatch]
  );

  useEffect(() => {
    if (searchTerm.length > 1 && searchState != SearchStateType.SEARCHING) {
      performSearch(dispatch, searchTerm.replace(/\s/, ""));
    }
  }, [searchTerm]);

  const wrapperClass =
    searchState === SearchStateType.WAITING ? "h-screen" : "";

  const iconColor = searchTerm ? "text-red-800" : "text-gray-500";

  return (
    <div className="w-screen h-screen bg-gray-200">
      <div className={`mx-auto flex flex-wrap p-6 w-screen ${wrapperClass}`}>
        <div className="flex-1 max-w-sm m-auto m-4 p-8">
          <div className="p-4 text-3xl text-red-800 text-center font-light">
            Wordnet
          </div>
          <div>
            <span className={`absolute py-4 px-3 ${iconColor}`}>
              <FaSearch size="1.5em" />
            </span>
            <input
              className="bg-gray-100 text-center text-red-800 shadow-inner appearance-none border-2 border-gray-400 rounded w-full py-4 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-red-800"
              type="text"
              onChange={handleChange}
              value={searchTerm}
              placeholder="Type something..."
            />
          </div>
        </div>
        {searchState === SearchStateType.COMPLETE && (
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
        )}
      </div>
    </div>
  );
}

const renderSearchResults = map(renderSearchResult);

function renderSearchResult(res: SearchResultWord) {
  return <SearchResult key={res.wordid} result={res} />;
}

export default App;
