import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes } from "../routes";
import { selectSearchFromUrl } from "../selectors/location";
import { Senses } from "./Senses";

export default function Word({ hidden }) {
  return (
    <div className={`flex-1 flex flex-col w-full text-center ${hidden ? "hidden" : ""}`}>
      <BackButton />
      {!hidden && <Senses />}
    </div>
  );
}

function BackButton() {
  const dispatch = useDispatch();
  const search = useSelector(selectSearchFromUrl);

  const handleClick = useCallback(
    () => dispatch({ type: Routes.ROOT, query: { search } }),
    [dispatch, search]
  );

  return (
    <a
      className="inline-block md:m-2 p-3 rounded-md font-bold text-gray-600  cursor-pointer border-2 border-gray-600"
      onClick={handleClick}
    >
      Back to results for "{search}''
    </a>
  );
}
