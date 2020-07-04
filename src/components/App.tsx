import { default as React } from "react";
import { hot } from "react-hot-loader";
import { useSelector } from "react-redux";
import { useSearchWord } from "../hooks/searchWord";
import { selectWordId } from "../selectors/location";
import { SearchInput } from "./SearchInput";
import { SearchResults } from "./SearchResults";
import Word from "./Word";

function App() {
  const searchWord = useSearchWord();
  const wordid = useSelector(selectWordId);

  return (
    <div className="w-screen min-h-screen bg-gray-200">
      <div className={`mx-auto flex flex-wrap p-1 md:p-6 w-screen`}>
        <div className="flex-1 m-auto m-4 md:p-8">
          <div className="p-2 md:p-4 text-3xl text-red-800 text-center font-light">
            Wordnet
          </div>
          <SearchInput hidden={wordid > -1} {...{ searchWord }} />
          <SearchResults hidden={wordid > -1} {...{ searchWord }} />
          <Word hidden={wordid < 0} />
        </div>
      </div>
    </div>
  );
}

// @ts-ignore
export default hot(module)(App);
