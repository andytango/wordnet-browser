import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { WordActionType } from "../reducers/word";
import { selectWordSenses } from "../selectors/word";
import { map } from "ramda";
import { WordSenseResult } from "../db/wordSenses";

export default function Word({ hidden }) {
  return (
    <div className={`w-full text-center ${hidden ? "hidden" : ""}`}>
      <BackButton />
      <Senses />
    </div>
  );
}

function BackButton() {
  const dispatch = useDispatch();
  const handleClick = useCallback(
    () => dispatch({ type: WordActionType.CLEAR }),
    [dispatch]
  );

  return (
    <a
      className="inline-block md:m-2 p-3 rounded-md font-bold text-gray-600  cursor-pointer border-2 border-gray-600"
      onClick={handleClick}
    >
      Back to results
    </a>
  );
}

function Senses() {
  const senses = useSelector(selectWordSenses);
  return <div>{renderSenses(senses)}</div>;
}

const renderSenses = map(renderSense);

function renderSense(sense: WordSenseResult) {
  return (
    <div
      className="bg-white rounded-lg p-6 my-6 max-w-screen-sm mx-auto text-left"
      key={sense.senseid}
    >
      <span className="text-gray-500 font-bold mr-2">{sense.pos}.&nbsp;</span>
      <span>{sense.definition}</span>
    </div>
  );
}
