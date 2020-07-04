import { default as React } from "react";
import { FaSearch } from "react-icons/fa";
import { SearchWord } from "../hooks/searchWord";

export function SearchInput({
  hidden,
  searchWord,
}: {
  hidden: boolean;
  searchWord: SearchWord;
}) {
  const { query, handleChange } = searchWord;
  const iconColor = query ? "text-red-800" : "text-gray-500";

  return (
    <div className={`max-w-sm mx-auto ${hidden ? "hidden" : ""}`}>
      <span className={`absolute py-4 px-3 ${iconColor}`}>
        <FaSearch size="1.5em" />
      </span>
      <input
        className="bg-gray-100 text-center text-red-800 appearance-none border-2 border-gray-400 rounded w-full py-4 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-red-800"
        type="text"
        onChange={handleChange}
        value={query}
        placeholder="Type something..."
      />
    </div>
  );
}
