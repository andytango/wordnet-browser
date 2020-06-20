import { default as React, useCallback, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { SearchActionType, SearchStateType } from "../reducers/search";
import {
  selectSearchState,
  selectSearchTerm
} from "../selectors/search";
import { performSearch } from "../db/search";
export function SearchInput() {
  const searchState = useSelector(selectSearchState);
  const searchTerm = useSelector(selectSearchTerm);
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

  const iconColor = searchTerm ? "text-red-800" : "text-gray-500";

  return (
    <>
      <span className={`absolute py-4 px-3 ${iconColor}`}>
        <FaSearch size="1.5em" />
      </span>
      <input
        className="bg-gray-100 text-center text-red-800 shadow-inner appearance-none border-2 border-gray-400 rounded w-full py-4 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-red-800"
        type="text"
        onChange={handleChange}
        value={searchTerm}
        placeholder="Type something..." />
    </>
  );
}
