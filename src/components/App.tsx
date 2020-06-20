import { default as React } from "react";
import { hot } from "react-hot-loader";
import { useSelector } from "react-redux";
import { SearchStateType } from "../reducers/search";
import {
  selectSearchState,
} from "../selectors/search";
import { SearchResults } from "./SearchResults";
import { SearchInput } from "./SearchInput";

function App() {
  const searchState = useSelector(selectSearchState);
  const wrapperClass =
    searchState === SearchStateType.WAITING ? "h-screen" : "";

  return (
    <div className="w-screen h-screen bg-gray-200">
      <div className={`mx-auto flex flex-wrap p-6 w-screen ${wrapperClass}`}>
        <div className="flex-1 max-w-sm m-auto m-4 p-8">
          <div className="p-4 text-3xl text-red-800 text-center font-light">
            Wordnet
          </div>
          <div>
            <SearchInput />
          </div>
        </div>
        <SearchResults />
      </div>
    </div>
  );
}

export default hot(module)(App);
