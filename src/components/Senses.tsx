import { map } from "ramda";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import senseLinksQuery from "../db/senseLinks";
import { WordSenseResult } from "../db/wordSenses";
import { DbActionType } from "../dbMiddleware";
import { SenseActionType } from "../reducers/sense";
import { selectWordSenses } from "../selectors/word";
import { selectActiveSense } from "../selectors/senseLinks";
import { FaArrowRight, FaWindowClose } from "react-icons/fa";

export function Senses() {
  const senses = useSelector(selectWordSenses);
  return <div>{renderSenses(senses)}</div>;
}

const renderSenses = map(renderSense);

function renderSense(sense: WordSenseResult) {
  return <Sense key={sense.synsetid} sense={sense} />;
}

function Sense({ sense }: { sense: WordSenseResult }) {
  const activeSynsetId = useSelector(selectActiveSense);
  const dispatch = useDispatch();
  const isActive = sense.synsetid === activeSynsetId;

  const handleClick = useCallback(() => {
    if (isActive) {
      dispatch({ type: SenseActionType.CLEAR });
    } else {
      dispatch({
        type: SenseActionType.SELECT,
        synsetid: sense.synsetid,
        meta: {
          kind: DbActionType.EXEC,
          sql: senseLinksQuery(sense.synsetid),
        },
      });
    }
  }, [dispatch, isActive, sense]);

  const activeClass = isActive || activeSynsetId < 0 ? "" : "hidden";

  return (
    <div
      className={`${activeClass} border-2 relative bg-white rounded-lg p-6 my-6 max-w-screen-sm mx-auto text-left`}
      onClick={handleClick}
    >
      <span className="text-gray-500 font-bold mr-2">{sense.pos}.&nbsp;</span>
      <span>{sense.definition}</span>
      <div className="absolute inset-y-0 right-0 text-right text-gray-500 flex text-xl items-center px-6">
        {isActive ? <FaWindowClose /> : <FaArrowRight />}
      </div>
    </div>
  );
}
