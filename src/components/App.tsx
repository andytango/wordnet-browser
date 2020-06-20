import { default as React } from "react";
import { hot } from "react-hot-loader";
import { useSelector } from "react-redux";
import { SearchStateType } from "../reducers/search";
import { selectSearchState } from "../selectors/search";
import { SearchResults } from "./SearchResults";
import { SearchInput } from "./SearchInput";
import Word from "./Word";
import { selectWordLemma } from "../selectors/word";

function App() {
  const searchState = useSelector(selectSearchState);
  const wordLemma = useSelector(selectWordLemma);
  const wrapperClass =
    searchState === SearchStateType.WAITING ? "h-screen" : "";

  return (
    <div className="w-screen min-h-screen bg-gray-200">
      <div className={`mx-auto flex flex-wrap p-1 md:p-6 w-screen ${wrapperClass}`}>
        <div className="flex-1 m-auto m-4 md:p-8">
          <div className="p-2 md:p-4 text-3xl text-red-800 text-center font-light">
            Wordnet
          </div>
          <Word hidden={!wordLemma} />
          <SearchInput hidden={!!wordLemma} />
          <SearchResults hidden={!!wordLemma} />
        </div>
      </div>
    </div>
  );
}

export default hot(module)(App);
